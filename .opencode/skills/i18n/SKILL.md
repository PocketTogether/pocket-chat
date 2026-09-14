---
name: i18n
description: >-
  Use when adding or modifying i18n translation entries, using useI18nStore, or working with multi-language support in the vue3/ directory.
  在 vue3/ 中新增或修改 i18n 多语言文案、使用 useI18nStore、处理多语言支持时使用。
---

# i18n 国际化

项目使用自实现的 i18n store，不依赖第三方 i18n 库。

## 使用方式

```ts
import { useI18nStore } from '@/stores'
const i18nStore = useI18nStore()

// 基本使用
const title = i18nStore.t('chatInputBarBackBottomText')()

// 带参数
const msg = i18nStore.t('chatInputBarNewMessageText')(1)
```

## 消息字典位置

- `vue3/src/config/i18n/messages/index.ts`
- `vue3/src/config/i18n/messages/chat.ts`
- 以及其他按模块拆分的文件

## 字典条目格式

同类文案尽量保持开头单词一致，有利于参数提示：

```ts
chatInputBarBackBottomText: {
  'en-US': () => 'Back to bottom' as const,
  'zh-CN': () => '回到底部' as const,
  'zh-TW': () => '回到底部' as const,
  'ja-JP': () => '一番下へ戻る' as const,
  'ko-KR': () => '맨 아래로 돌아가기' as const,
  'ru-RU': () => 'Вернуться вниз' as const,
},
chatInputBarNewMessageText: {
  'en-US': (num: number) => `${num} new message${num > 1 ? 's' : ''}` as const,
  'zh-CN': (num: number) => `${num} 条新消息` as const,
  'zh-TW': (num: number) => `${num} 則新訊息` as const,
  'ja-JP': (num: number) => `${num} 件の新しいメッセージ` as const,
  'ko-KR': (num: number) => `${num}개의 새 메시지` as const,
  'ru-RU': (num: number) => `${num} новое сообщение${num > 1 ? 'й' : ''}` as const,
},
```

## 新增文案

1. 在 `src/config/i18n/messages/` 字典中新增条目
2. 在代码中使用 `i18nStore.t('xxx')()`

```ts
// 字典中新增
someNewText: {
  'en-US': () => 'Some new text' as const,
  'zh-CN': () => '一些新文案' as const,
  // ……
  // ……
  // ……
},

// 代码中使用
const text = i18nStore.t('someNewText')()
```
