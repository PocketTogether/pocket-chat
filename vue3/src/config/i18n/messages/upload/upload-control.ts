import type { I18nMessagesSatisfiesType } from './dependencies'
/**
 * i18nMessages 上传相关部分 uploadControl
 */
export const i18nMessagesUploadPartUploadControlPart = {
  uploadControlClearFinishedText: {
    'en-US': () => 'Clear finished uploads' as const,
    'zh-CN': () => '清除已完成上传' as const,
    'zh-TW': () => '清除已完成上傳' as const,
    'ja-JP': () => '完了したアップロードをクリア' as const,
    'ko-KR': () => '완료된 업로드 삭제' as const,
    'ru-RU': () => 'Очистить завершённые загрузки' as const,
  },

  uploadControlClearErrorOrInterruptedText: {
    'en-US': () => 'Clear failed or interrupted uploads' as const,
    'zh-CN': () => '清除失败或中断的上传' as const,
    'zh-TW': () => '清除失敗或中斷的上傳' as const,
    'ja-JP': () => '失敗または中断されたアップロードをクリア' as const,
    'ko-KR': () => '실패 또는 중단된 업로드 삭제' as const,
    'ru-RU': () => 'Очистить ошибки или прерванные загрузки' as const,
  },

  uploadControlClearAbortedText: {
    'en-US': () => 'Clear aborted uploads' as const,
    'zh-CN': () => '清除已中止的上传' as const,
    'zh-TW': () => '清除已中止的上傳' as const,
    'ja-JP': () => '中止されたアップロードをクリア' as const,
    'ko-KR': () => '중지된 업로드 삭제' as const,
    'ru-RU': () => 'Очистить отменённые загрузки' as const,
  },

  uploadControlAbortAllText: {
    'en-US': () => 'Abort all uploads' as const,
    'zh-CN': () => '中止全部上传' as const,
    'zh-TW': () => '中止全部上傳' as const,
    'ja-JP': () => 'すべてのアップロードを中止' as const,
    'ko-KR': () => '모든 업로드 중지' as const,
    'ru-RU': () => 'Прервать все загрузки' as const,
  },

  uploadControlAbortPendingText: {
    'en-US': () => 'Abort pending upload' as const,
    'zh-CN': () => '中止等待中的上传' as const,
    'zh-TW': () => '中止等待中的上傳' as const,
    'ja-JP': () => '待機中のアップロードを中止' as const,
    'ko-KR': () => '대기 중 업로드 중지' as const,
    'ru-RU': () => 'Прервать ожидающую загрузку' as const,
  },

  uploadControlAbortUploadingText: {
    'en-US': () => 'Abort uploading' as const,
    'zh-CN': () => '中止正在上传' as const,
    'zh-TW': () => '中止正在上傳' as const,
    'ja-JP': () => 'アップロードを中止' as const,
    'ko-KR': () => '업로드 중지' as const,
    'ru-RU': () => 'Прервать загрузку' as const,
  },

  uploadControlRetryUploadText: {
    'en-US': () => 'Retry upload' as const,
    'zh-CN': () => '重新上传' as const,
    'zh-TW': () => '重新上傳' as const,
    'ja-JP': () => '再アップロード' as const,
    'ko-KR': () => '업로드 재시도' as const,
    'ru-RU': () => 'Повторить загрузку' as const,
  },

  uploadControlDeleteUploadText: {
    'en-US': () => 'Delete upload record' as const,
    'zh-CN': () => '删除上传记录' as const,
    'zh-TW': () => '刪除上傳記錄' as const,
    'ja-JP': () => 'アップロード記録を削除' as const,
    'ko-KR': () => '업로드 기록 삭제' as const,
    'ru-RU': () => 'Удалить запись загрузки' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
