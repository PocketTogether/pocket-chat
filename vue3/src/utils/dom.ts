/**
 * 将滚动容器滚动至指定子元素的位置，使其垂直方向进入可视区域。
 *
 * 使用 getBoundingClientRect 计算目标元素相对于容器的偏移量，
 * 然后通过 scrollTo 方法控制容器滚动。支持额外偏移量设置，可用于微调定位。
 *
 * @param container - 滚动容器元素，必须是 HTMLDivElement。
 * @param target - 目标子元素，必须是容器内的 HTMLElement。
 * @param behavior - 可选的滚动行为，可设置为 "auto"（默认）、"instant"（立即滚动）、"smooth"（平滑滚动）。
 * @param offset - 可选的额外偏移量（单位 px），用于在滚动定位基础上进行微调。正值向下偏移，负值向上偏移。
 *
 * @example
 * // 默认立即滚动至目标元素顶部
 * scrollToElementInContainer(container, target);
 *
 * // 平滑滚动至目标元素
 * scrollToElementInContainer(container, target, 'smooth');
 *
 * // 平滑滚动至目标元素向下偏移 20px 的位置
 * scrollToElementInContainer(container, target, 'smooth', 20);
 *
 * // 立即滚动至目标元素向上偏移 50px 的位置
 * scrollToElementInContainer(container, target, 'instant', -50);
 */
export const scrollToElementInContainer = (
  container: HTMLElement,
  target: HTMLElement,
  behavior?: ScrollBehavior,
  offset?: number
): void => {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()

  const topVal = targetRect.top - containerRect.top + container.scrollTop
  const topValWidthOffset = (() => {
    // 未设置 offset ，返回 topVal
    if (offset == null) {
      return topVal
    }
    // offset 有值，返回 topVal 与 offset 之和
    return topVal + offset
  })()

  container.scrollTo({
    top: topValWidthOffset,
    behavior,
  })
}

/**
 * 判断一个 HTMLElement 是否在视口中可见（支持部分/完全可见判断，支持边界偏移配置）。
 *
 * @param el - 要判断的 HTML 元素
 * @param options - 可选配置项
 *   - fullyVisible: 是否要求完全可见（默认为 false，表示部分可见即可）
 *   - offset: 视口边界偏移设置（单位 px），用于模拟“缩小视口”或预留安全边距
 *     - top: 视口顶部偏移（正值表示缩小视口）
 *     - bottom: 视口底部偏移
 *     - left: 视口左侧偏移
 *     - right: 视口右侧偏移
 *
 * @returns 是否在视口中可见（true 表示满足配置条件）
 *
 * @example
 * // 判断元素是否部分可见
 * isElementInViewport(el)
 *
 * // 判断元素是否完全可见
 * isElementInViewport(el, { fullyVisible: true })
 *
 * // 判断元素是否在“缩小 20px 的视口”中部分可见
 * isElementInViewport(el, { offset: { top: 20, bottom: 20 } })
 */
export const isElementInViewport = (
  el: HTMLElement,
  options?: {
    fullyVisible?: boolean
    offset?: {
      top?: number
      bottom?: number
      left?: number
      right?: number
    }
  }
): boolean => {
  const rect = el.getBoundingClientRect()

  const { fullyVisible = false, offset = {} } = options ?? {}

  const topOffset = offset.top ?? 0
  const bottomOffset = offset.bottom ?? 0
  const leftOffset = offset.left ?? 0
  const rightOffset = offset.right ?? 0

  const viewportTop = 0 + topOffset
  const viewportBottom = window.innerHeight - bottomOffset
  const viewportLeft = 0 + leftOffset
  const viewportRight = window.innerWidth - rightOffset

  if (fullyVisible) {
    return (
      rect.top >= viewportTop &&
      rect.bottom <= viewportBottom &&
      rect.left >= viewportLeft &&
      rect.right <= viewportRight
    )
  } else {
    return (
      rect.bottom > viewportTop &&
      rect.top < viewportBottom &&
      rect.right > viewportLeft &&
      rect.left < viewportRight
    )
  }
}

// 显示加载动画
export function showLoadingMask() {
  const mask = document.getElementById('index-mask')
  if (mask) {
    mask.style.display = 'flex' // Use flex as defined in the CSS
    // Use a timeout to ensure the display change has taken effect before changing opacity
    setTimeout(() => {
      mask.style.opacity = '1'
    }, 10)
  }
}

// 隐藏加载动画
export function hideLoadingMask() {
  const mask = document.getElementById('index-mask')
  if (mask) {
    mask.style.opacity = '0'
    // Hide it completely after the transition
    setTimeout(() => {
      mask.style.display = 'none'
    }, 300) // 300ms matches the transition duration in the CSS
  }
}

// 获取应用主滚动实例 scrollbar__wrap HTMLElement
export const getAppMainElScrollbarWrap = () =>
  document.querySelector<HTMLElement>(
    '.appMainElScrollbar > .el-scrollbar__wrap'
  )

export const getScrollbarWidth = () => {
  // 创建一个带有滚动条的隐藏元素
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // 强制显示滚动条
  document.body.appendChild(outer)

  // 创建一个内部元素
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // 计算滚动条的宽度
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // 移除临时元素
  outer.parentNode?.removeChild(outer)

  return scrollbarWidth
}
