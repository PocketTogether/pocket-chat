import type { I18nMessagesSatisfiesType } from './dependencies'
import { i18nMessagesUploadPartUploadControlPart } from './upload-control'
import { i18nMessagesUploadPartUploadProgressInfoErrorPart } from './upload-progress-info-error'
import { i18nMessagesUploadPartUploadStoreRecordStatusText } from './upload-store-record-status-text'

// upload-progress-info-error

// upload-store-record-status-text

/**
 * i18nMessages 上传相关部分
 */
export const i18nMessagesUploadPart = {
  // 预计完成时间
  uploadProgressInfoEstimatedText: {
    'en-US': (duration: string) => `${duration} remaining` as const,
    // 示例: 3 seconds remaining
    'zh-CN': (duration: string) => `${duration}后完成` as const,
    'zh-TW': (duration: string) => `${duration}後完成` as const,
    'ja-JP': (duration: string) => `${duration}後に完了` as const,
    'ko-KR': (duration: string) => `${duration} 후 완료` as const,
    'ru-RU': (duration: string) => `Завершение через ${duration}` as const,
  },

  // 未知文件大小
  uploadProgressInfoTotalUnknowText: {
    'en-US': () => 'Unknown' as const,
    'zh-CN': () => '未知' as const,
    'zh-TW': () => '未知' as const,
    'ja-JP': () => '不明' as const,
    'ko-KR': () => '알 수 없음' as const,
    'ru-RU': () => 'Неизвестно' as const,
  },

  ...i18nMessagesUploadPartUploadProgressInfoErrorPart,
  ...i18nMessagesUploadPartUploadStoreRecordStatusText,
  ...i18nMessagesUploadPartUploadControlPart,
} as const satisfies I18nMessagesSatisfiesType

export * from './upload-progress-info-error'
