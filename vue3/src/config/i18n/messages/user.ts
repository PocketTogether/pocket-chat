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
    'en-US': () => '' as const,
    'zh-CN': () => '搜索用户名、名称、简介' as const,
    'zh-TW': () => '' as const,
    'ja-JP': () => '' as const,
    'ko-KR': () => '' as const,
    'ru-RU': () => '' as const,
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
