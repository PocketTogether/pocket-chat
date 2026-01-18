import type { I18nMessagesSatisfiesType } from './dependencies'
/**
 * i18nMessages 上传相关部分 uploadProgressInfoError
 */
export const i18nMessagesUploadPartUploadProgressInfoErrorPart = {
  // 未知错误
  uploadProgressInfoErrorUnknowText: {
    'en-US': (data: unknown) => 'Unknown error' as const,
    'zh-CN': (data: unknown) => '未知错误' as const,
    'zh-TW': (data: unknown) => '未知錯誤' as const,
    'ja-JP': (data: unknown) => '不明なエラー' as const,
    'ko-KR': (data: unknown) => '알 수 없는 오류' as const,
    'ru-RU': (data: unknown) => 'Неизвестная ошибка' as const,
  },

  // 图片处理错误
  uploadProgressInfoErrorImageProcessText: {
    'en-US': (data: unknown) => 'Image processing error' as const,
    'zh-CN': (data: unknown) => '图片处理错误' as const,
    'zh-TW': (data: unknown) => '圖片處理錯誤' as const,
    'ja-JP': (data: unknown) => '画像処理エラー' as const,
    'ko-KR': (data: unknown) => '이미지 처리 오류' as const,
    'ru-RU': (data: unknown) => 'Ошибка обработки изображения' as const,
  },

  // 文件处理错误
  uploadProgressInfoErrorFileProcessText: {
    'en-US': (data: unknown) => 'File processing error' as const,
    'zh-CN': (data: unknown) => '文件处理错误' as const,
    'zh-TW': (data: unknown) => '檔案處理錯誤' as const,
    'ja-JP': (data: unknown) => 'ファイル処理エラー' as const,
    'ko-KR': (data: unknown) => '파일 처리 오류' as const,
    'ru-RU': (data: unknown) => 'Ошибка обработки файла' as const,
  },
} as const satisfies I18nMessagesSatisfiesType

// 通过类型体操，获取i18nMessages键的类型
export type I18nMessagesUploadPartUploadProgressInfoErrorPartKeyType =
  keyof typeof i18nMessagesUploadPartUploadProgressInfoErrorPart
