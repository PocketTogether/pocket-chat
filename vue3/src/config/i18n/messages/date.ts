import type {
  ConvertSecondsToTimeDurationMessages,
  UseTimeAgoMessagesType,
} from '@/types'
import type { I18nMessagesSatisfiesType } from '.'

/**
 * i18nMessages 日期相关部分
 */
export const i18nMessagesDatePart = {
  // 用于 convertSecondsToTimeDuration
  convertSecondsToTimeDurationMessages: {
    // 国际单位符号
    // day：d
    // hour：h
    // minute：min
    // second：s
    'en-US': () => {
      return {
        day: 'd',
        hour: 'h',
        minute: 'min',
        second: 's',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    },
    'zh-CN': () => {
      return {
        day: '天',
        hour: '小时',
        minute: '分钟',
        second: '秒',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    },
    'zh-TW': () => {
      return {
        day: '天',
        hour: '小時',
        minute: '分鐘',
        second: '秒',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    },
    'ja-JP': () => {
      return {
        day: '日',
        hour: '時間',
        minute: '分',
        second: '秒',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    }, // 日语
    'ko-KR': () => {
      return {
        day: '일',
        hour: '시간',
        minute: '분',
        second: '초',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    }, // 韩语
    'ru-RU': () => {
      return {
        day: 'дн',
        hour: 'ч',
        minute: 'мин',
        second: 'с',
      } as const satisfies ConvertSecondsToTimeDurationMessages
    }, // 俄语
  },

  // 用于 useTimeAgo '@vueuse/core'
  useTimeAgoMessages: {
    'en-US': () => {
      // 参考 DEFAULT_MESSAGES
      // node_modules\.pnpm\@vueuse+core@13.3.0_vue@3.5.16_typescript@5.8.3_\node_modules\@vueuse\core\index.mjs#L6752
      return {
        justNow: 'just now',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n} ago` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `in ${n}` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'last month'
              : 'next month'
            : `${n} month${n > 1 ? 's' : ''}`,
        year: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'last year'
              : 'next year'
            : `${n} year${n > 1 ? 's' : ''}`,
        day: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'yesterday'
              : 'tomorrow'
            : `${n} day${n > 1 ? 's' : ''}`,
        week: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'last week'
              : 'next week'
            : `${n} week${n > 1 ? 's' : ''}`,
        hour: (n: number) => `${n} hour${n > 1 ? 's' : ''}`,
        minute: (n: number) => `${n} minute${n > 1 ? 's' : ''}`,
        second: (n: number) => `${n} second${n > 1 ? 's' : ''}`,
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },

    'zh-CN': () => {
      return {
        justNow: '刚刚',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}前` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}后` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '上个月' : '下个月') : `${n}个月`,
        year: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '去年' : '明年') : `${n}年`,
        day: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '昨天' : '明天') : `${n}天`,
        week: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '上周' : '下周') : `${n}周`,
        hour: (n: number) => `${n}小时`,
        minute: (n: number) => `${n}分钟`,
        second: (n: number) => `${n}秒`,
        // invalid: '无效时间',
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },

    'zh-TW': () => {
      return {
        justNow: '剛剛',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}前` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}後` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '上個月' : '下個月') : `${n}個月`,
        year: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '去年' : '明年') : `${n}年`,
        day: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '昨天' : '明天') : `${n}天`,
        week: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '上週' : '下週') : `${n}週`,
        hour: (n: number) => `${n}小時`,
        minute: (n: number) => `${n}分鐘`,
        second: (n: number) => `${n}秒`,
        // invalid: '無效時間',
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },

    'ja-JP': () => {
      return {
        justNow: 'たった今',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}前` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n}後` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '先月' : '来月') : `${n}か月`,
        year: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '去年' : '来年') : `${n}年`,
        day: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '昨日' : '明日') : `${n}日`,
        week: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '先週' : '来週') : `${n}週間`,
        hour: (n: number) => `${n}時間`,
        minute: (n: number) => `${n}分`,
        second: (n: number) => `${n}秒`,
        // invalid: '無効な時間',
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },

    'ko-KR': () => {
      return {
        justNow: '방금',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n} 전` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n} 후` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '지난달' : '다음달') : `${n}개월`,
        year: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '작년' : '내년') : `${n}년`,
        day: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '어제' : '내일') : `${n}일`,
        week: (n: number, past?: boolean) =>
          n === 1 ? (past === true ? '지난주' : '다음주') : `${n}주`,
        hour: (n: number) => `${n}시간`,
        minute: (n: number) => `${n}분`,
        second: (n: number) => `${n}초`,
        // invalid: '잘못된 시간',
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },

    'ru-RU': () => {
      // 辅助函数：根据数字返回正确的俄语词尾
      const pluralize = (n: number, one: string, few: string, many: string) => {
        const mod10 = n % 10
        const mod100 = n % 100
        if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
          return `${n} ${few}`
        return `${n} ${many}`
      }

      return {
        justNow: 'только что',
        past: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `${n} назад` : `${n}`,
        future: (n: string | number) =>
          typeof n === 'string' && n.match(/\d/) ? `через ${n}` : `${n}`,
        month: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'в прошлом месяце'
              : 'в следующем месяце'
            : pluralize(n, 'месяц', 'месяца', 'месяцев'),
        year: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'в прошлом году'
              : 'в следующем году'
            : pluralize(n, 'год', 'года', 'лет'),
        day: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'вчера'
              : 'завтра'
            : pluralize(n, 'день', 'дня', 'дней'),
        week: (n: number, past?: boolean) =>
          n === 1
            ? past === true
              ? 'на прошлой неделе'
              : 'на следующей неделе'
            : pluralize(n, 'неделя', 'недели', 'недель'),
        hour: (n: number) => pluralize(n, 'час', 'часа', 'часов'),
        minute: (n: number) => pluralize(n, 'минута', 'минуты', 'минут'),
        second: (n: number) => pluralize(n, 'секунда', 'секунды', 'секунд'),
        // invalid: 'недопустимое время',
        invalid: '',
      } as const satisfies UseTimeAgoMessagesType
    },
  },
} as const satisfies I18nMessagesSatisfiesType
