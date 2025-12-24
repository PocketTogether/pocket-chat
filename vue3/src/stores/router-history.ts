import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import type {
  ImagesResponseWithBaseExpand,
  MessagesResponseWidthExpand,
  MessagesResponseWidthExpandReplyMessage,
  PMLRCApiParameters0DataPageParamNonNullable,
} from '@/api'
import type { ChatRoomMessagesLimitCursorValType } from '@/components'

type Route = ReturnType<typeof useRoute>

/** 路由信息栈中每一项的类型 */
export type RouterHistoryEntryType = {
  uuid: string
  name: Route['name']
  path: Route['path']
  fullPath: Route['fullPath']
}

/** ChatCol 所需要的页面恢复数据，也就是决定页面显示内容的所有数据 */
export type PageRecoverDataForChatColItemType = {
  uuid: string
  data: {
    chatRoomId: string
    twowayPositioningCursorData: PMLRCApiParameters0DataPageParamNonNullable | null
    linkPositioningFlagMessageId: string | null
    linkPositioningFlagShow: boolean
    replyPositioningFlagMessageId: string | null
    replyPositioningFlagShow: boolean
    chatRoomMessagesLimitTopCursor: ChatRoomMessagesLimitCursorValType
    chatRoomMessagesLimitBottomCursor: ChatRoomMessagesLimitCursorValType
    chatInputContent: string
    chatImageSelectList: ImagesResponseWithBaseExpand[]
    chatReplyMessage: MessagesResponseWidthExpandReplyMessage | null
    chatEditMessage: MessagesResponseWidthExpand | null
    chatMessageIsRealtimeTimeout: boolean
    dialogMessageId: string | null
    refScrollWarpScrollTop: number
    chatRoomMessagesRealtimeReadNumber: number
  }
}

/**
 * 自建路由历史栈，记录路由历史信息，可供每个页面设置自己的数据
 * - 主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）
 * - 也用于某些页面的顶栏的返回按钮，可判断前一历史是否为当前app（是则可以返回，不是则应转到首页）
 */
export const useRouterHistoryStore = defineStore(
  'pocket-together-router-history',
  () => {
    // 路由历史栈，记录路由历史信息
    const stack = ref<Array<RouterHistoryEntryType>>([])
    // 当前路由的uuid，未初始化等特殊情况时为null
    const currentUuid = ref<string | null>(null)

    /** 当前路由信息 */
    const currentRouterHistoryEntry = computed(() => {
      const find = stack.value.find((i) => i.uuid === currentUuid.value)
      return find
    })
    /** 当前前一个路由信息（用于判断返回，此值为null即代表当前app中没有上一页） */
    const currentPreviousRouterHistoryEntry = computed(() => {
      const findIndex = stack.value.findIndex(
        (i) => i.uuid === currentUuid.value
      )
      if (findIndex === -1) {
        return null
      }
      if (findIndex === 0) {
        return null
      }
      return stack.value[findIndex - 1]
    })

    // 【页面恢复数据】各路由页面恢复数据，主要用于路由返回时，页面中的数据恢复（返回时保持之前浏览的位置和数据）

    // 【页面恢复数据 ChatCol 】用于 ChatCol 的页面恢复数据
    const pageRecoverDataForChatCol = ref<
      Array<PageRecoverDataForChatColItemType>
    >([])
    // ChatCol 的页面恢复数据设置方法
    const pageRecoverDataForChatColItemSetFn = (
      val: PageRecoverDataForChatColItemType
    ) => {
      // 按uuid查找，找到则更新，找不到则添加
      const find = pageRecoverDataForChatCol.value.find(
        (i) => i.uuid === val.uuid
      )
      if (find != null) {
        find.data = val.data
        return 'update' as const
      } else {
        pageRecoverDataForChatCol.value.push(val)
        return 'push' as const
      }
    }
    // ChatCol 的页面恢复数据获取方法
    const pageRecoverDataForChatColItemGetFn = (uuid: string) => {
      const find = pageRecoverDataForChatCol.value.find((i) => i.uuid === uuid)
      return find
    }
    // 设置当前的 ChatCol 的页面恢复数据
    const currentSetPageRecoverDataForChatColItem = (
      data: PageRecoverDataForChatColItemType['data']
    ) => {
      if (currentUuid.value == null) {
        return null
      }
      return pageRecoverDataForChatColItemSetFn({
        uuid: currentUuid.value,
        data,
      })
    }
    // 获取当前的 ChatCol 的页面恢复数据
    const currentGetPageRecoverDataForChatColItem = () => {
      if (currentUuid.value == null) {
        return null
      }
      return pageRecoverDataForChatColItemGetFn(currentUuid.value)
    }

    const route = useRoute()

    /** 在router.afterEach中调用此函数，将检查history.state并控制路由历史栈相关的数据 */
    const routerAfterEachCheckHistoryStateAndControlRouterHistoryStack = () => {
      // 检查 history.state?.routorHistoryUuid 是否存在
      // 存在，说明上次路由改变为返回或前进 {
      //   检查 stack 中是否存在此uuid
      //   存在，是正常的，进行正常的操作 {
      //   将 currentUuid 赋值为 routorHistoryUuid
      //   }
      //   不存在，是不正常的，为了鲁棒性当作路由为push进行一些处理 {
      //   }
      // }
      // 不存在，说明上次路由改变为push {
      // 生成一个的uuid，replaceState将其加入
      // 整理 stack 将 currentUuid 之后的删除（push后这些内容就永远都不会被访问了）
      // 将当前路由信息加入 stack
      // 将 currentUuid 赋值为 routorHistoryUuid
      // }

      // 函数复用封装：push时的处理方法
      const handleRoutorHistoryForRoutorPushFn = (
        newRoutorHistoryUuidUuid: string
      ) => {
        // 整理 stack 将 currentUuid 之后的删除（因为push后这些内容就永远都不会被访问了）
        ;(() => {
          if (currentUuid.value == null) {
            return
          }
          const findIndex = stack.value.findIndex(
            (i) => i.uuid === currentUuid.value
          )
          if (findIndex === -1) {
            return
          }
          stack.value = stack.value.slice(0, findIndex + 1)
        })()
        // 将当前路由信息加入 stack
        stack.value.push({
          uuid: newRoutorHistoryUuidUuid,
          name: route.name,
          path: route.path,
          fullPath: route.fullPath,
        })
        // 将 currentUuid 赋值为 newRoutorHistoryUuidUuid
        currentUuid.value = newRoutorHistoryUuidUuid

        // 【页面恢复数据清理】对于各个路由页面恢复数据进行清理，只保留uuid在stack中存在的（将不可访问的删除）
        // 【页面恢复数据清理 ChatCol 】
        pageRecoverDataForChatCol.value =
          pageRecoverDataForChatCol.value.filter((i) => {
            const find = stack.value.find((item) => item.uuid === i.uuid)
            if (find != null) {
              return true
            }
            return false
          })
      }

      const routorHistoryUuid = history.state?.routorHistoryUuid
      // 检查 history.state?.routorHistoryUuid 是否存在
      // 存在，说明上次路由改变为返回或前进
      if (routorHistoryUuid != null && typeof routorHistoryUuid === 'string') {
        const find = stack.value.find((i) => i.uuid === routorHistoryUuid)
        // 检查 stack 中是否存在此uuid
        // 存在，是正常的，进行正常的操作
        if (find != null) {
          // 将 currentUuid 赋值为 routorHistoryUuid
          currentUuid.value = routorHistoryUuid
        }
        // 不存在，是不常见的，当页面刷新时会出现这种情况
        // 因为刷新时history.state不会改变，但前端重新加载让stack重置了
        // 当作路由行为为push进行处理
        else {
          handleRoutorHistoryForRoutorPushFn(routorHistoryUuid)
        }
      }
      // 不存在，说明上次路由改变为push
      else {
        // 生成一个的uuid，replaceState将其加入（设置为当前路由的uuid）
        const newRoutorHistoryUuidUuid = uuidv4()
        // 只修改State且保留其中原本存在的值
        history.replaceState(
          { ...history.state, routorHistoryUuid: newRoutorHistoryUuidUuid },
          '',
          location.href
        )
        handleRoutorHistoryForRoutorPushFn(newRoutorHistoryUuidUuid)
      }
    }

    return {
      stack,
      currentUuid,
      currentRouterHistoryEntry,
      currentPreviousRouterHistoryEntry,
      routerAfterEachCheckHistoryStateAndControlRouterHistoryStack,
      pageRecoverDataForChatCol,
      pageRecoverDataForChatColItemSetFn,
      pageRecoverDataForChatColItemGetFn,
      currentGetPageRecoverDataForChatColItem,
      currentSetPageRecoverDataForChatColItem,
    }
  }
)
