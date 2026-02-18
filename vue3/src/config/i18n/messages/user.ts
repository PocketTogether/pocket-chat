import type { I18nMessagesSatisfiesType } from '.'

/**
 * i18nMessages 用户相关部分
 */
export const i18nMessagesUserPart = {
  userPageUserQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },

  userPageSearchPlaceholderText: {
    'en-US': () => 'Search username, name, or bio' as const,
    'zh-CN': () => '搜索用户名、名称、简介' as const,
    'zh-TW': () => '搜尋使用者名稱、名稱、簡介' as const,
    'ja-JP': () => 'ユーザー名、名前、自己紹介を検索' as const,
    'ko-KR': () => '사용자명, 이름, 소개 검색' as const,
    'ru-RU': () => 'Поиск по имени пользователя, имени или био' as const,
  },

  userPageSortDescText: {
    'en-US': () => 'Descending' as const,
    'zh-CN': () => '降序排序' as const,
    'zh-TW': () => '降序排序' as const,
    'ja-JP': () => '降順' as const,
    'ko-KR': () => '내림차순' as const,
    'ru-RU': () => 'По убыванию' as const,
  },

  userPageSortAscText: {
    'en-US': () => 'Ascending' as const,
    'zh-CN': () => '升序排序' as const,
    'zh-TW': () => '升序排序' as const,
    'ja-JP': () => '昇順' as const,
    'ko-KR': () => '오름차순' as const,
    'ru-RU': () => 'По возрастанию' as const,
  },

  userPageSortFieldJoinedAtText: {
    'en-US': () => 'Join Time' as const,
    'zh-CN': () => '加入时间' as const,
    'zh-TW': () => '加入時間' as const,
    'ja-JP': () => '参加時間' as const,
    'ko-KR': () => '가입 시간' as const,
    'ru-RU': () => 'Время присоединения' as const,
  },

  userPagePaginationBarNoMoreText: {
    'en-US': () => 'No more...' as const,
    'zh-CN': () => '没有更多了...' as const,
    'zh-TW': () => '沒有更多了...' as const,
    'ja-JP': () => 'これ以上ありません...' as const,
    'ko-KR': () => '더 이상 없습니다...' as const,
    'ru-RU': () => 'Больше нет...' as const,
  },

  userInfoPageUserQueryRefreshText: {
    'en-US': () => 'Refresh' as const,
    'zh-CN': () => '刷新' as const,
    'zh-TW': () => '重新整理' as const,
    'ja-JP': () => '更新' as const,
    'ko-KR': () => '새로고침' as const,
    'ru-RU': () => 'Обновить' as const,
  },
} as const satisfies I18nMessagesSatisfiesType

/*
    'en-US': () => '' as const,
    'zh-CN': () => '' as const,
    'zh-TW': () => '' as const,
    'ja-JP': () => '' as const,
    'ko-KR': () => '' as const,
    'ru-RU': () => '' as const,
*/
