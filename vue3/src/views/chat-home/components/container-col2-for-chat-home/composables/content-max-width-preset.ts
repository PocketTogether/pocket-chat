import { useWindowSize } from '@vueuse/core'
import type { Cc2fchDataDesuwaType } from './data'
import {
  contentMaxWidthPresetTuple,
  type contentMaxWidthPresetType,
} from './dependencies'

export const useCc2fchContentMaxWidthPresetDesuwa = (data: {
  //
  cc2fchDataDesuwa: Cc2fchDataDesuwaType
}) => {
  const {
    //
    cc2fchDataDesuwa,
  } = data

  const {
    //
    contentMaxWidthPresetSet,
    contentMaxWidthPresetVal,
  } = cc2fchDataDesuwa

  const { width: windowWidth } = useWindowSize()

  // ---------------------------
  // contentMaxWidthPreset 相关
  // ---------------------------

  // 内部工具：基于 current + windowWidth 找“下一档可用 preset”
  const findContentMaxWidthPresetNextLargerWithinWindow = (
    current: number,
    ww: number
  ): contentMaxWidthPresetType | null => {
    // windowWidth 不够大，增大没有意义
    if (current > ww) {
      return null
    }
    // tuple 是从大到小排的：[2000, 1800, 1600, 1400, 1200, 1000]
    for (const preset of [...contentMaxWidthPresetTuple].reverse()) {
      // “更大的一档”
      if (preset > current) {
        return preset
      }
    }
    return null
  }
  const findContentMaxWidthPresetNextSmallerWithinWindow = (
    current: number,
    ww: number
  ): contentMaxWidthPresetType | null => {
    // 同样利用从大到小的顺序：
    // 第一个满足 preset < current && preset <= ww 的，就是“下一档可用的更小值”
    for (const preset of contentMaxWidthPresetTuple) {
      if (preset < current && preset <= ww) {
        return preset
      }
    }
    return null
  }

  // 计算属性：当前是否能增大（智能考虑 windowWidth）
  const contentMaxWidthPresetCanIncrease = computed(() => {
    const current = contentMaxWidthPresetVal.value
    const ww = windowWidth.value

    const next = findContentMaxWidthPresetNextLargerWithinWindow(current, ww)
    return next !== null
  })

  // 计算属性：当前是否能减小（智能考虑 windowWidth）
  const contentMaxWidthPresetCanDecrease = computed(() => {
    const current = contentMaxWidthPresetVal.value
    const ww = windowWidth.value

    const next = findContentMaxWidthPresetNextSmallerWithinWindow(current, ww)
    return next !== null
  })

  // 方法：增大 contentMaxWidthPreset（智能跳档）
  const contentMaxWidthPresetIncrease = () => {
    const current = contentMaxWidthPresetVal.value
    const ww = windowWidth.value

    const next = findContentMaxWidthPresetNextLargerWithinWindow(current, ww)
    if (next === null) return

    contentMaxWidthPresetSet(next)
  }

  // 方法：减小 contentMaxWidthPreset（智能跳档）
  const contentMaxWidthPresetDecrease = () => {
    const current = contentMaxWidthPresetVal.value
    const ww = windowWidth.value

    const next = findContentMaxWidthPresetNextSmallerWithinWindow(current, ww)
    if (next === null) return

    contentMaxWidthPresetSet(next)
  }

  return {
    //
    contentMaxWidthPresetCanIncrease,
    contentMaxWidthPresetCanDecrease,
    contentMaxWidthPresetIncrease,
    contentMaxWidthPresetDecrease,
  }
}

export type Cc2fchContentMaxWidthPresetDesuwaType = ReturnType<
  typeof useCc2fchContentMaxWidthPresetDesuwa
>
