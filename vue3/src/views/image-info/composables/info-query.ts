import {
  queryKeys,
  useImageInfoMessageListQuery,
  useImagesGetOneQuery,
} from '@/queries'
import type { ImageInfoRouteParamsType } from './dependencies'
import { useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '@/stores'

export const useImageInfoQueryDesuwa = (data: {
  imageInfoRouteParams: ImageInfoRouteParamsType
}) => {
  const {
    //
    imageInfoRouteParams,
  } = data

  const imageId = computed(() => imageInfoRouteParams.value.id)

  const imagesGetOneQuery = useImagesGetOneQuery({
    imageId,
  })

  const imageInfoQueryStatus = computed(() => {
    // 有内容
    if (imagesGetOneQuery.data.value != null) {
      // 特殊情况已删除
      if (imagesGetOneQuery.data.value.isDeleted === true) {
        return 'isDeleted'
      }
      return 'content' as const
    }
    // 加载中
    if (
      imagesGetOneQuery.data.value == null &&
      imagesGetOneQuery.isFetching.value === true
    ) {
      return 'loading' as const
    }
    // 无内容（图片id不存在）
    return 'none' as const
  })

  const imageInfoMessageListPageNum = ref(1)

  const imageInfoMessageListQuery = useImageInfoMessageListQuery({
    pageNum: computed(() => imageInfoMessageListPageNum.value),
    imageId,
  })

  // 查询页数设置
  const imageInfoMessageListPageSet = (val: number) => {
    imageInfoMessageListPageNum.value = val
  }

  const queryClient = useQueryClient()

  // 是否正在刷新
  const isImageQueryRefreshRunning = ref(false)
  // 查询刷新
  const imageQueryRefresh = async () => {
    if (isImageQueryRefreshRunning.value) return
    isImageQueryRefreshRunning.value = true

    try {
      // 页面重置
      imageInfoMessageListPageNum.value = 1

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.imagesGetOne(imageId.value),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.imageInfoMessageList(imageId.value),
        }),
      ])
    } finally {
      isImageQueryRefreshRunning.value = false
    }
  }

  const authStore = useAuthStore()

  // 当前是否为发送者
  const isAuthorCurrent = computed(() => {
    if (
      imagesGetOneQuery.data.value == null ||
      authStore.isValid === false ||
      authStore.record?.id == null
    ) {
      return false
    }
    if (imagesGetOneQuery.data.value.author === authStore.record.id) {
      return true
    }
    return false
  })

  return {
    //
    imagesGetOneQuery,
    imageInfoQueryStatus,
    imageInfoMessageListQuery,
    imageInfoMessageListPageNum,
    imageInfoMessageListPageSet,
    imageQueryRefresh,
    isImageQueryRefreshRunning,
    isAuthorCurrent,
  }
}

export type ImageInfoQueryDesuwaType = ReturnType<
  typeof useImageInfoQueryDesuwa
>
