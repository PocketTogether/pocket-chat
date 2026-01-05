import { ref, computed, type ComputedRef } from 'vue'

export const useViewerImageTransformDesuwa = (data: {
  allSize: ComputedRef<{
    windowWidth: number
    windowHeight: number
    contentWidth: number
    contentHeight: number
  }>
}) => {
  const { allSize } = data

  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)

  // const minLeft = 40
  const minLeft = computed(() => {
    if (allSize.value.windowWidth > 768) {
      return 70
    }
    return 30
  })
  // const minRight = 40
  const minRight = computed(() => {
    if (allSize.value.windowWidth > 768) {
      return 70
    }
    return 30
  })

  // const minTop = 70
  const minTop = computed(() => 70)
  // const minBottom = 70
  const minBottom = computed(() => 70)

  // const minScale = 0.5
  const minScale = computed(() => 0.5)
  // const maxScale = 4
  const maxScale = computed(() => 4)

  // ---------------------------
  // 计算当前图片边界（缩放 + 位移后）
  // ---------------------------
  const boundariesFn = () => {
    const { windowWidth, windowHeight, contentWidth, contentHeight } =
      allSize.value

    const w = contentWidth * scale.value
    const h = contentHeight * scale.value

    const left = (windowWidth - w) / 2 + translateX.value
    const right = windowWidth - (left + w)
    const top = (windowHeight - h) / 2 + translateY.value
    const bottom = windowHeight - (top + h)

    return { left, right, top, bottom }
  }
  const boundaries = computed(boundariesFn)

  // ---------------------------
  // 负责位移
  // ---------------------------
  const clampTranslate = (newX: number, newY: number) => {
    const { windowWidth, windowHeight, contentWidth, contentHeight } =
      allSize.value

    const w = contentWidth * scale.value
    const h = contentHeight * scale.value

    const halfW = w / 2
    const halfH = h / 2

    const screenCenterX = windowWidth / 2
    const screenCenterY = windowHeight / 2

    // ---------------------------
    // 1. 先判断是不是“小图”
    //    小图定义：加上左右/上下留白后仍然小于窗口
    // ---------------------------
    const isSmallX = w + minLeft.value + minRight.value <= windowWidth
    const isSmallY = h + minTop.value + minBottom.value <= windowHeight

    let finalX = newX
    let finalY = newY

    if (isSmallX) {
      // 完全锁死居中（最干脆，不会抖）
      finalX = 0
    }

    if (isSmallY) {
      finalY = 0
    }

    // 如果两边都是小图，直接更新然后 return，就不会走下面的“边界贴边”逻辑
    if (isSmallX && isSmallY) {
      translateX.value = finalX
      translateY.value = finalY
      return
    }

    // ---------------------------
    // 2. 大图才进入边界计算
    // ---------------------------

    const imgCenterX = screenCenterX + finalX
    const imgCenterY = screenCenterY + finalY

    const left = imgCenterX - halfW
    const right = windowWidth - (imgCenterX + halfW)
    const top = imgCenterY - halfH
    const bottom = windowHeight - (imgCenterY + halfH)

    // X 方向
    const leftTooBig = left >= minLeft.value
    const rightTooBig = right >= minRight.value

    if (leftTooBig && rightTooBig) {
      finalX = 0
    } else if (leftTooBig) {
      const targetCenterX = minLeft.value + halfW
      finalX = targetCenterX - screenCenterX
    } else if (rightTooBig) {
      const targetCenterX = windowWidth - minRight.value - halfW
      finalX = targetCenterX - screenCenterX
    }

    // Y 方向
    const topTooBig = top >= minTop.value
    const bottomTooBig = bottom >= minBottom.value

    if (topTooBig && bottomTooBig) {
      finalY = 0
    } else if (topTooBig) {
      const targetCenterY = minTop.value + halfH
      finalY = targetCenterY - screenCenterY
    } else if (bottomTooBig) {
      const targetCenterY = windowHeight - minBottom.value - halfH
      finalY = targetCenterY - screenCenterY
    }

    translateX.value = finalX
    translateY.value = finalY
  }

  // ---------------------------
  // 缩放限制：是否允许继续缩小
  // ---------------------------
  const canScaleDown = computed(() => {
    const b = boundaries.value
    if (scale.value > 1) {
      return true
    }

    return !(
      b.left >= minLeft.value &&
      b.right >= minRight.value &&
      b.top >= minTop.value &&
      b.bottom >= minBottom.value
    )
  })

  // ---------------------------
  // 应用缩放（带鼠标中心补偿）
  // ---------------------------
  const applyScale = (newScale: number, centerX: number, centerY: number) => {
    const oldScale = scale.value

    // 限制缩小
    if (newScale < oldScale && !canScaleDown.value) return

    // 限制最大最小
    if (newScale > maxScale.value) newScale = maxScale.value
    if (newScale < minScale.value) newScale = minScale.value

    const { windowWidth, windowHeight } = allSize.value

    // 图片中心点（缩放前）
    const imgCenterX = windowWidth / 2 + translateX.value
    const imgCenterY = windowHeight / 2 + translateY.value

    // 鼠标相对图片中心的偏移
    const offsetX = centerX - imgCenterX
    const offsetY = centerY - imgCenterY

    const ratio = newScale / oldScale

    // 位移补偿：模拟以鼠标为中心缩放
    const newX = translateX.value - offsetX * (ratio - 1)
    const newY = translateY.value - offsetY * (ratio - 1)

    scale.value = newScale

    clampTranslate(newX, newY)
  }

  // 滚轮缩放值获取函数
  const wheelScaleValFn = () => {
    if (scale.value < 1) {
      return 0.05
    }
    if (scale.value < 1.5) {
      return 0.08
    }
    return 0.1
  }

  // ---------------------------
  // 滚轮缩放
  // ---------------------------
  const onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const dVal = wheelScaleValFn()
    // const delta = e.deltaY > 0 ? -0.1 : 0.1
    const delta = e.deltaY > 0 ? -dVal : dVal
    const newScale = scale.value + delta
    applyScale(newScale, e.clientX, e.clientY)
  }

  // ---------------------------
  // 鼠标拖动
  // ---------------------------
  let dragging = false
  let lastX = 0
  let lastY = 0

  const onMouseDown = (e: MouseEvent) => {
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging) return

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY

    lastX = e.clientX
    lastY = e.clientY

    const newX = translateX.value + dx
    const newY = translateY.value + dy

    clampTranslate(newX, newY)
  }

  const onMouseUp = () => {
    dragging = false
  }

  // ---------------------------
  // 双指触摸 单指触摸
  // ---------------------------
  let touchStartDist = 0
  let touchStartCenter = { x: 0, y: 0 }
  let touchStartScale = 1
  let touchStartTranslate = { x: 0, y: 0 }

  let isSingleFinger = false
  let isPinching = false
  let singleStart = { x: 0, y: 0 }

  const getTouchDist = (t: TouchList) => {
    const dx = t[0].clientX - t[1].clientX
    const dy = t[0].clientY - t[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (t: TouchList) => ({
    x: (t[0].clientX + t[1].clientX) / 2,
    y: (t[0].clientY + t[1].clientY) / 2,
  })

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // 单指模式
      isSingleFinger = true
      isPinching = false

      singleStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      touchStartTranslate = { x: translateX.value, y: translateY.value }
    }

    if (e.touches.length === 2) {
      // 双指模式
      isPinching = true
      isSingleFinger = false

      touchStartDist = getTouchDist(e.touches)
      touchStartCenter = getTouchCenter(e.touches)
      touchStartScale = scale.value
      touchStartTranslate = { x: translateX.value, y: translateY.value }
    }
  }

  // 触摸缩放系数
  const touchScaleRatioCoefficientFn = () => {
    // if (scale.value < 1) {
    //   return 0.5
    // }
    // if (scale.value < 1.5) {
    //   return 0.7
    // }
    // return 1
    return 0.8
  }

  const onTouchMove = (e: TouchEvent) => {
    // -------------------------
    // 双指 pinch 缩放 + 平移
    // -------------------------
    if (isPinching && e.touches.length === 2) {
      const newDist = getTouchDist(e.touches)
      const center = getTouchCenter(e.touches)

      const ratio =
        ((newDist - touchStartDist) * touchScaleRatioCoefficientFn() +
          touchStartDist) /
        touchStartDist

      const newScale = touchStartScale * ratio
      applyScale(newScale, center.x, center.y)

      const newX = touchStartTranslate.x + (center.x - touchStartCenter.x)
      const newY = touchStartTranslate.y + (center.y - touchStartCenter.y)
      clampTranslate(newX, newY)

      return
    }

    // -------------------------
    // 单指拖拽
    // -------------------------
    if (isSingleFinger && e.touches.length === 1) {
      const dx = e.touches[0].clientX - singleStart.x
      const dy = e.touches[0].clientY - singleStart.y

      const newX = touchStartTranslate.x + dx
      const newY = touchStartTranslate.y + dy
      clampTranslate(newX, newY)

      return
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      isSingleFinger = false
      isPinching = false
    }

    // if (e.touches.length === 1) {
    //   // 从双指变成单指，不自动进入单指拖拽
    //   isPinching = false
    // }
    if (e.touches.length === 1) {
      // 自动进入单指拖拽
      isPinching = false
      isSingleFinger = true
      // 关键：把当前触点当成新的单指起点
      singleStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      touchStartTranslate = { x: translateX.value, y: translateY.value }
    }
  }

  // ---------------------------
  // 重置
  // ---------------------------
  const reset = () => {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  return {
    scale,
    translateX,
    translateY,

    transform: computed(() => {
      return `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
    }),

    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,

    reset,
  }
}
