import {
  queryKeys,
  useFileInfoMessageListQuery,
  useFilesGetOneQuery,
} from '@/queries'
import type { FileInfoRouteParamsType } from './dependencies'
import { useQueryClient } from '@tanstack/vue-query'
import { useAuthStore, useRealtimeFilesStore } from '@/stores'
import type { FilesResponseWithBaseExpand } from '@/api'
import { compareDatesSafe } from '@/utils'

export const useFileInfoQueryDesuwa = (data: {
  fileInfoRouteParams: FileInfoRouteParamsType
}) => {
  const {
    //
    fileInfoRouteParams,
  } = data

  const fileId = computed(() => fileInfoRouteParams.value.id)

  const filesGetOneQuery = useFilesGetOneQuery({
    fileId,
  })

  const realtimeFilesStore = useRealtimeFilesStore()

  // 经过实时优化的文件数据，会使用较新的数据
  const fileInfoDataWithRealtime = computed(() => {
    if (fileId.value == null) {
      return null
    }
    const fromQuery = filesGetOneQuery.data.value
    const fromRealtime = realtimeFilesStore.updateListFindLatestById(
      fileId.value
    )
    // 两者都有 → 比较 updated
    if (fromQuery != null && fromRealtime != null) {
      if (fromRealtime.updated > fromQuery.updated) {
        return fromRealtime
      } else {
        return fromQuery
      }
    }
    // 只有 query 有
    if (fromQuery != null) {
      return fromQuery
    }
    // 只有 realtime 有
    if (fromRealtime != null) {
      return fromRealtime
    }
    // 两者都不存在
    return null
  })

  const fileInfoQueryStatus = computed(() => {
    // 有内容
    if (fileInfoDataWithRealtime.value != null) {
      // 特殊情况已删除
      if (fileInfoDataWithRealtime.value.isDeleted === true) {
        return 'isDeleted'
      }
      return 'content' as const
    }
    // 加载中
    if (
      fileInfoDataWithRealtime.value == null &&
      filesGetOneQuery.isFetching.value === true
    ) {
      return 'loading' as const
    }
    // 无内容（文件id不存在）
    return 'none' as const
  })

  const fileInfoMessageListPageNum = ref(1)

  const fileInfoMessageListQuery = useFileInfoMessageListQuery({
    pageNum: computed(() => fileInfoMessageListPageNum.value),
    fileId,
  })

  // 查询页数设置
  const fileInfoMessageListPageSet = (val: number) => {
    fileInfoMessageListPageNum.value = val
  }

  const queryClient = useQueryClient()

  // 是否正在刷新
  const isFileQueryRefreshRunning = ref(false)
  // 查询刷新
  const fileQueryRefresh = async () => {
    if (isFileQueryRefreshRunning.value) return
    isFileQueryRefreshRunning.value = true

    try {
      // 页面重置
      // fileInfoMessageListPageNum.value = 1

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.filesGetOne(fileId.value),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.fileInfoMessageList(fileId.value),
        }),
      ])
    } finally {
      isFileQueryRefreshRunning.value = false
    }
  }

  const authStore = useAuthStore()

  // 当前是否为发送者
  const isAuthorCurrent = computed(() => {
    if (
      fileInfoDataWithRealtime.value == null ||
      authStore.isValid === false ||
      authStore.record?.id == null
    ) {
      return false
    }
    if (fileInfoDataWithRealtime.value.author === authStore.record.id) {
      return true
    }
    return false
  })

  /**
   * 用于文件信息修改成功后，根据返回的数据检查并设置setQueryData
   * 在 onSuccess 中使用
   */
  const fileInfoCheckSetQueryDataOnSuccessUpdate = (
    data: FilesResponseWithBaseExpand
  ) => {
    // 更新query
    // 更新前，应确认data.update时间为最新的，以此方式避免两次很近的请求导致问题
    if (
      filesGetOneQuery.data.value != null &&
      // data.updated > filesGetOneQuery.data.value.updated
      compareDatesSafe(data.updated, filesGetOneQuery.data.value.updated) === 1
    ) {
      // 更新query缓存
      queryClient.setQueryData(
        queryKeys.filesGetOne(filesGetOneQuery.data.value.id),
        // 确保类型正确
        data satisfies NonNullable<typeof filesGetOneQuery.data.value>
      )
    }
  }

  return {
    //
    filesGetOneQuery,
    fileInfoDataWithRealtime,
    fileInfoQueryStatus,
    fileInfoMessageListQuery,
    fileInfoMessageListPageNum,
    fileInfoMessageListPageSet,
    fileQueryRefresh,
    isFileQueryRefreshRunning,
    isAuthorCurrent,
    fileInfoCheckSetQueryDataOnSuccessUpdate,
  }
}

export type FileInfoQueryDesuwaType = ReturnType<typeof useFileInfoQueryDesuwa>
