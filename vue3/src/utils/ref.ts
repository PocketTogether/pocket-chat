import type { Ref, ComputedRef } from 'vue'

// 一些响应式相关的工具

/**
 * 等待一个响应式数据满足指定条件。
 * 适用于 Ref 或 ComputedRef 类型的数据，通过传入判断函数，
 * 当该函数返回 true 时，Promise resolve；否则持续监听直到满足。
 *
 * @template T - 响应式数据的类型
 * @param source - 要监听的响应式数据（Ref 或 ComputedRef）
 * @param condition - 判断条件函数，接收当前值，返回 true 表示满足条件
 * @returns Promise<void> - 条件满足时 resolve，可用于异步流程控制
 *
 * @example
 * const count = ref(0)
 * await watchUntilSourceCondition(count, val => val >= 5)
 * console.log('✅ count 已达到 5')
 */
export const watchUntilSourceCondition = <T>(
  source: Ref<T> | ComputedRef<T>,
  condition: (value: T) => boolean
): Promise<void> => {
  return new Promise((resolve) => {
    // 如果初始值已满足条件，立即 resolve
    if (condition(source.value)) {
      return resolve()
    }

    // 启动响应式监听，直到条件满足
    const stop = watch(
      source,
      (val) => {
        if (condition(val)) {
          stop() // 停止监听，避免内存泄漏
          resolve()
        }
      },
      { immediate: true } // 立即执行一次，以应对初始值已满足的情况
    )
  })
}

/**
 * 等待 useQuery 查询完成（@tanstack/vue-query）。
 * 此版本使用 watchUntilSourceCondition 监听一个计算属性，
 * 判断是否处于请求过程中当 isLoading 和 isFetching 和 isPending 都为 false 时，认为查询完成。
 * 如发生错误，则抛出异常；否则正常返回。
 *
 * @param queryStatus - 包含 isLoading、isFetching、isPending（都是 Ref<boolean>）和可选的错误 Ref
 * @returns Promise<void> - 查询完成后 resolve，发生错误则 reject
 *
 * @example
 * const query = useQuery({ ... })
 * await watchUntilQueryReady(query)
 * console.log('✅ 查询完成:', query.data.value)
 */
export const watchUntilQueryReady = async (queryStatus: {
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  isPending: Ref<boolean>
  error?: Ref<unknown>
}): Promise<void> => {
  // 创建一个计算属性，表示是否仍在加载中
  const isQueryPending = computed(() => {
    return (
      queryStatus.isLoading.value ||
      queryStatus.isFetching.value ||
      queryStatus.isPending.value
    )
  })

  // 等待查询状态变为“非加载中”
  await watchUntilSourceCondition(isQueryPending, (pending) => !pending)

  // 查询完成后，判断是否有错误
  if (queryStatus.error?.value != null) {
    throw queryStatus.error.value
  }
}

/** 不等 isPending */
export const watchUntilQueryReadyWithoutIsPending = async (queryStatus: {
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  // isPending: Ref<boolean>
  error?: Ref<unknown>
}): Promise<void> => {
  // 创建一个计算属性，表示是否仍在加载中
  const isQueryPending = computed(() => {
    return (
      queryStatus.isLoading.value || queryStatus.isFetching.value
      // queryStatus.isPending.value
    )
  })

  // 等待查询状态变为“非加载中”
  await watchUntilSourceCondition(isQueryPending, (pending) => !pending)

  // 查询完成后，判断是否有错误
  if (queryStatus.error?.value != null) {
    throw queryStatus.error.value
  }
}

/**
 * useWatchSourceToHoldTime
 *
 * 在响应式变量发生变化时，控制其值至少保持一段时间，常用于过渡动画或防止闪烁。
 *
 * 注意其逻辑，其并不适合频繁连续3次及以上的变化，如isHolding结束后，发生的变化会立即响应
 *
 * 当 `source` 发生变化时，`sourceHaveHold` 会立即更新为新值，并保持至少 `holdMs` 毫秒；
 * 在此期间的进一步变化将被忽略，直到延迟结束后再同步一次最新值。
 *
 * This composable ensures that a reactive value remains stable for a minimum duration when it changes.
 * Useful for animations, loading indicators, or preventing rapid flicker in UI transitions.
 *
 * @template T - 任意响应式数据类型
 *
 * @param {Object} data - 配置项
 * @param {Ref<T> | ComputedRef<T>} data.source - 要监听的响应式变量
 * @param {number} data.holdMs - 状态保持的最短时间（毫秒）
 *
 * @returns {{
 *   isHolding: Ref<boolean>,
 *   sourceHaveHold: Ref<T>
 * }} 返回一个对象：
 * - `isHolding`: 当前是否处于保持期中
 * - `sourceHaveHold`: 代理状态变量，用于绑定动画或 UI 展示
 *
 * @example
 * ```ts
 * const loading = ref(false)
 * const { sourceHaveHold: loadingForAni } = useWatchSourceToHoldTime({
 *   source: loading,
 *   holdMs: 500
 * })
 * ```
 */
export const useWatchSourceToHoldTime = <T>(data: {
  /** 监听的响应式变量 */
  source: Ref<T> | ComputedRef<T>
  /** 控制其保持的时间（毫秒） */
  holdMs: number
}): {
  isHolding: Ref<boolean>
  sourceHaveHold: Ref<T>
} => {
  const { source, holdMs } = data
  const isHolding = ref(false)
  const sourceHaveHold = ref<T>(source.value) as Ref<T>
  watch(source, async () => {
    if (isHolding.value === true) {
      return
    }
    isHolding.value = true
    try {
      sourceHaveHold.value = source.value
      await new Promise((resolve) => setTimeout(resolve, holdMs))
      sourceHaveHold.value = source.value
    } finally {
      isHolding.value = false
    }
  })
  return {
    isHolding,
    sourceHaveHold,
  }
}

/**
 * useWatchSourceToHoldTimeAndStep
 *
 * 在响应式变量从初始值发生变化时，控制其值至少保持一段时间，保持的时间且以设置的值步进。
 * 主要用于加载动画，控制图标旋转，可以使其转的圈数为整数。
 *
 * 注意其逻辑，并不是每次变化都会保持
 * ```
 * 第一次（奇数次）变化时会立刻赋值并为此时设置的值保持时间。
 * 从第一次变为的值再改变时，也就是第二次（偶数次）变化时设置为的值，就不会保持时间。
 * 即第三次（奇数次）变化变化时会立刻赋值
 * ```
 *
 * This composable ensures that a reactive value is held for a minimum duration upon change,
 * and then updated only when a new change is detected during stepwise polling.
 * Especially useful for controlling animation rhythm, such as spinner rotation, to ensure full cycles.
 *
 * @template T - 任意响应式数据类型
 *
 * @param {Object} data - 配置项
 * @param {Ref<T> | ComputedRef<T>} data.source - 要监听的响应式变量
 * @param {number} data.holdMs - 初次变化后状态保持的最短时间（毫秒）
 * @param {number} data.stepMs - 保持期结束后的轮询步进间隔（毫秒）
 *
 * @returns {{
 *   isHolding: Ref<boolean>,
 *   sourceHaveHold: Ref<T>
 * }} 返回一个对象：
 * - `isHolding`: 当前是否处于保持或轮询阶段
 * - `sourceHaveHold`: 代理状态变量，用于绑定动画或 UI 展示
 *
 * @example
 * ```ts
 * const loading = ref(false)
 * const { sourceHaveHold: loadingForAni } = useWatchSourceToHoldTimeAndStep({
 *   source: loading,
 *   holdMs: 1000, // 控制动画至少转两圈
 *   stepMs: 500  // 每 500ms（转一圈） 检查一次是否需要更新
 * })
 * ```
 */
export const useWatchSourceToHoldTimeAndStep = <T>(data: {
  /** 监听的响应式变量 */
  source: Ref<T> | ComputedRef<T>
  /** 控制其保持的时间（毫秒） */
  holdMs: number
  /** 保持的时间步进值（毫秒） */
  stepMs: number
}): {
  isHolding: Ref<boolean>
  sourceHaveHold: Ref<T>
} => {
  const { source, holdMs, stepMs } = data
  const isHolding = ref(false)
  const sourceHaveHold = ref<T>(source.value) as Ref<T>
  watch(source, async () => {
    if (isHolding.value === true) {
      return
    }
    isHolding.value = true
    try {
      sourceHaveHold.value = source.value
      await new Promise((resolve) => setTimeout(resolve, holdMs))
      while (true) {
        if (sourceHaveHold.value !== source.value) {
          break
        }
        await new Promise((resolve) => setTimeout(resolve, stepMs))
      }
      sourceHaveHold.value = source.value
    } finally {
      isHolding.value = false
    }
  })
  return {
    isHolding,
    sourceHaveHold,
  }
}
