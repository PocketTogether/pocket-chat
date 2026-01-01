import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import { pbImagesGetOneApi, pbMessagesImageInfoMessageListApi } from '@/api'
import { queryConfig } from '@/config'
import { queryRetryPbNetworkError } from './query-retry'

export const useImagesGetOneQuery = (data: {
  imageId: ComputedRef<string | null>
}) => {
  const { imageId } = data

  const query = useQuery({
    enabled: computed(() => imageId.value != null),
    queryKey: computed(() => queryKeys.imagesGetOne(imageId.value)),
    queryFn: async () => {
      if (imageId.value == null) {
        throw new Error('imageId.value == null')
      }

      const pbRes = await pbImagesGetOneApi(imageId.value)

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

/** 查询使用某个图片的消息列表，分页 */
export const useImageInfoMessageListQuery = (data: {
  /** 页数 */
  pageNum: ComputedRef<number | null>
  /** 查询指定图片的 */
  imageId: ComputedRef<string | null>
}) => {
  const {
    //
    pageNum,
    imageId,
  } = data

  const query = useQuery({
    // 查询依赖，需 pageNum imageId
    enabled: computed(() => pageNum.value != null && imageId.value != null),
    queryKey: computed(() =>
      queryKeys.imageInfoMessageList(imageId.value, pageNum.value)
    ),
    queryFn: async () => {
      // 无pageNum，抛出错误
      if (pageNum.value == null) {
        throw new Error('pageNum.value == null')
      }
      // 无imageId，抛出错误
      if (imageId.value == null) {
        throw new Error('imageId.value == null')
      }
      // pb请求
      const pbRes = await pbMessagesImageInfoMessageListApi({
        pageNum: pageNum.value,
        imageId: imageId.value,
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
