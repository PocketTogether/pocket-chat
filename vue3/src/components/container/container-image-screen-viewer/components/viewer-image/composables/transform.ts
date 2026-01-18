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

  // 优化动态过渡判断
  const isContinuousTransformInteracting = ref(false)

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
  // let isDragging = false
  const isDragging = ref(false)
  let lastX = 0
  let lastY = 0

  const onMouseDown = (e: MouseEvent) => {
    isDragging.value = true
    lastX = e.clientX
    lastY = e.clientY
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return

    isContinuousTransformInteracting.value = true

    const dx = e.clientX - lastX
    const dy = e.clientY - lastY

    lastX = e.clientX
    lastY = e.clientY

    const newX = translateX.value + dx
    const newY = translateY.value + dy

    clampTranslate(newX, newY)
  }

  const onMouseUp = () => {
    isDragging.value = false
    isContinuousTransformInteracting.value = false
  }

  // ---------------------------
  // 双指触摸 单指触摸
  // ---------------------------
  let touchStartDist = 0
  let touchStartCenter = { x: 0, y: 0 }
  let touchStartScale = 1
  let touchStartTranslate = { x: 0, y: 0 }

  // let isSingleFinger = false
  const isSingleFinger = ref(false)
  // let isPinching = false
  const isPinching = ref(false)
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
      isSingleFinger.value = true
      isPinching.value = false

      singleStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      touchStartTranslate = { x: translateX.value, y: translateY.value }
    }

    if (e.touches.length === 2) {
      // 双指模式
      isPinching.value = true
      isSingleFinger.value = false

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
    isContinuousTransformInteracting.value = true

    // -------------------------
    // 双指 pinch 缩放 + 平移（连续差分）
    // -------------------------
    if (isPinching.value && e.touches.length === 2) {
      const newDist = getTouchDist(e.touches)
      const center = getTouchCenter(e.touches)

      // 缩放
      const ratio =
        ((newDist - touchStartDist) * touchScaleRatioCoefficientFn() +
          touchStartDist) /
        touchStartDist

      const newScale = touchStartScale * ratio
      applyScale(newScale, center.x, center.y)

      // 平移（连续差分）
      const dx = center.x - touchStartCenter.x
      const dy = center.y - touchStartCenter.y

      const newX = touchStartTranslate.x + dx
      const newY = touchStartTranslate.y + dy
      clampTranslate(newX, newY)

      // ⭐关键：更新“上一帧”的参考点
      touchStartCenter = center
      touchStartTranslate = { x: translateX.value, y: translateY.value }
      touchStartDist = newDist
      touchStartScale = scale.value

      return
    }

    // -------------------------
    // 单指拖拽（连续差分）
    // -------------------------
    if (isSingleFinger.value && e.touches.length === 1) {
      const x = e.touches[0].clientX
      const y = e.touches[0].clientY

      const dx = x - singleStart.x
      const dy = y - singleStart.y

      const newX = touchStartTranslate.x + dx
      const newY = touchStartTranslate.y + dy
      clampTranslate(newX, newY)

      // ⭐关键：更新“上一帧”的参考点
      singleStart.x = x
      singleStart.y = y
      touchStartTranslate = { x: translateX.value, y: translateY.value }

      return
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      isSingleFinger.value = false
      isPinching.value = false
      isContinuousTransformInteracting.value = false
    }

    // if (e.touches.length === 1) {
    //   // 从双指变成单指，不自动进入单指拖拽
    //   isPinching.value = false
    // }
    if (e.touches.length === 1) {
      // 自动进入单指拖拽
      isPinching.value = false
      isSingleFinger.value = true
      // 关键：把当前触点当成新的单指起点
      singleStart = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      }
      touchStartTranslate = { x: translateX.value, y: translateY.value }
    }
  }

  // ---------------------------
  // 双击检测状态
  // ---------------------------
  let lastTapTime = 0
  let lastTapX = 0
  let lastTapY = 0

  // 点击间隔需小于250且大于50 ms
  const MIN_DOUBLE_TAP_INTERVAL = 50
  const MAX_DOUBLE_TAP_INTERVAL = 300
  // 两次点击位置需很近 px
  const DOUBLE_TAP_DISTANCE = 50

  // ---------------------------
  // 双击放大与还原
  // ---------------------------
  const onPointerDown = (e: PointerEvent) => {
    // 将绑定的是pointerdown时间
    // 点击间隔需小于一定时间
    // 两次点击位置需很近
    // 未缩放时进行放大
    // 已缩放时则重置

    const now = performance.now()
    const x = e.clientX
    const y = e.clientY

    const timeDiff = now - lastTapTime
    const dist = Math.hypot(x - lastTapX, y - lastTapY)

    const isDoubleTap =
      timeDiff > MIN_DOUBLE_TAP_INTERVAL &&
      timeDiff < MAX_DOUBLE_TAP_INTERVAL &&
      dist < DOUBLE_TAP_DISTANCE

    if (isDoubleTap) {
      // ---------------------------
      // 双击触发
      // ---------------------------
      if (isNoTransformFn()) {
        // 未缩放 → 放大（以点击点为中心）
        // 缩放值，可自定义，例如 1.8 或 2.5
        const targetScale = 2
        applyScale(targetScale, x, y)
      } else {
        // 已缩放 → 重置
        reset()
      }

      // 重置状态，避免三连击触发
      lastTapTime = 0
      return
    }

    // 记录本次点击
    lastTapTime = now
    lastTapX = x
    lastTapY = y
  }

  // 是否为初始值（未缩放）
  const isNoTransformFn = () => {
    // 缩放容差是 0.05
    const scaleTolerance = 0.05
    // 位移容差是 20px
    const translateTolerance = 20

    const scaleOk = Math.abs(scale.value - 1) <= scaleTolerance
    const xOk = Math.abs(translateX.value) <= translateTolerance
    const yOk = Math.abs(translateY.value) <= translateTolerance

    return scaleOk && xOk && yOk
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
    isPinching,
    isDragging,

    transform: computed(() => {
      return `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`
    }),
    transition: computed(() => {
      if (isContinuousTransformInteracting.value) {
        // 连续操作：平滑补偿
        return 'transform 50ms linear'
      }
      // 非交互：自然回弹/对齐
      return 'transform 200ms ease'
    }),

    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onPointerDown,

    reset,
  }
}
