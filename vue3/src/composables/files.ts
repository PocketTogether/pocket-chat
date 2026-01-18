import { computed, type ComputedRef } from 'vue'
import type { FilesResponseWithBaseExpand } from '@/api'
import { useFilesGetOneQueryForCache } from '@/queries'
import { useRealtimeFilesStore } from '@/stores'

export const useFileDataWithQueryAndRealtimeDesuwa = <
  T extends FilesResponseWithBaseExpand | null,
>(data: {
  fileData: ComputedRef<T>
}) => {
  // 来自props的文件数据，以此为基础
  const fileDataFromProps = computed(() => data.fileData.value)

  // 从query缓存中获取文件数据
  const filesGetOneQueryForCache = useFilesGetOneQueryForCache({
    fileId: computed(() => fileDataFromProps.value?.id ?? null),
  })
  // 来自query的文件数据
  const fileDataFromQuery = filesGetOneQueryForCache.data

  const realtimeFilesStore = useRealtimeFilesStore()
  // 来自realtime的文件数据
  const fileDataFromRealtime = computed(() => {
    if (fileDataFromProps.value == null) return null
    return realtimeFilesStore.updateListFindLatestById(
      fileDataFromProps.value.id
    )
  })

  // 最终使用的数据
  // 以 fileDataFromProps 为基础
  // fileDataFromQuery fileDataFromRealtime
  // 优先使用 updated 大的数据，比较字符串即可
  const fileDataWithQueryAndRealtime = computed(() => {
    let latest = fileDataFromProps.value
    if (latest == null) return latest

    const queryData = fileDataFromQuery.value as T
    if (queryData != null && queryData.updated > latest.updated) {
      latest = queryData
    }

    const realtimeData = fileDataFromRealtime.value as T
    if (realtimeData != null && realtimeData.updated > latest.updated) {
      latest = realtimeData
    }

    return latest
  })

  return {
    fileDataFromProps,
    fileDataFromQuery,
    fileDataFromRealtime,
    fileDataWithQueryAndRealtime,
  }
}
