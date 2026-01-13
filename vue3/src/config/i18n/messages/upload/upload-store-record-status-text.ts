import type { I18nMessagesSatisfiesType } from './dependencies'
import {
  // 重命名 uploadStoreRecordStatusKeyConfig 为 USRSKC 以便于使用
  uploadStoreRecordStatusKeyConfig as USRSKC,
} from '@/config/upload'

/**
 * i18nMessages 上传相关部分 UploadStoreRecordStatusText
 */
export const i18nMessagesUploadPartUploadStoreRecordStatusText = {
  // 待上传
  [`uploadStoreRecordStatusText_${USRSKC.pending}` as const]: {
    'en-US': () => 'Pending' as const,
    'zh-CN': () => '待上传' as const,
    'zh-TW': () => '待上傳' as const,
    'ja-JP': () => 'アップロード待ち' as const,
    'ko-KR': () => '업로드 대기' as const,
    'ru-RU': () => 'Ожидание' as const,
  },
  // 上传中
  [`uploadStoreRecordStatusText_${USRSKC.uploading}` as const]: {
    'en-US': () => 'Uploading' as const,
    'zh-CN': () => '上传中' as const,
    'zh-TW': () => '上傳中' as const,
    'ja-JP': () => 'アップロード中' as const,
    'ko-KR': () => '업로드 중' as const,
    'ru-RU': () => 'Загрузка' as const,
  },
  // 上传完成
  [`uploadStoreRecordStatusText_${USRSKC.success}` as const]: {
    'en-US': () => 'Uploaded' as const,
    'zh-CN': () => '上传完成' as const,
    'zh-TW': () => '上傳完成' as const,
    'ja-JP': () => 'アップロード完了' as const,
    'ko-KR': () => '업로드 완료' as const,
    'ru-RU': () => 'Загружено' as const,
  },
  // 在 pending 状态时被中止
  [`uploadStoreRecordStatusText_${USRSKC.aborted_while_pending}` as const]: {
    'en-US': () => 'Aborted' as const,
    'zh-CN': () => '已中止' as const,
    'zh-TW': () => '已中止' as const,
    'ja-JP': () => '中止' as const,
    'ko-KR': () => '중단됨' as const,
    'ru-RU': () => 'Прервано' as const,
  },
  // 在 uploading 状态时被中止
  [`uploadStoreRecordStatusText_${USRSKC.aborted_while_uploading}` as const]: {
    'en-US': () => 'Aborted' as const,
    'zh-CN': () => '已中止' as const,
    'zh-TW': () => '已中止' as const,
    'ja-JP': () => '中止' as const,
    'ko-KR': () => '중단됨' as const,
    'ru-RU': () => 'Прервано' as const,
  },
  // 上传错误
  [`uploadStoreRecordStatusText_${USRSKC.error}` as const]: {
    'en-US': () => 'Error' as const,
    'zh-CN': () => '上传错误' as const,
    'zh-TW': () => '上傳錯誤' as const,
    'ja-JP': () => 'エラー' as const,
    'ko-KR': () => '오류' as const,
    'ru-RU': () => 'Ошибка' as const,
  },
  // 中断
  [`uploadStoreRecordStatusText_${USRSKC.interrupted}` as const]: {
    'en-US': () => 'Interrupted' as const,
    'zh-CN': () => '已中断' as const,
    'zh-TW': () => '已中斷' as const,
    'ja-JP': () => '中断' as const,
    'ko-KR': () => '중단됨' as const,
    'ru-RU': () => 'Прервано' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
