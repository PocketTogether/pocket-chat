import type { useRouter } from 'vue-router'

// 打开链接
export const openLink = (url: string) => {
  window.open(url, '_blank')
}

// // 生成随机密钥
// export const generateRandomKey = (length: number = 16) => {
//   const array = new Uint8Array(length)
//   window.crypto.getRandomValues(array)
//   return btoa(String.fromCharCode(...array))
// }
// // 生成随机类名
// export const generateRandomClassName = (length?: number) => {
//   return generateRandomKey(length).replace(/[^a-zA-Z]/g, '')
// }
// 使用预设字符集生成随机字符串
export const generateRandomKey = (length: number = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    result += chars[randomIndex]
  }
  return result
}
export const generateRandomClassName = (length?: number) => {
  return generateRandomKey(length)
}

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

export const arraysEqual = (arr1: number[], arr2: number[]): boolean => {
  if (arr1.length !== arr2.length) return false
  const sortedArr1 = [...arr1].sort((a, b) => a - b)
  const sortedArr2 = [...arr2].sort((a, b) => a - b)
  return sortedArr1.every((value, index) => value === sortedArr2[index])
}

/**
 * 格式化文件大小为可读字符串。
 *
 * - 输入为字节数（bytes）。
 * - 当 bytes 为 0 时返回 "0B"。
 * - 使用单位：B, KB, MB, GB, TB。
 * - 当结果数值 < 10 时保留一位小数，否则不保留小数。
 *
 * @param bytes 文件大小（字节数）
 * @returns 格式化后的文件大小字符串，例如 "512KB", "1.2MB"
 *
 * @example
 * formatFileSize(0)        // "0B"
 * formatFileSize(512)      // "512B"
 * formatFileSize(2048)     // "2KB"
 * formatFileSize(1048576)  // "1.0MB"
 * formatFileSize(12345678) // "12MB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1) return '0B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = bytes / Math.pow(k, i)

  // 小于 10 时保留一位小数，否则取整
  const formatted = size < 10 ? size.toFixed(1) : size.toFixed(0)

  return `${formatted}${sizes[i]}`
}

/**
 * 拼接多个路径片段，确保路径格式正确，避免重复斜杠。
 * Join multiple URL path segments into a single normalized path string.
 *
 * - 自动去除每段路径前后的多余斜杠
 * - 保留开头斜杠（如果首段以 `/` 开头）
 * - 忽略空字符串片段
 *
 * @param segments - 路径片段数组，例如 ['/', 'user/', '/123'] → '/user/123'
 * @returns 拼接后的路径字符串，例如 '/user/123'
 */
export const urlJoinUtil = (...segments: string[]): string => {
  // 检查首段是否以斜杠开头，用于决定最终是否保留开头斜杠
  const isStartsWithSlash = (() => {
    if (segments.length > 0 && segments[0].startsWith('/')) {
      return true
    }
    return false
  })()

  // 清洗每段路径：去除前后斜杠，过滤空值，使用单个斜杠连接
  const joinedStr = segments
    .map((segment) => segment.replace(/(^\/+|\/+$)/g, '')) // 去除前后多余的斜杠
    .filter(Boolean) // 删除空值
    .join('/') // 用单个斜杠连接

  // 根据首段是否以斜杠开头，决定是否添加前缀斜杠
  return isStartsWithSlash ? '/' + joinedStr : joinedStr
}

/**
 * 拼接完整网址，包括 origin 和路径片段，确保格式正确。
 * Join origin and path segments into a full URL string.
 *
 * - 自动去除 origin 末尾斜杠
 * - 自动补齐路径开头斜杠（如果缺失）
 * - 使用 urlJoinUtil 处理路径片段
 *
 * @param origin - 当前域名或协议地址，例如 'https://example.com'
 * @param segments - 路径片段，例如 ['user', '123'] → '/user/123'
 * @returns 完整网址字符串，例如 'https://example.com/user/123'
 */
export const urlJoinWithOriginUtil = (
  origin: string,
  ...segments: string[]
): string => {
  const path = urlJoinUtil(...segments)
  const safeOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin
  const safePath = path.startsWith('/') ? path : '/' + path
  return safeOrigin + safePath
}

// 将字符串的首字母大写
export const capitalizeFirstLetter = (str: string) => {
  return str.replace(/^\S/, (char) => char.toUpperCase())
}

/**
 * 生成指定范围内的随机整数（包含 min 和 max）
 * 参数顺序不敏感，会自动处理 min/max 的大小关系
 * @param a 任意一个边界值
 * @param b 另一个边界值
 * @returns 随机整数
 */
export const generateRandomIntegerBetween = (a: number, b: number): number => {
  const min = Math.min(a, b)
  const max = Math.max(a, b)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

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
