import { defineStore } from 'pinia'
import { ref } from 'vue'

export const contentMaxWidthPresetTuple = [
  2000, 1800, 1600, 1400, 1200, 1000,
] as const
export type contentMaxWidthPresetType =
  (typeof contentMaxWidthPresetTuple)[number]

/**
 * 当前 Store 的版本号。
 *
 * 当 store 的结构（字段、类型）发生不兼容更新时，
 * 修改此版本号即可强制生成一个新的持久化存储空间。
 * 避免旧数据与新类型不符导致运行时错误。
 */
const STORE_VERSION = 'v1'

export const useChatHomeColLayoutStore = defineStore(
  `pocket-together-chat-home-col-layout-${STORE_VERSION}`,
  () => {
    const isExpanded = ref(true) // 左栏是否展开
    const isExpandedSet = (val: boolean) => {
      isExpanded.value = val
    }

    const rawWidth = ref(400) // 用户拖拽得到的原始宽度（未限制）
    const rawWidthSet = (val: number) => {
      rawWidth.value = val
    }
    const contentMaxWidthPreset = ref<contentMaxWidthPresetType>(1200)
    const contentMaxWidthPresetSet = (val: contentMaxWidthPresetType) => {
      contentMaxWidthPreset.value = val
    }

    return {
      isExpanded,
      isExpandedSet,
      rawWidth,
      rawWidthSet,
      contentMaxWidthPreset,
      contentMaxWidthPresetSet,
    }
  },
  {
    persist: true, // 持久化
  }
)
