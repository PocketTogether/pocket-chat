import { keepPreviousData, useQueries, useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import {
  pbUsersGetOneApi,
  pbMessagesUserInfoMessageListApi,
  type UsersResponseWithBaseExpand,
} from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'

export const useUsersGetOneQuery = (data: {
  userId: ComputedRef<string | null>
}) => {
  const { userId } = data

  const query = useQuery({
    enabled: computed(() => userId.value != null),
    queryKey: computed(() => queryKeys.usersGetOne(userId.value)),
    queryFn: async () => {
      if (userId.value == null) {
        throw new Error('userId.value == null')
      }

      const pbRes = await pbUsersGetOneApi(userId.value)

      // TODO 持久化

      return pbRes
    },
    // TODO 占位数据
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}

// 我只想根据 userIds 响应式读取缓存，不请求
/**
 * useUsersGetOneQueriesForCache
 *
 * 基于 userIds 的「仅从缓存读取」版本的查询 Hook。
 * 本 Hook **不会触发任何网络请求**，仅通过 `queryKey` 订阅 TanStack Query 的缓存，
 * 并以响应式方式返回缓存中的数据。
 *
 * ## 适用场景
 * - 你已经在其他地方（例如列表页、详情页）获取过文件数据
 * - 你希望根据多个 userId 响应式地读取缓存中的数据
 * - 你不希望再次发起请求（例如避免重复请求、节省流量、提升性能）
 *
 * ## 行为说明
 * - `enabled: false`：确保不会执行 `queryFn`，也不会触发任何 fetch
 * - 不提供 `queryFn`：因为本 Hook 的目的就是只读缓存
 * - 如果缓存中存在对应 `queryKey` 的数据，则会返回该数据
 * - 如果缓存中不存在数据，则对应项的 `data` 为 `undefined`
 * - 结果完全响应式：当其他地方更新了缓存，本 Hook 的返回值会自动更新
 *
 * ## 参数
 * @param {ComputedRef<(string | null)[]>} userIds
 *   文件 ID 列表，`null` 会被自动过滤。
 *
 * ## 返回值
 * @returns {ComputedRef<Array<UseQueryReturnType>>}
 *   返回一个数组，每个元素对应一个 userId 的查询结果。
 *   每个查询结果都反映当前缓存状态（data、status、error 等）。
 *
 * ## 示例
 * ```ts
 * const userIds = computed(() => ['a1', 'b2', 'c3'])
 * const queries = useUsersGetOneQueriesForCache({ userIds })
 *
 * // queries.value[0].data → 缓存中 user a1 的数据
 * // queries.value[1].data → 缓存中 user b2 的数据
 * // queries.value[2].data → 缓存中 user c3 的数据
 * ```
 */
export const useUsersGetOneQueriesForCache = (data: {
  userIds: ComputedRef<(string | null)[]>
}) => {
  const { userIds } = data

  const queries = computed(() =>
    userIds.value
      .filter((id): id is string => id != null)
      .map((id) => ({
        enabled: false, // ❗ 永不请求
        queryKey: queryKeys.usersGetOne(id),
        // queryFn 只为提供类型
        queryFn: (() => {}) as () => UsersResponseWithBaseExpand,
      }))
  )

  return useQueries({ queries })
}

/**
 * useUserGetOneQueryForCache
 *
 * 基于 userId 的「仅从缓存读取」版本的查询 Hook。
 * 本 Hook **不会触发任何网络请求**，仅通过 `queryKey` 订阅 TanStack Query 的缓存，
 * 并以响应式方式返回缓存中的数据。
 *
 * @param {ComputedRef<string | null>} userId
 *   单个文件 ID，null 时不会订阅任何缓存。
 *
 * @returns {UseQueryReturnType}
 *   返回一个查询对象，反映当前缓存状态（data、status、error 等）。
 */
export const useUsersGetOneQueryForCache = (data: {
  userId: ComputedRef<string | null>
}) => {
  const { userId } = data

  const query = useQuery({
    enabled: false, // ❗ 永不请求
    queryKey: computed(() =>
      userId.value != null
        ? queryKeys.usersGetOne(userId.value)
        : ['__no_user__']
    ),
    // 只为类型，不会被调用
    queryFn: (() => {}) as () => UsersResponseWithBaseExpand,
  })

  return query
}

/** 查询某个用户的消息列表，分页 */
export const useUserInfoMessageListQuery = (data: {
  /** 页数 */
  pageNum: ComputedRef<number | null>
  /** 查询指定文件的 */
  userId: ComputedRef<string | null>
}) => {
  const {
    //
    pageNum,
    userId,
  } = data

  const query = useQuery({
    // 查询依赖，需 pageNum userId
    enabled: computed(() => pageNum.value != null && userId.value != null),
    queryKey: computed(() =>
      queryKeys.userInfoMessageList(userId.value, pageNum.value)
    ),
    queryFn: async () => {
      // 无pageNum，抛出错误
      if (pageNum.value == null) {
        throw new Error('pageNum.value == null')
      }
      // 无userId，抛出错误
      if (userId.value == null) {
        throw new Error('userId.value == null')
      }
      // pb请求
      const pbRes = await pbMessagesUserInfoMessageListApi({
        pageNum: pageNum.value,
        userId: userId.value,
      })

      return pbRes
    },
    // 即使查询键已更改，在请求新数据时，仍可显示上次成功获取的数据
    placeholderData: keepPreviousData,
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return query
}
