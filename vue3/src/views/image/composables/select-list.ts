import type { ImagesResponseWithBaseExpand } from '@/api'

export const useImageSelectListDesuwa = () => {
  // 图片选择列表
  const imageSelectList = ref<ImagesResponseWithBaseExpand[]>([])

  /**
   * 添加图片（带最大数量限制 4）：
   * - 若已存在同 id，则更新该项
   * - 若不存在：
   *    - 若数量 < 4：直接追加
   *    - 若数量 >= 4：移除第一个再追加
   */
  const imageSelectListAdd = (val: ImagesResponseWithBaseExpand) => {
    const index = imageSelectList.value.findIndex((item) => item.id === val.id)

    if (index !== -1) {
      // 更新已有项
      imageSelectList.value[index] = val
      return
    }

    // 若数量已达上限 4，则移除最早的一个
    if (imageSelectList.value.length >= 4) {
      imageSelectList.value.shift()
    }

    // 新增
    imageSelectList.value.push(val)
  }

  /**
   * 删除图片：
   * - 根据 id 过滤掉对应项
   */
  const imageSelectListDel = (val: { id: string }) => {
    imageSelectList.value = imageSelectList.value.filter(
      (item) => item.id !== val.id
    )
  }

  /**
   * 清空图片列表
   */
  const imageSelectListClear = () => {
    imageSelectList.value = []
  }

  /**
   * 根据 id 查找图片：
   * - 找到则返回该项
   * - 找不到则返回 undefined
   */
  const imageSelectListFindById = (id: string) => {
    return imageSelectList.value.find((item) => item.id === id)
  }

  /**
   * 切换图片：
   * - 若存在同 id，则删除
   * - 若不存在，则添加
   */
  const imageSelectListSwitch = (val: ImagesResponseWithBaseExpand) => {
    const find = imageSelectListFindById(val.id)

    if (find != null) {
      imageSelectListDel(val)
    } else {
      imageSelectListAdd(val)
    }
  }

  return {
    imageSelectList,
    imageSelectListAdd,
    imageSelectListDel,
    imageSelectListClear,
    imageSelectListFindById,
    imageSelectListSwitch,
  }
}

export type ImageSelectListDesuwaType = ReturnType<
  typeof useImageSelectListDesuwa
>
