import {
  useChatHomeColLayoutStore,
  type contentMaxWidthPresetType,
} from './dependencies'

// ContainerCol2ForChatHome 的数据这一块
export const useCc2fchDataDesuwa = () => {
  const chatHomeColLayoutStore = useChatHomeColLayoutStore()

  // ---------------------------
  // 状态（持久化）
  // ---------------------------

  const isExpandedSet = (val: boolean) => {
    chatHomeColLayoutStore.isExpandedSet(val)
  }
  const isExpandedVal = computed(() => chatHomeColLayoutStore.isExpanded)

  const rawWidthSet = (val: number) => {
    chatHomeColLayoutStore.rawWidthSet(val)
  }
  const rawWidthVal = computed(() => chatHomeColLayoutStore.rawWidth)

  const contentMaxWidthPresetSet = (val: contentMaxWidthPresetType) => {
    chatHomeColLayoutStore.contentMaxWidthPresetSet(val)
  }
  const contentMaxWidthPresetVal = computed(
    () => chatHomeColLayoutStore.contentMaxWidthPreset
  )

  return {
    //
    isExpandedSet,
    isExpandedVal,
    rawWidthSet,
    rawWidthVal,
    contentMaxWidthPresetSet,
    contentMaxWidthPresetVal,
  }
}

export type Cc2fchDataDesuwaType = ReturnType<typeof useCc2fchDataDesuwa>
