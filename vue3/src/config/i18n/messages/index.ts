import { i18nMessagesChatPart } from './chat'
import { i18nMessagesDatePart } from './date'
import type { I18nLocaleType } from './dependencies'
import { i18nMessagesHomePart } from './home'
import { i18nMessagesLoginPart } from './login'
import { i18nMessagesNotificationPart } from './notification'
import { i18nMessagesPagePart } from './page'
import { i18nMessagesRegisterPart } from './register'
import { i18nMessagesRoomPart } from './room'
import { i18nMessagesSettingPart } from './setting'
import { i18nMessagesTagsPart } from './tags'
import { i18nMessagesUploadPart } from './upload'

export type I18nMessagesSatisfiesType = Record<
  string,
  Record<I18nLocaleType, unknown>
>

// 语言内容，写成函数有利于插入可变内容
// 同类的尽量保持开头单词一致有利于参数提示
// as const 使其有完整的字面量类型推导
// satisfies 确保其每一项不会缺少
// 还需要确保每组函数类型是一样的，这个只能自己注意了
export const i18nMessages = {
  // 主页相关部分
  ...i18nMessagesHomePart,
  // 标签相关部分
  ...i18nMessagesTagsPart,
  // 页面相关部分
  ...i18nMessagesPagePart,
  // 登录相关部分
  ...i18nMessagesLoginPart,
  // 注册相关部分
  ...i18nMessagesRegisterPart,
  // 提示信息相关部分
  ...i18nMessagesNotificationPart,
  // 日期相关部分
  ...i18nMessagesDatePart,
  // 设置页相关部分
  ...i18nMessagesSettingPart,
  // 聊天页相关部分
  ...i18nMessagesChatPart,
  // 房间页相关部分
  ...i18nMessagesRoomPart,
  // 上传相关部分
  ...i18nMessagesUploadPart,
} as const satisfies I18nMessagesSatisfiesType

// 通过类型体操，获取i18nMessages键的类型
export type I18nMessagesKeyType = keyof typeof i18nMessages

// 将在 src\stores\i18n.ts 使用
// 页面中再使用 i18nStore.t 获取当前语言的内容

// 'en-US': () => '' as const,
// 'zh-CN': () => '' as const,
// 'zh-TW': () => '' as const,
// 'ja-JP': () => '' as const,
// 'ko-KR': () => '' as const,
// 'ru-RU': () => '' as const,

export * from './upload'
