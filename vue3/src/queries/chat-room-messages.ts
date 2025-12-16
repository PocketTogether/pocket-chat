import { useInfiniteQuery, useQuery } from '@tanstack/vue-query'
import { type MessagesResponse } from '@/lib'
import {
  pbMessagesGetOneApi,
  pbMessagesListRoomCursorApi,
  pbMessagesListRoomCursorNextIncludeCursorApi,
  pbMessagesListRoomCursorNextNotIncludeCursorApi,
  pbMessagesListRoomCursorNextPageParamNullApi,
  pbMessagesListRoomCursorPreviousNotIncludeCursorApi,
  type PMLRCApiParameters0DataPageParamNonNullable,
  type PMLRCApiReturnType,
  type PMLRCApiReturnTypeItem,
} from '@/api'
import { queryKeys } from './query-keys'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'
import { useRealtimeMessagesStore } from '@/stores'
import { pickInfiniteQueryFields } from '@/utils'

/** 聊天页消息 游标分页无限查询 单向 */
export const useChatRoomMessagesInfiniteQuery = (data: {
  roomId: ComputedRef<string | null>
}) => {
  const { roomId } = data

  const infiniteQuery = useInfiniteQuery({
    // 查询依赖，需 roomId
    enabled: computed(() => roomId.value != null),
    queryKey: computed(() => queryKeys.chatRoomMessagesInfinite(roomId.value)),
    queryFn: async ({
      pageParam,
    }: {
      pageParam: PMLRCApiParameters0DataPageParamNonNullable | null
    }) => {
      // 无 roomId ，抛出错误
      if (roomId.value == null) {
        throw new Error('dialogMessageId.value == null')
      }

      const pbRes = await pbMessagesListRoomCursorApi({
        roomId: roomId.value,
        pageParam,
      })

      return pbRes
    },
    initialPageParam: null,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.items.length === 0 || lastPage.totalPages === 1) {
        return undefined
      }
      return lastPage.items[lastPage.items.length - 1]
    },
    // 缓存时间
    // gcTimeInfinity staleTimeStatic 避免useInfiniteQuery的多页refetch
    // note\笔记\250911-避免useInfiniteQuery的多页refetch.md
    gcTime: queryConfig.gcTimeInfinity,
    staleTime: queryConfig.staleTimeStatic,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return infiniteQuery
}

/** 对于双向查询 pageParam 中还需要方向信息 */
type PageParamTwowayInfo = {
  direction: // initial 初次查询
  | 'initial'
    // next 向更旧的查询 即在顶部加载更多
    | 'next'
    // previous 向更新的查询 即在底部加载更多
    | 'previous'
}

// useChatRoomMessagesInfiniteTwowayQuery 中的 queryFn pageParam 的类型
type ChatRoomMessagesInfiniteTwowayQueryPageParamType =
  | (PMLRCApiParameters0DataPageParamNonNullable & PageParamTwowayInfo)
  | null

// useChatRoomMessagesInfiniteTwowayQuery 中的 queryFn 返回类型
type ChatRoomMessagesInfiniteTwowayQueryQueryFnReturnType = {
  // 数据，Previous的需反转
  items: PMLRCApiReturnTypeItem[]
  // next 向更旧的查询 的相关信息
  queryNextInfo: Omit<PMLRCApiReturnType, 'items'> | null
  // previous 向更新的查询 的相关信息
  queryPreviousInfo: Omit<PMLRCApiReturnType, 'items'> | null
}

/** 聊天页消息 游标分页无限查询 双向 */
export const useChatRoomMessagesInfiniteTwowayQuery = (data: {
  roomId: ComputedRef<string | null>
  twowayPositioningCursorData: ComputedRef<PMLRCApiParameters0DataPageParamNonNullable | null>
}) => {
  const { roomId, twowayPositioningCursorData } = data

  const realtimeMessagesStore = useRealtimeMessagesStore()

  // queryKey 将被导出以便使用
  const queryKey = computed(() =>
    queryKeys.chatRoomMessagesInfiniteTwoway(
      roomId.value,
      twowayPositioningCursorData.value
    )
  )

  const infiniteQuery = useInfiniteQuery({
    // 查询依赖，需 roomId，需待消息实时订阅完成
    enabled: computed(() => {
      if (roomId.value == null) {
        return false
      }
      if (realtimeMessagesStore.isSubscribeReady === false) {
        return false
      }
      return true
    }),
    // 要和上面的queryKey保持一致，这里不直接用queryKey而是再写一遍，是为了符合eslint(@tanstack/query/exhaustive-deps)
    queryKey: computed(() =>
      queryKeys.chatRoomMessagesInfiniteTwoway(
        roomId.value,
        twowayPositioningCursorData.value
      )
    ),
    queryFn: async ({
      pageParam,
    }: {
      pageParam: ChatRoomMessagesInfiniteTwowayQueryPageParamType
    }): Promise<ChatRoomMessagesInfiniteTwowayQueryQueryFnReturnType> => {
      // 无 roomId ，抛出错误
      if (roomId.value == null) {
        throw new Error('dialogMessageId.value == null')
      }

      if (pageParam == null) {
        // pageParam == null 即无游标，查询最新的（和单向查询类似）
        const pbMessagesListRoomCursorNextPageParamNullApiRes =
          await pbMessagesListRoomCursorNextPageParamNullApi({
            roomId: roomId.value,
          })
        const queryNextInfo = (() => {
          const { page, perPage, totalPages, totalItems } =
            pbMessagesListRoomCursorNextPageParamNullApiRes
          return { page, perPage, totalPages, totalItems }
        })()
        return {
          items: pbMessagesListRoomCursorNextPageParamNullApiRes.items,
          queryNextInfo,
          queryPreviousInfo: null,
        }
      } else {
        // pageParam != null 即有游标
        if (pageParam.direction === 'next') {
          // pageParam.direction === 'next'
          const pbMessagesListRoomCursorNextNotIncludeCursorApiRes =
            await pbMessagesListRoomCursorNextNotIncludeCursorApi({
              roomId: roomId.value,
              pageParam,
            })
          const queryNextInfo = (() => {
            const { page, perPage, totalPages, totalItems } =
              pbMessagesListRoomCursorNextNotIncludeCursorApiRes
            return { page, perPage, totalPages, totalItems }
          })()
          return {
            items: pbMessagesListRoomCursorNextNotIncludeCursorApiRes.items,
            queryNextInfo,
            queryPreviousInfo: null,
          }
        } else if (pageParam.direction === 'previous') {
          // pageParam.direction === 'previous'
          const pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes =
            await pbMessagesListRoomCursorPreviousNotIncludeCursorApi({
              roomId: roomId.value,
              pageParam,
            })
          const queryPreviousInfo = (() => {
            const { page, perPage, totalPages, totalItems } =
              pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes
            return { page, perPage, totalPages, totalItems }
          })()
          return {
            items: [
              ...pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes.items,
            ].reverse(),
            queryNextInfo: null,
            queryPreviousInfo,
          }
        } else {
          // pageParam.direction === 'initial'
          const pbMessagesListRoomCursorNextIncludeCursorApiRes =
            await pbMessagesListRoomCursorNextIncludeCursorApi({
              roomId: roomId.value,
              pageParam,
            })
          const pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes =
            await pbMessagesListRoomCursorPreviousNotIncludeCursorApi({
              roomId: roomId.value,
              pageParam,
            })
          const queryNextInfo = (() => {
            const { page, perPage, totalPages, totalItems } =
              pbMessagesListRoomCursorNextIncludeCursorApiRes
            return { page, perPage, totalPages, totalItems }
          })()
          const queryPreviousInfo = (() => {
            const { page, perPage, totalPages, totalItems } =
              pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes
            return { page, perPage, totalPages, totalItems }
          })()
          // 需将 itemsNext 与 itemsPrevious 合并
          const items = (() => {
            const itemsNext =
              pbMessagesListRoomCursorNextIncludeCursorApiRes.items
            const itemsPrevious = [
              ...pbMessagesListRoomCursorPreviousNotIncludeCursorApiRes.items,
            ].reverse()
            return [...itemsPrevious, ...itemsNext]
          })()
          return {
            items,
            queryNextInfo,
            queryPreviousInfo,
          }
        }
      }
    },
    initialPageParam: computed(
      (): ChatRoomMessagesInfiniteTwowayQueryPageParamType => {
        if (twowayPositioningCursorData.value == null) {
          return null
        }
        return {
          ...twowayPositioningCursorData.value,
          direction: 'initial',
        }
      }
    ),
    // Next
    getNextPageParam: (
      lastPage,
      pages
    ): ChatRoomMessagesInfiniteTwowayQueryPageParamType | undefined => {
      // lastPage.items.length === 0 即此页无数据，返回 undefined 即没有下一页
      if (lastPage.items.length === 0) {
        return undefined
      }
      // lastPage.queryNextInfo == null 是异常情况，返回 undefined 当作没有下一页处理
      if (lastPage.queryNextInfo == null) {
        console.error('lastPage.queryNextInfo == null')
        return undefined
      }
      // lastPage.queryNextInfo.totalPages === 1 即上次查询的总页数只有1页，即没有下一页，返回 undefined
      // 【251104】 === 1 改为 <= 1 ，因为其在查询到0个项目时totalPages是为0的
      if (lastPage.queryNextInfo.totalPages <= 1) {
        return undefined
      }
      const cursorItem = lastPage.items[lastPage.items.length - 1]
      return {
        ...cursorItem,
        direction: 'next',
      }
    },
    // Previous
    getPreviousPageParam: (
      firstPage,
      pages
    ): ChatRoomMessagesInfiniteTwowayQueryPageParamType | undefined => {
      // firstPage.items.length === 0 即此页无数据，返回 undefined 即没有下一页
      if (firstPage.items.length === 0) {
        return undefined
      }
      // firstPage.queryPreviousInfo == null ，当前查询是从最新的项开始的会是这种情况，返回 undefined 即没有下一页
      if (firstPage.queryPreviousInfo == null) {
        return undefined
      }
      // firstPage.queryPreviousInfo.totalPages === 1 即上次查询的总页数只有1页，即没有下一页，返回 undefined
      // 【251104】 === 1 改为 <= 1 ，因为其在查询到0个项目时totalPages是为0的
      if (firstPage.queryPreviousInfo.totalPages <= 1) {
        return undefined
      }

      const cursorItem = firstPage.items[0]
      return {
        ...cursorItem,
        direction: 'previous',
      }
    },
    // 缓存时间
    // gcTimeInfinity staleTimeStatic 避免useInfiniteQuery的多页refetch
    // note\笔记\250911-避免useInfiniteQuery的多页refetch.md
    gcTime: queryConfig.gcTimeInfinity,
    staleTime: queryConfig.staleTimeStatic,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })

  return {
    queryKey,

    // ...infiniteQuery,
    ...pickInfiniteQueryFields(infiniteQuery),
  }
}

/** 聊天页消息 GetOne */
export const useChatRoomMessagesGetOneQuery = (data: {
  messageId: ComputedRef<string | null>
}) => {
  const { messageId } = data

  const query = useQuery({
    // 查询依赖，需 messageId
    enabled: computed(() => messageId.value != null),
    // 查询键（响应式）
    queryKey: computed(() => queryKeys.chatRoomMessagesGetOne(messageId.value)),
    queryFn: async () => {
      // 无消息id，抛出错误
      if (messageId.value == null) {
        throw new Error('messageId.value == null')
      }
      // pb请求
      const pbRes = await pbMessagesGetOneApi(messageId.value)

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
