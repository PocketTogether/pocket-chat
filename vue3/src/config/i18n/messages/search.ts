import type { I18nMessagesSatisfiesType } from '.'

/**
 * i18nMessages 搜索相关部分
 */
export const i18nMessagesSearchPart = {
  searchPageSearchQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },

  searchPageSearchPlaceholderText: {
    'en-US': () => 'Search message content or message ID' as const,
    'zh-CN': () => '搜索消息内容、消息 ID' as const,
    'zh-TW': () => '搜尋訊息內容、訊息 ID' as const,
    'ja-JP': () => 'メッセージ内容・メッセージIDを検索' as const,
    'ko-KR': () => '메시지 내용 또는 메시지 ID 검색' as const,
    'ru-RU': () => 'Поиск по содержимому или ID сообщения' as const,
  },

  searchPageSortDescText: {
    'en-US': () => 'Descending' as const,
    'zh-CN': () => '降序排序' as const,
    'zh-TW': () => '降序排序' as const,
    'ja-JP': () => '降順' as const,
    'ko-KR': () => '내림차순' as const,
    'ru-RU': () => 'По убыванию' as const,
  },

  searchPageSortAscText: {
    'en-US': () => 'Ascending' as const,
    'zh-CN': () => '升序排序' as const,
    'zh-TW': () => '升序排序' as const,
    'ja-JP': () => '昇順' as const,
    'ko-KR': () => '오름차순' as const,
    'ru-RU': () => 'По возрастанию' as const,
  },

  // 左右按钮下的小字，如 “发送时间”
  searchPageSortFieldText: {
    'en-US': () => 'Send Time' as const,
    'zh-CN': () => '发送时间' as const,
    'zh-TW': () => '發送時間' as const,
    'ja-JP': () => '送信時間' as const,
    'ko-KR': () => '전송 시간' as const,
    'ru-RU': () => 'Время отправки' as const,
  },

  searchPagePaginationBarNoMoreText: {
    'en-US': () => 'No more...' as const,
    'zh-CN': () => '没有更多了...' as const,
    'zh-TW': () => '沒有更多了...' as const,
    'ja-JP': () => 'これ以上ありません...' as const,
    'ko-KR': () => '더 이상 없습니다...' as const,
    'ru-RU': () => 'Больше нет...' as const,
  },

  searchPageMessageListTitle: {
    'en-US': () => 'Messages' as const,
    'zh-CN': () => '消息' as const,
    'zh-TW': () => '訊息' as const,
    'ja-JP': () => 'メッセージ' as const,
    'ko-KR': () => '메시지' as const,
    'ru-RU': () => 'Сообщения' as const,
  },
} as const satisfies I18nMessagesSatisfiesType
