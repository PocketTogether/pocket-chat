import type { FilesResponseWithBaseExpand } from '@/api'
import type { FileSelectPagePageRecoverDataDesuwaType } from './page-recover'
import { useQueryClient } from '@tanstack/vue-query'
import type { useFilesGetOneQuery } from '@/queries'
import { queryKeys } from '@/queries'

export const useFileSelectListDesuwa = (data: {
  fileSelectPagePageRecoverDataDesuwa: FileSelectPagePageRecoverDataDesuwaType
}) => {
  const { fileSelectPagePageRecoverDataDesuwa } = data

  const {
    // 页面恢复数据
    fileSelectPagePageRecoverData,
  } = fileSelectPagePageRecoverDataDesuwa

  // 【260113】其实文件只能选一个，不需要列表，但因为这个逻辑是从图片选择那边复制过来的，懒得改了
  // 文件选择列表
  const fileSelectList = ref<FilesResponseWithBaseExpand[]>([])
  // 文件选择列表
  // 【根据页面恢复数据初始化】
  if (fileSelectPagePageRecoverData != null) {
    fileSelectList.value = fileSelectPagePageRecoverData.data.fileSelectList
  }

  // setup时，需检查文件是否已被删除，因为可能是刚从文件详情页删除并返回
  usePruneDeletedFiles({
    fileSelectList,
  })

  /**
   * 添加文件（带最大数量限制 1）：
   * - 若已存在同 id，则更新该项
   * - 若不存在：
   *    - 若数量 < 1：直接追加
   *    - 若数量 >= 1：移除第一个再追加
   */
  const fileSelectListAdd = (val: FilesResponseWithBaseExpand) => {
    const index = fileSelectList.value.findIndex((item) => item.id === val.id)

    if (index !== -1) {
      // 更新已有项
      fileSelectList.value[index] = val
      return
    }

    // 若数量已达上限 1，则移除最早的一个
    if (fileSelectList.value.length >= 1) {
      fileSelectList.value.shift()
    }

    // 新增
    fileSelectList.value.push(val)
  }

  /**
   * 删除文件：
   * - 根据 id 过滤掉对应项
   */
  const fileSelectListDel = (val: { id: string }) => {
    fileSelectList.value = fileSelectList.value.filter(
      (item) => item.id !== val.id
    )
  }

  /**
   * 清空文件列表
   */
  const fileSelectListClear = () => {
    fileSelectList.value = []
  }

  /**
   * 根据 id 查找文件：
   * - 找到则返回该项
   * - 找不到则返回 undefined
   */
  const fileSelectListFindById = (id: string) => {
    return fileSelectList.value.find((item) => item.id === id)
  }

  /**
   * 切换文件：
   * - 若存在同 id，则删除
   * - 若不存在，则添加
   */
  const fileSelectListSwitch = (val: FilesResponseWithBaseExpand) => {
    const find = fileSelectListFindById(val.id)

    if (find != null) {
      fileSelectListDel(val)
    } else {
      fileSelectListAdd(val)
    }
  }

  return {
    fileSelectList,
    fileSelectListAdd,
    fileSelectListDel,
    fileSelectListClear,
    fileSelectListFindById,
    fileSelectListSwitch,
  }
}

export type FileSelectListDesuwaType = ReturnType<
  typeof useFileSelectListDesuwa
>

/**
 * setup时，需检查文件是否已被删除，因为可能是刚从文件详情页删除并返回
 * - 若列表为空则不处理
 * - 若列表有内容，则根据 vue-query 缓存判断哪些文件已被删除
 * - 删除缓存中标记 isDeleted === true 的文件
 *
 * 不导出，其只在 useFileSelectListDesuwa 中使用
 */
const usePruneDeletedFiles = (data: {
  fileSelectList: Ref<FilesResponseWithBaseExpand[]>
}) => {
  const { fileSelectList } = data
  const queryClient = useQueryClient()

  // 若列表为空则无需处理
  if (fileSelectList.value.length > 0) {
    try {
      // 将已删除的文件去除
      fileSelectList.value = fileSelectList.value.filter((i) => {
        // 尝试获取querydata
        const fileGetQueryData = queryClient.getQueryData(
          queryKeys.filesGetOne(i.id)
        ) as ReturnType<typeof useFilesGetOneQuery>['data']['value'] | undefined

        // 如果文件query缓存中有数据，且isDeleted是true，则为已删除，返回false
        if (fileGetQueryData != null && fileGetQueryData.isDeleted === true) {
          return false
        }

        return true
      })
    } catch (error) {
      console.warn(
        'src/views/file/composables/select-list.ts',
        'usePruneDeletedFiles',
        error
      )
    }
  }
}
