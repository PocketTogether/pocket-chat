import { usersStatusItemPresenceStatusKeyConfig } from '@/config'
import type { I18nMessagesSatisfiesType } from '.'

const usipskc = usersStatusItemPresenceStatusKeyConfig

/**
 * i18nMessages 用户实时状态相关部分
 */
export const i18nMessagesUsersStatusPart = {
  // usersStatusText_xxxx
  [`usersStatusText_${usipskc.offline}` as const]: {
    'en-US': () => 'Offline' as const,
    'zh-CN': () => '离线' as const,
    'zh-TW': () => '離線' as const,
    'ja-JP': () => 'オフライン' as const,
    'ko-KR': () => '오프라인' as const,
    'ru-RU': () => 'Не в сети' as const,
  },
  [`usersStatusText_${usipskc.online}` as const]: {
    'en-US': () => 'Online' as const,
    'zh-CN': () => '在线' as const,
    'zh-TW': () => '在線' as const,
    'ja-JP': () => 'オンライン' as const,
    'ko-KR': () => '온라인' as const,
    'ru-RU': () => 'В сети' as const,
  },
  [`usersStatusText_${usipskc.typing}` as const]: {
    'en-US': () => 'Typing' as const,
    'zh-CN': () => '输入中' as const,
    'zh-TW': () => '輸入中' as const,
    'ja-JP': () => '入力中' as const,
    'ko-KR': () => '입력 중' as const,
    'ru-RU': () => 'Печатает' as const,
  },
  [`usersStatusText_${usipskc.not_viewing}` as const]: {
    'en-US': () => 'Idle' as const,
    'zh-CN': () => '闲置' as const,
    'zh-TW': () => '閒置' as const,
    'ja-JP': () => '待機中' as const,
    'ko-KR': () => '자리 비움' as const,
    'ru-RU': () => 'Неактивен' as const,
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
