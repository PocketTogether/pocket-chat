import { usersStatusComputedRealtimeCheckIsOnlineThresholdMs } from '@/config'
import {
  useUsersNotViewingMarksInitGetListWithMapByUserProcessQuery,
  useUsersPresencesStatusInitGetListWithMapByUserProcessQuery,
} from '@/queries'
import {
  useRealtimeUsersNotViewingMarksStore,
  useRealtimeUsersPresencesStatusStore,
} from '@/stores'
import { useTimestamp } from '@vueuse/core'
import { effectScope } from 'vue'

/**
 * 【5722】
 * 模块级单例（懒初始化）缓存。
 *
 * 为什么需要单例？
 * ---------------
 * 本组合式函数内部中有 useTimestamp（每 2 秒的定时器），以及两个 init 查询的
 * 包装（useUsersPresencesStatusInitGetListWithMapByUserProcessQuery /
 * useUsersNotViewingMarksInitGetListWithMapByUserProcessQuery）。
 *
 * 在未优化前（直接导出的原始函数），它被以下多处重复调用：
 *   - useRealtimeUsersStatusComputedForUserRealtimeStatus （用户列表项/聊天消息）
 *   - useRealtimeUsersStatusComputedForUserRealtimeStatusWithLastOnline （用户详情页）
 *   - useRealtimeUsersStatusComputedForUserList （在线/最近活跃用户列表）
 *
 * 每调用一次，就会：
 *   - 新建一个 2 秒定时器（useTimestamp）
 *   - 新建一组 init 查询的响应式包装（TanStack Query 网络请求会去重，但响应式包装各自独立）
 *   多余实例白白占用 CPU 与内存，且本组合式函数整体只依赖全局 store / query，
 *   不依赖任何组件参数，天然适合全局共享一份。
 *
 * 为什么用模块级 let 变量（而不是 Vue 的 provide/inject）？
 * -------------------------------------------------------
 * 这是"最小改动"方案：所有现有调用方（user-realtime-status.ts / user-list.ts）
 * 的 import 与写法完全不变，零迁移成本；首次被调用时才惰性创建，之后全部复用同一实例。
 *
 * 为什么不直接 let 存实例就够了，还要 _scope？
 * -------------------------------------------
 * 关键风险：如果首次调用发生在某个「会销毁的组件」的 setup() 中，
 * 那么本次调用期间创建的 effect（computed 的依赖追踪）、以及 useTimestamp 内部
 * 通过 onScopeDispose 注册的定时器清理，都会绑定到「该组件的 effectScope」上。
 * 组件一旦卸载 → scope.stop() → 定时器被永久停掉、computed 失去响应活性
 * （值冻结成最后结果，不再更新）。而单例对象本身还活着，后续组件拿到的是
 * 一个"僵尸实例"，在线状态判断将全部失准。
 *
 * effectScope(true) 的作用：
 *   - effectScope 是 Vue 官方 API，用于把一组 effect 放进统一的生命周期容器
 *   - 参数 true = detached（脱离父级），该 scope 不随任何组件销毁而连锁 stop
 *   - 在 _scope.run() 内创建的所有 effect / onScopeDispose 清理回调，
 *     都注册在这个独立 scope 上，与任何组件生命周期无关，活到应用结束
 *
 * 这也是 VueUse 官方 createGlobalState / createSharedComposable 的实现思路。
 * 注意：Pinia store 与 TanStack Query 本就是全局的，不受组件销毁影响，
 * 此方案真正需要防护的只有 useTimestamp 这类带 onScopeDispose 的副作用。
 */
let _instance: RealtimeUsersStatusComputedType | null = null

// 独立（detached）effectScope：作为全局单例的"永驻宿主"，任何组件销毁都不会波及它
const _scope = effectScope(true)

/** 【已优化的】懒初始化全局单例：首次调用时创建，之后复用同一实例 */
export const useRealtimeUsersStatusComputed = () => {
  if (_instance == null) {
    // 在 _scope 内创建，使定时器/computed 注册到独立作用域，不随组件销毁
    _instance = _scope.run(() => {
      return useRealtimeUsersStatusComputedWithoutOptimization()
    })!
  }
  return _instance
}

/**
 * 【未优化的】原始实现，仅被全局单例 useRealtimeUsersStatusComputed 调用一次。
 * 保留该命名以明确它不应被直接多处调用。
 *
 * 用于供其他地方使用实时数据的组合式函数
 * 就是会使用两个store中的数据，有一些函数和计算属性以供外界使用
 */
const useRealtimeUsersStatusComputedWithoutOptimization = () => {
  // 用户实时状态相关store
  const realtimeUsersPresencesStatusStore =
    useRealtimeUsersPresencesStatusStore()
  const realtimeUsersNotViewingMarksStore =
    useRealtimeUsersNotViewingMarksStore()

  const {
    /** 初始的一些用户的状态 latest map */
    usersPresencesStatusInitLatestMapByUser,
    /** 初始的一些用户的状态 earliest map */
    usersPresencesStatusInitEarliestMapByUser,
  } = useUsersPresencesStatusInitGetListWithMapByUserProcessQuery()

  const {
    /** 初始的一些NotViewingMarks latest map */
    usersNotViewingMarksInitLatestMapByUser,
  } = useUsersNotViewingMarksInitGetListWithMapByUserProcessQuery()

  /**
   * 每秒更新一次的响应式时间戳，不需要太频繁，
   * 因为只有isOnline的判断使用它，其它的状态都是根据数据的
   */
  const nowRefTimestamp = useTimestamp({
    interval: 2000, // 2000ms
  })

  /**
   * 获取用户状态（不含 isOnline）
   * 不依赖 nowRefTimestamp，避免频繁重算
   */
  const getStatusByUserId = (userId: string) => {
    // 最新实时 presence 状态（来自实时订阅）
    const latestPresence =
      realtimeUsersPresencesStatusStore.statusLatestMapByUser.get(userId)

    // 最新实时 not-viewing-marks 状态（来自实时订阅）
    const latestNotViewingMark =
      realtimeUsersNotViewingMarksStore.marksMapByUser.get(userId)

    // 初始化查询得到的最新 presence 状态（订阅启动前的历史数据）
    const initLatestPresence =
      usersPresencesStatusInitLatestMapByUser.value.get(userId)

    // 初始化查询得到的最新 not-viewing-marks 状态（订阅启动前的历史数据）
    const initLatestNotViewingMark =
      usersNotViewingMarksInitLatestMapByUser.value.get(userId)

    /**
     * base 状态：
     * - 优先使用实时最新 presence 状态（用户状态集合 userPresencesStatus）
     * - 若没有实时状态，则使用初始化查询得到的最新状态
     *
     * basePresence 是最终用于返回 isTyping / created 的基础记录
     */
    const basePresence = (() => {
      if (latestPresence != null) {
        return latestPresence
      }
      if (initLatestPresence != null) {
        return initLatestPresence
      }
      return null
    })()
    if (basePresence == null) {
      return null
    }

    const baseLatestNotViewingMark = (() => {
      if (latestNotViewingMark != null) {
        return latestNotViewingMark
      }
      if (initLatestNotViewingMark != null) {
        return initLatestNotViewingMark
      }
      return null
    })()

    /**
     * isNotViewing
     * - baseLatestNotViewingMark
     *   如果 UsersNotViewingMarks 的个记录的创建时间更大，那就指的是用户是屏幕正在不显示状态
     * - basePresence
     *   如果 UsersPresencesStatus 的个记录的创建时间更大，那就以其内容为准
     */
    /**
     * isNotViewing 判定逻辑（使用 IIFE）
     *
     * 背景说明：
     * 用户状态集合 userPresencesStatus：
     *   - 每 50 秒前端会创建一条记录
     *   - 包含 isNotViewing（屏幕是否正在显示）
     *   - created 字段用于判断是否在线（100 秒内）
     *
     * 用户离开事件集合 userNotViewingMarks：
     *   - 在 visibilitychange hidden 时创建
     *   - 使用 navigator.sendBeacon，无鉴权
     *   - 主要用于“标签页关闭前”快速上报不显示状态
     *
     * 判定规则：
     * 1. 如果用户离开事件集合（not-viewing-marks）的最新记录时间 > basePresence.created
     *    → 认为用户“屏幕正在不显示”
     *
     * 2. 否则（presence 更新更晚）
     *    → 以 basePresence.isNotViewing 为准
     *
     * 这样可以统一处理：
     * - 用户切换标签页、最小化窗口、关闭标签页
     * - 用户状态集合的正常轮询更新
     */
    const isNotViewing = (() => {
      // 情况 1：存在 baseLatestNotViewingMark ，与 basePresence 进行比较
      if (baseLatestNotViewingMark != null) {
        // baseLatestNotViewingMark.created 更大，则判定为 isNotViewing=true
        if (baseLatestNotViewingMark.created > basePresence.created) {
          return true
        }
        // 否则以 basePresence 内容为准
        return basePresence.isNotViewing
      }
      // 情况 2：不存在 baseLatestNotViewingMark ，即只有 basePresence
      // 直接使用 basePresence.isNotViewing
      return basePresence.isNotViewing
    })()

    return {
      isNotViewing,
      isTyping: basePresence.isTyping,
      statusIsoDate: basePresence.created,
    }
  }

  const checkIsOnlineByStatusIsoDate = (statusIsoDate: string) => {
    const ts = new Date(statusIsoDate).getTime()
    return (
      nowRefTimestamp.value - ts <=
      usersStatusComputedRealtimeCheckIsOnlineThresholdMs
    )
  }

  /**
   * 获取用户状态 + 是否在线
   */
  const getStatusByUserIdWithIsOnline = (userId: string) => {
    const status = getStatusByUserId(userId)
    if (!status) return null

    const isOnline = checkIsOnlineByStatusIsoDate(status.statusIsoDate)

    return {
      ...status,
      isOnline,
    }
  }

  /**
   * 判断是否在线
   */
  const getIsOnlineByUserId = (userId: string) => {
    const status = getStatusByUserId(userId)
    if (!status) return false

    return checkIsOnlineByStatusIsoDate(status.statusIsoDate)
  }

  return {
    //
    getStatusByUserId,
    getStatusByUserIdWithIsOnline,
    checkIsOnlineByStatusIsoDate,
    getIsOnlineByUserId,
    realtimeUsersPresencesStatusStore,
    usersPresencesStatusInitLatestMapByUser,
    usersPresencesStatusInitEarliestMapByUser,
  }
}

type RealtimeUsersStatusComputedType = ReturnType<
  typeof useRealtimeUsersStatusComputedWithoutOptimization
>
