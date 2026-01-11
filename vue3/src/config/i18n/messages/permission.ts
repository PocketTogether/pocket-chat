import type { I18nMessagesSatisfiesType } from '.'
/**
 * i18nMessages 权限相关部分
 */
export const i18nMessagesPermissionPart = {
  //
  permissionNoPermissionSendMessageText: {
    'en-US': () => 'No permission to send messages' as const,
    'zh-CN': () => '暂无发送消息权限' as const,
    'zh-TW': () => '沒有發送訊息的權限' as const,
    'ja-JP': () => 'メッセージを送信する権限がありません' as const,
    'ko-KR': () => '메시지를 보낼 권한이 없습니다' as const,
    'ru-RU': () => 'Нет прав на отправку сообщений' as const,
  },

  permissionNoPermissionUploadImageText: {
    'en-US': () => 'No permission to upload images' as const,
    'zh-CN': () => '暂无上传图片权限' as const,
    'zh-TW': () => '沒有上傳圖片的權限' as const,
    'ja-JP': () => '画像をアップロードする権限がありません' as const,
    'ko-KR': () => '이미지를 업로드할 권한이 없습니다' as const,
    'ru-RU': () => 'Нет прав на загрузку изображений' as const,
  },

  permissionAdminContactText: {
    'en-US': () => 'Contact the administrator for access' as const,
    'zh-CN': () => '联系管理员获取权限' as const,
    'zh-TW': () => '請聯繫管理員以取得權限' as const,
    'ja-JP': () => '権限については管理者にお問い合わせください' as const,
    'ko-KR': () => '권한이 필요하면 관리자에게 문의하세요' as const,
    'ru-RU': () => 'Свяжитесь с администратором для получения доступа' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
