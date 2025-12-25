import { useQuery } from '@tanstack/vue-query'
import { queryKeys } from './query-keys'
import { pbImagesGetOneApi } from '@/api'
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
