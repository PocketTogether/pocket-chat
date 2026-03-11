import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import {
  pbMessagesSearchPageMessageListApi,
  type SearchPageSortModeType,
} from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'

/** 搜索页的消息列表，分页 */
export const useSearchPageMessageListQuery = (data: {
  /** 页数 */
  pageNum: ComputedRef<number | null>
  /** 排序方式 */
  sortMode: ComputedRef<SearchPageSortModeType | null>
  /** 搜索内容 */
  searchContent: ComputedRef<string | null>
  /** customStrId */
  customStrId?: ComputedRef<string | null>
}) => {
  const {
    //
    pageNum,
    sortMode,
    searchContent,
    customStrId,
  } = data

  const query = useQuery({
    // 查询依赖，需 pageNum sortMode
    enabled: computed(() => pageNum.value != null && sortMode != null),
    // 查询键（响应式）
    queryKey: computed(() =>
      queryKeys.searchPageMessageList(
        sortMode.value,
        searchContent.value,
        pageNum.value,
        customStrId?.value
      )
    ),
    queryFn: async () => {
      // 无pageNum sortMode，抛出错误
      if (pageNum.value == null) {
        throw new Error('pageNum.value == null')
      }
      if (sortMode.value == null) {
        throw new Error('sortMode.value == null')
      }

      // pb请求
      const pbRes = await pbMessagesSearchPageMessageListApi({
        sortMode: sortMode.value,
        searchContent: searchContent.value,
        pageNum: pageNum.value,
      })

      return pbRes
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
    // 即使查询键已更改，在请求新数据时，仍可显示上次成功获取的数据
    placeholderData: keepPreviousData,
  })

  return query
}
