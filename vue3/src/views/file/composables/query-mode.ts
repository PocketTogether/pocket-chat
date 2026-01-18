import { queryKeys, useFilePageListQuery } from '@/queries'
import { useAuthStore } from '@/stores'
import { useQueryClient } from '@tanstack/vue-query'
import type { FileSelectPagePageRecoverDataDesuwaType } from './page-recover'

export type FileQueryModeMarkType = 'file_all' | 'file_my'

export const useFileQueryModeDesuwa = (data: {
  fileSelectPagePageRecoverDataDesuwa: FileSelectPagePageRecoverDataDesuwaType
}) => {
  const { fileSelectPagePageRecoverDataDesuwa } = data

  const {
    // 页面恢复数据
    fileSelectPagePageRecoverData,
  } = fileSelectPagePageRecoverDataDesuwa

  // 查询模式
  const fileQueryMode = ref<FileQueryModeMarkType>('file_all')

  // 查询搜索
  const fileQuerySearch = ref<string>('')

  // 查询页数
  const fileQueryPage = ref(1)

  // 查询模式
  // 查询搜索
  // 查询页数
  // 【根据页面恢复数据初始化】
  if (fileSelectPagePageRecoverData != null) {
    fileQueryMode.value = fileSelectPagePageRecoverData.data.fileQueryMode
    fileQuerySearch.value = fileSelectPagePageRecoverData.data.fileQuerySearch
    fileQueryPage.value = fileSelectPagePageRecoverData.data.fileQueryPage
  }

  // 查询模式切换

  // 是否能 切换至 file_all
  const canFileQueryModeSetToFileAll = computed(() => {
    return true
  })
  // 切换至 file_all
  const fileQueryModeSetToFileAll = () => {
    if (canFileQueryModeSetToFileAll.value === false) {
      return
    }
    fileQueryMode.value = 'file_all'
    fileQueryPage.value = 1
  }

  // 响应式登陆状态
  const authStore = useAuthStore()

  // 是否能 切换至 file_my
  const canFileQueryModeSetToFileMy = computed(() => {
    // 未登录时不能
    if (authStore.isValid === false || authStore.record?.id == null) {
      return false
    }
    return true
  })
  // 切换至 file_my
  const fileQueryModeSetToFileMy = () => {
    if (canFileQueryModeSetToFileMy.value === false) {
      return
    }
    fileQueryMode.value = 'file_my'
    fileQueryPage.value = 1
  }

  // 查询搜索设置
  const fileQuerySearchSet = (val: string) => {
    fileQuerySearch.value = val
    fileQueryPage.value = 1
  }

  // 查询页数设置
  const fileQueryPageSet = (val: number) => {
    fileQueryPage.value = val
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
      fileQueryPage.value = 1

      await queryClient.invalidateQueries({
        queryKey: queryKeys.filePageList(),
      })
    } finally {
      isFileQueryRefreshRunning.value = false
    }
  }

  // 全部文件
  const numAllFilePageListQuery = useFilePageListQuery({
    pageNum: computed(() => 1),
    authorId: computed(() => null),
    searchContent: computed(() => null),
    customStrId: computed(() => 'numAllFilePageListQuery'),
  })

  // 我的文件
  const numMyFilePageListQuery = useFilePageListQuery({
    pageNum: computed(() => {
      // 未登录则 pageNum 为 null 即不查询
      if (authStore.isValid === false || authStore.record?.id == null) {
        return null
      }
      return 1
    }),
    authorId: computed(() => {
      if (authStore.isValid === false || authStore.record?.id == null) {
        return null
      }
      return authStore.record.id
    }),
    searchContent: computed(() => null),
    customStrId: computed(() => 'numMyFilePageListQuery'),
  })

  const filePageListQuery = useFilePageListQuery({
    pageNum: computed(() => {
      // 未登录且file_my，则应为null，不查询
      if (
        (authStore.isValid === false || authStore.record?.id == null) &&
        fileQueryMode.value === 'file_my'
      ) {
        return null
      }
      return fileQueryPage.value
    }),
    authorId: computed(() => {
      if (fileQueryMode.value === 'file_all') {
        return null
      } else {
        // fileQueryMode.value === 'file_my'
        if (authStore.isValid === false || authStore.record?.id == null) {
          return null
        }
        return authStore.record.id
      }
    }),
    searchContent: computed(() => {
      // 【260103】
      if (fileQuerySearch.value === '') {
        return null
      }
      return fileQuerySearch.value
    }),
    customStrId: computed(() => 'filePageListQuery'),
  })

  return {
    fileQueryMode,
    canFileQueryModeSetToFileAll,
    fileQueryModeSetToFileAll,
    canFileQueryModeSetToFileMy,
    fileQueryModeSetToFileMy,
    fileQuerySearch,
    fileQuerySearchSet,
    fileQueryPage,
    fileQueryPageSet,
    isFileQueryRefreshRunning,
    fileQueryRefresh,
    numAllFilePageListQuery,
    numMyFilePageListQuery,
    filePageListQuery,
  }
}

export type FileQueryModeDesuwaType = ReturnType<typeof useFileQueryModeDesuwa>
