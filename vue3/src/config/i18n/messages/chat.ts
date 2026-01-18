import type { I18nMessagesSatisfiesType } from '.'
/**
 * i18nMessages 聊天页相关部分
 */
export const i18nMessagesChatPart = {
  // 聊天顶部或底部 加载更多按钮
  chatOnTopOrBottomShowMoreText: {
    'en-US': () => 'Load more' as const,
    'zh-CN': () => '加载更多' as const,
    'zh-TW': () => '載入更多' as const,
    'ja-JP': () => 'さらに読み込む' as const,
    'ko-KR': () => '더 불러오기' as const,
    'ru-RU': () => 'Загрузить ещё' as const,
  },
  chatOnTopOrBottomShowMoreRunningText: {
    'en-US': () => 'Loading' as const,
    'zh-CN': () => '加载中' as const,
    'zh-TW': () => '載入中' as const,
    'ja-JP': () => '読み込み中' as const,
    'ko-KR': () => '불러오는 중' as const,
    'ru-RU': () => 'Загрузка' as const,
  },
  // 消息详情对话框，消息链接复制
  chatMessageInfoDialogCopyMessageLinkSuccessTitle: {
    'en-US': () => 'Message link copied' as const,
    'zh-CN': () => '消息链接已复制' as const,
    'zh-TW': () => '已複製訊息連結' as const,
    'ja-JP': () => 'メッセージリンクをコピーしました' as const,
    'ko-KR': () => '메시지 링크가 복사되었습니다' as const,
    'ru-RU': () => 'Ссылка на сообщение скопирована' as const,
  },
  chatMessageInfoDialogCopyMessageLinkNotSupportedTitle: {
    'en-US': () => 'Browser not supported, please copy manually' as const,
    'zh-CN': () => '当前浏览器不支持，请手动复制' as const,
    'zh-TW': () => '目前瀏覽器不支援，請手動複製' as const,
    'ja-JP': () =>
      'ブラウザが対応していません。手動でコピーしてください' as const,
    'ko-KR': () => '브라우저가 지원되지 않습니다. 수동으로 복사하세요' as const,
    'ru-RU': () => 'Браузер не поддерживается, скопируйте вручную' as const,
  },
  chatTopBarMoreMenuItemRestartText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },
  chatTopBarGlobalChatTitle: {
    'en-US': () => 'Global Chat' as const,
    'zh-CN': () => '全局聊天' as const,
    'zh-TW': () => '全域聊天' as const,
    'ja-JP': () => 'グローバルチャット' as const,
    'ko-KR': () => '글로벌 채팅' as const,
    'ru-RU': () => 'Глобальный чат' as const,
  },
  chatInputBarLoginText: {
    'en-US': () => 'Sign in to start chatting' as const,
    'zh-CN': () => '登录后开始聊天' as const,
    'zh-TW': () => '登入後開始聊天' as const,
    'ja-JP': () => 'ログインしてチャットを開始' as const,
    'ko-KR': () => '로그인 후 채팅 시작' as const,
    'ru-RU': () => 'Войдите, чтобы начать чат' as const,
  },
  chatInputBarBackBottomText: {
    'en-US': () => 'Back to bottom' as const,
    'zh-CN': () => '回到底部' as const,
    'zh-TW': () => '回到底部' as const,
    'ja-JP': () => '一番下へ戻る' as const,
    'ko-KR': () => '맨 아래로 돌아가기' as const,
    'ru-RU': () => 'Вернуться вниз' as const,
  },
  chatInputBarNewMessageText: {
    'en-US': (num: number) =>
      `${num} new message${num > 1 ? 's' : ''}` as const,
    'zh-CN': (num: number) => `${num} 条新消息` as const,
    'zh-TW': (num: number) => `${num} 則新訊息` as const,
    'ja-JP': (num: number) => `${num} 件の新しいメッセージ` as const,
    'ko-KR': (num: number) => `${num}개의 새 메시지` as const,
    'ru-RU': (num: number) =>
      `${num} новое сообщение${num > 1 ? 'й' : ''}` as const,
  },
  chatInputBarBackMenuImage: {
    'en-US': () => 'Image' as const,
    'zh-CN': () => '图片' as const,
    'zh-TW': () => '圖片' as const,
    'ja-JP': () => '画像' as const,
    'ko-KR': () => '이미지' as const,
    'ru-RU': () => 'Изображение' as const,
  },
  chatInputBarBackMenuFile: {
    'en-US': () => 'File' as const,
    'zh-CN': () => '文件' as const,
    'zh-TW': () => '檔案' as const,
    'ja-JP': () => 'ファイル' as const,
    'ko-KR': () => '파일' as const,
    'ru-RU': () => 'Файл' as const,
  },
  chatMessageSendErrorText: {
    'en-US': () => 'Failed to send message' as const,
    'zh-CN': () => '发送失败' as const,
    'zh-TW': () => '傳送失敗' as const,
    'ja-JP': () => 'メッセージ送信に失敗しました' as const,
    'ko-KR': () => '메시지 전송 실패' as const,
    'ru-RU': () => 'Не удалось отправить сообщение' as const,
  },
  chatMessageEditErrorText: {
    'en-US': () => 'Failed to edit message' as const,
    'zh-CN': () => '修改失败' as const,
    'zh-TW': () => '修改失敗' as const,
    'ja-JP': () => 'メッセージ編集に失敗しました' as const,
    'ko-KR': () => '메시지 수정 실패' as const,
    'ru-RU': () => 'Не удалось изменить сообщение' as const,
  },
  chatMessageDeleteErrorText: {
    'en-US': () => 'Failed to delete message' as const,
    'zh-CN': () => '删除失败' as const,
    'zh-TW': () => '刪除失敗' as const,
    'ja-JP': () => 'メッセージ削除に失敗しました' as const,
    'ko-KR': () => '메시지 삭제 실패' as const,
    'ru-RU': () => 'Не удалось удалить сообщение' as const,
  },
  chatMessageDeleteConfirmAskText: {
    'en-US': () => 'Are you sure you want to delete this message?' as const,
    'zh-CN': () => '确认要删除此消息吗？' as const,
    'zh-TW': () => '確定要刪除此訊息嗎？' as const,
    'ja-JP': () => 'このメッセージを削除してもよろしいですか？' as const,
    'ko-KR': () => '이 메시지를 삭제하시겠습니까?' as const,
    'ru-RU': () => 'Вы уверены, что хотите удалить это сообщение?' as const,
  },
  chatMessageReplyMessageDeletedShowText: {
    'en-US': () => '[Message deleted]' as const,
    'zh-CN': () => '[消息已删除]' as const,
    'zh-TW': () => '[訊息已刪除]' as const,
    'ja-JP': () => '[メッセージが削除されました]' as const, // 日语
    'ko-KR': () => '[메시지가 삭제되었습니다]' as const, // 韩语
    'ru-RU': () => '[Сообщение удалено]' as const, // 俄语
  },
  chatMessageGetErrorText: {
    'en-US': () => 'Failed to retrieve message' as const,
    'zh-CN': () => '消息获取失败' as const,
    'zh-TW': () => '訊息取得失敗' as const,
    'ja-JP': () => 'メッセージの取得に失敗しました' as const, // 日语
    'ko-KR': () => '메시지를 가져오지 못했습니다' as const, // 韩语
    'ru-RU': () => 'Не удалось получить сообщение' as const, // 俄语
  },
  chatMessageRealtimeWaitTimeoutErrorText: {
    'en-US': () => 'Network is unstable, please refresh' as const,
    'zh-CN': () => '网络不稳定，请刷新' as const,
    'zh-TW': () => '網路不穩定，請重新整理' as const,
    'ja-JP': () => 'ネットワークが不安定です。更新してください' as const, // 日语
    'ko-KR': () => '네트워크가 불안정합니다. 새로고침 해주세요' as const, // 韩语
    'ru-RU': () => 'Сеть нестабильна, пожалуйста, обновите' as const, // 俄语
  },
  chatInputBarMessageErrorText: {
    'en-US': () => 'Network is unstable, please refresh' as const,
    'zh-CN': () => '网络不稳定，请刷新' as const,
    'zh-TW': () => '網路不穩定，請重新整理' as const,
    'ja-JP': () => 'ネットワークが不安定です。更新してください' as const, // 日语
    'ko-KR': () => '네트워크가 불안정합니다. 새로고침 해주세요' as const, // 韩语
    'ru-RU': () => 'Сеть нестабильна, пожалуйста, обновите' as const, // 俄语
  },
  chatInputBarShiftEnterPlaceholderText: {
    'en-US': () => 'Shortcut: Shift + Enter to send' as const,
    'zh-CN': () => '快捷键：Shift + Enter 发送消息' as const,
    'zh-TW': () => '快速鍵：Shift + Enter 發送訊息' as const,
    'ja-JP': () => 'ショートカット: Shift + Enter で送信' as const, // 日语
    'ko-KR': () => '단축키: Shift + Enter 로 메시지 전송' as const, // 韩语
    'ru-RU': () => 'Сочетание клавиш: Shift + Enter — отправка' as const, // 俄语
  },
  chatMessageReplyMessageImageShowText: {
    'en-US': () => '[image]' as const,
    'zh-CN': () => '[图片]' as const,
    'zh-TW': () => '[圖片]' as const,
    'ja-JP': () => '[画像]' as const,
    'ko-KR': () => '[이미지]' as const,
    'ru-RU': () => '[изображение]' as const,
  },
  chatMessageReplyMessageFileShowText: {
    'en-US': () => '[file]' as const,
    'zh-CN': () => '[文件]' as const,
    'zh-TW': () => '[檔案]' as const,
    'ja-JP': () => '[ファイル]' as const,
    'ko-KR': () => '[파일]' as const,
    'ru-RU': () => '[Файл]' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
