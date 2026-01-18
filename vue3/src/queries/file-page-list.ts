import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import { pbFilePageListApi } from '@/api'
import { queryRetryPbNetworkError } from './query-retry'
import { queryConfig } from '@/config'

export const useFilePageListQuery = (data: {
  /** 页数 */
  pageNum: ComputedRef<number | null>
  /** 查询指定用户的 */
  authorId: ComputedRef<string | null>
  /** 搜索内容 */
  searchContent: ComputedRef<string | null>
  /** customStrId */
  customStrId?: ComputedRef<string | null>
}) => {
  const {
    //
    pageNum,
    authorId,
    searchContent,
    customStrId,
  } = data

  const query = useQuery({
    // 查询依赖，需 pageNum
    enabled: computed(() => pageNum.value != null),
    // 查询键（响应式）
    queryKey: computed(() =>
      queryKeys.filePageList(
        authorId.value,
        searchContent.value,
        pageNum.value,
        customStrId?.value
      )
    ),
    queryFn: async () => {
      // 无pageNum，抛出错误
      if (pageNum.value == null) {
        throw new Error('pageNum.value == null')
      }

      // pb请求
      const pbRes = await pbFilePageListApi(pageNum.value, {
        author: authorId.value,
        search: searchContent.value,
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
