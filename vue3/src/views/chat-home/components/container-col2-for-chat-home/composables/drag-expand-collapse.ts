import { useWindowSize } from '@vueuse/core'
import type { Cc2fchDataDesuwaType } from './data'

// DragExpandCollapse
export const useCc2fchDragExpandCollapseDesuwa = (data: {
  //
  cc2fchDataDesuwa: Cc2fchDataDesuwaType
}) => {
  const {
    //
    cc2fchDataDesuwa,
  } = data

  const {
    //
    isExpandedSet,
    isExpandedVal,
    rawWidthSet,
    rawWidthVal,
    contentMaxWidthPresetVal,
  } = cc2fchDataDesuwa

  const { width: windowWidth } = useWindowSize()

  // ---------------------------
  // 拖拽状态
  // ---------------------------
  const dragging = ref(false)
  const startX = ref(0)
  const startWidth = ref(0)

  // ---------------------------
  // 限制逻辑（机制级正确）
  // ---------------------------
  const MIN_LEFT = 360
  const MIN_RIGHT = 400

  const FIXED_LEFT_MARGIN = 40
  const LEFT_EXTRA = 10 // 左栏内部额外宽度
  const FIXED_DRAG_AND_BUTTON = 30
  const FIXED_RIGHT_MARGIN = 40

  const FIXED_TOTAL =
    FIXED_LEFT_MARGIN + LEFT_EXTRA + FIXED_DRAG_AND_BUTTON + FIXED_RIGHT_MARGIN
  // = 32 + 10 + 18 + 32 = 92

  const finalWidth = computed(() => {
    // 限制最大窗口宽度
    const total = Math.min(windowWidth.value, contentMaxWidthPresetVal.value)

    // 可用于左右栏分配的宽度
    const available = total - FIXED_TOTAL

    // 左栏最大宽度 = 可用宽度 - 右栏最小宽度
    const maxLeft = available - MIN_RIGHT

    return Math.min(Math.max(rawWidthVal.value, MIN_LEFT), maxLeft)
  })

  // ---------------------------
  // 拖拽事件
  // ---------------------------
  const onDragStart = (e: PointerEvent) => {
    dragging.value = true
    startX.value = e.clientX
    startWidth.value = finalWidth.value

    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', onDragEnd)
  }

  const onDragMove = (e: PointerEvent) => {
    if (!dragging.value) return
    const delta = e.clientX - startX.value
    rawWidthSet(startWidth.value + delta)
  }

  const onDragEnd = () => {
    dragging.value = false
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
  }

  // ---------------------------
  // 展开/收起
  // ---------------------------
  const collapse = () => {
    isExpandedSet(false)
  }

  const expand = () => {
    isExpandedSet(true)
  }

  return {
    //
    FIXED_LEFT_MARGIN,
    FIXED_RIGHT_MARGIN,
    FIXED_DRAG_AND_BUTTON,
    LEFT_EXTRA,

    finalWidth,
    dragging,
    onDragStart,

    collapse,
    expand,
  }
}

export type Cc2fchDragExpandCollapseDesuwaType = ReturnType<
  typeof useCc2fchDragExpandCollapseDesuwa
>
