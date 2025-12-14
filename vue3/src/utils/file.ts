/**
 * 获取指定 MIME 类型对应的文件后缀名
 * @param mimeType - 文件的 MIME 类型，例如 'image/jpeg'
 * @returns 返回文件后缀，例如 'jpg'；若未知则返回 null
 */
export const getExtensionFromMime = (mimeType: string) => {
  // 常见 MIME 类型与扩展名的映射表
  const mimeToExtMap: Record<string, string> = {
    // 图片类型
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/x-icon': 'ico',
    'image/heic': 'heic',
    'image/tiff': 'tiff',

    // 文档类型
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'pptx',
    'application/rtf': 'rtf',
    'text/plain': 'txt',
    'text/csv': 'csv',
    'application/json': 'json',
    'application/xml': 'xml',
    'text/html': 'html',
    'text/javascript': 'js',
    'application/javascript': 'js',
    'application/x-httpd-php': 'php',
    'text/markdown': 'md',

    // 压缩和二进制类型
    'application/zip': 'zip',
    'application/x-7z-compressed': '7z',
    'application/x-rar-compressed': 'rar',
    'application/x-tar': 'tar',
    'application/gzip': 'gz',

    // 音频类型
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/flac': 'flac',
    'audio/mp4': 'm4a',
    'audio/x-ms-wma': 'wma',

    // 视频类型
    'video/mp4': 'mp4',
    'video/x-msvideo': 'avi',
    'video/x-matroska': 'mkv',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'video/mpeg': 'mpeg',

    // 其他
    'application/octet-stream': 'bin',
  }

  // 1️首先尝试查找映射表
  if (mimeToExtMap.hasOwnProperty(mimeType)) {
    return mimeToExtMap[mimeType]
  }

  // 2️如果未命中映射表，尝试从 MIME 类型中提取子类型作为后缀
  const fallbackExt = mimeType.split('/')[1]
  if (typeof fallbackExt === 'string' && fallbackExt.trim() !== '') {
    return fallbackExt.trim()
  }

  // 3️如果无法提取有效扩展名，则返回默认值
  return null
}

/**
 * 将 Blob 对象转换为 File 对象，同时根据其 MIME 类型自动补全文件扩展名。
 *
 * 当传入的 fileName 不包含扩展名时，会依据 MIME 类型自动添加正确的后缀，
 * 例如 "avatar" + image/png → "avatar.png"，以提升兼容性与可识别性。
 *
 * @param {Blob} blob - 要转换的 Blob 数据对象，例如文本、图片、二进制流等。
 * @param {string} fileName - 原始文件名（不含扩展名），如 "report"、"avatar" 等。
 * @returns {File} 封装后的 File 对象，具备 MIME 类型与最后修改时间属性。
 *
 * @example
 * const blob = new Blob(['hello'], { type: 'text/plain' });
 * const file = blobToFile(blob, 'greeting'); // 生成 greeting.txt
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  // 使用 File 构造函数将 Blob 封装成 File 类型
  return new File([blob], `${fileName}.${getExtensionFromMime(blob.type)}`, {
    type: blob.type, // 设置 MIME 类型，与原始 Blob 保持一致
    lastModified: Date.now(), // 设置“最后修改时间”为当前时间，更贴近真实文件
  })
}
