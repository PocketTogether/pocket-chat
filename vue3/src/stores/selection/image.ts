import type { ImagesResponseWithBaseExpand } from '@/api'
import { defineStore } from 'pinia'

/**
 * 当前 Store 的版本号。
 *
 * 当 store 的结构（字段、类型）发生不兼容更新时，
 * 修改此版本号即可强制生成一个新的持久化存储空间。
 * 避免旧数据与新类型不符导致运行时错误。
 */
const STORE_VERSION = 'v1'

export const useSelectionImageStore = defineStore(
  `pocket-together-selection-image-${STORE_VERSION}`,
  () => {
    const selected = ref<ImagesResponseWithBaseExpand[] | null>(null)

    const set = (data: ImagesResponseWithBaseExpand[]) => {
      selected.value = data
    }

    const get = () => selected.value

    const getAndClear = () => {
      const data = selected.value
      selected.value = null
      return data
    }

    return {
      selected,
      set,
      get,
      getAndClear,
    }
  }
)
