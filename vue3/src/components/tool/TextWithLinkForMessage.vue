<script setup lang="ts">
import { computed } from 'vue'
import {
  chatLinkContentMaxLength,
  pbMessagesMentionMapSchema,
  userMessageMentionRegexAtUsernameIndexNum,
  userMessageMentionRegexBulidFn,
  userMessageMentionRegexUsernameIndexNum,
} from '@/config'
import type { UsersResponse } from '@/lib'
import type { MessagesResponseWidthExpand } from '@/api'
import { useRouterHistoryTool } from '@/composables'

const props = defineProps<{
  // 字符串数据
  messageData: MessagesResponseWidthExpand
  // a标签的样式
  aTwcss?: string
}>()

// messageData 是像这样的
// {
//   "id": "test",
//   "content": "啊啊啊啊啊 @haruki @alice",
//   "mentionedUsers": [
//     "abc123",
//     "xyz789"
//   ],
//   "mentionMap"（在ts里类型是unknow）: {
//     "haruki": "abc123",
//     "alice": "xyz789"
//   },
//   "created": "2022-01-01 10:00:00.123Z",
//   "updated": "2022-01-01 10:00:00.123Z"
//   "expand"?: {
//     "mentionedUsers"?: [
//       {
//         "id": "abc123",
//         "username": "haruki"
//         // ...
//       },
//       {
//         "id": "xyz789",
//         "username": "alice"
//         // ...
//       }
//     ]
//   }
//   // ...
// }

// MessagesResponseWidthExpand 比 MessagesResponse 多的 就是 expand
// {
//   expand?: {
//     mentionedUsers?: UsersResponse[]
//   }
// }

// "mentionMap"（在ts里类型是unknow）需校验，已准备
// import { pbMessagesMentionMapSchema } from '@/config'
// /**
//  * PocketBase `messages` 集合中 JSON 字段 `mentionMap` 的 Zod 校验 Schema。
//  *
//  * 用途：
//  * - 记录消息文本中出现的 @username 与其对应的稳定 userId 的映射关系。
//  * - 解决用户名可被用户修改的问题，确保消息在任何时间点都能正确指向被提及的用户。
//  *
//  * 数据结构说明：
//  * - 键（key）：消息内容中实际出现的用户名（username 字符串）。
//  * - 值（value）：该用户名当时对应的稳定 userId（来自 `users` 集合）。
//  *
//  * 示例：
//  * {
//  *   "haruki": "abc123",
//  *   "alice": "xyz789"
//  * }
//  *
//  * 备注：
//  * - 与关系字段 `mentionedUsers` 配合使用：
//  *   - `mentionMap` 负责“文本层”的 username → userId 映射。
//  *   - `mentionedUsers` 负责“关系层”的 userId → 用户记录引用。
//  * - 两者共同确保 @mention 的解析在未来依然稳定可靠。
//  */
// export const pbMessagesMentionMapSchema = z.record(
//   z.string(), // username
//   z.string() // userId
// )

const messageContent = computed<string>(() => props.messageData.content)

const messageMentionMap = computed<Record<string, string>>(() => {
  const parsedMentionMap = pbMessagesMentionMapSchema.safeParse(
    props.messageData.mentionMap
  )

  if (parsedMentionMap.success === false) {
    return {}
  }
  return parsedMentionMap.data
})

const messageMentionedUsers = computed<UsersResponse[]>(() => {
  const mentionedUsers = props.messageData.expand?.mentionedUsers

  if (mentionedUsers == null) {
    return []
  }
  return mentionedUsers
})

interface PostContentTextPart {
  type: 'text'
  content: string
}
interface PostContentLinkPart {
  type: 'link'
  content: string
  href: string
}
interface PostContentMentionPart {
  type: 'mention'
  content: string // "@haruki" 这种字符串
  userId: string
  userData?: UsersResponse
}

type PostContentPart =
  | PostContentTextPart
  | PostContentLinkPart
  | PostContentMentionPart

// /**
//  * 构建一个用于匹配用户消息中 @username 的正则表达式。
//  *
//  * 每次调用都会返回一个全新的 RegExp 实例，避免 `g` 标志导致的 lastIndex 状态污染。
//  *
//  * 匹配规则：
//  * - 前置边界：字符串开头或空白字符（会被匹配并包含在 match[0] 中）
//  * - `@` 符号
//  * - 用户名：由 1–32 位字母、数字或下划线组成
//  * - 后置边界：字符串结尾或空白字符（通过先行断言匹配，不会被消费）
//  *
//  * 使用了 `g` 和 `m` 标志：
//  * - `g`：允许通过 `exec()` 进行多次迭代匹配
//  * - `m`：使 `^` 和 `$` 在多行文本中按行匹配
//  *
//  * 注意：不吃后空格、会吃前空格，处理时注意判断并修正index
//  * - 由于前置分组 `(^|\\s)` 会消费空格，`match.index` 指向的是前置空格的位置。
//  * - 如果需要获得精确的 '@' 位置，可通过以下方式修正：
//  *     const correctedIndex = match.index + (match[0].length - match[2].length)
//  *
//  * 捕获组说明：
//  * - match[2]：完整的 @username（如 "@haruki"）
//  * - match[3]：username 本体（如 "haruki"）
//  *
//  * @returns {RegExp} 一个新的、无状态的 RegExp 实例
//  */
// //
// export const userMessageMentionRegexBulidFn = (): RegExp =>
//   /(^|\s)(@([a-zA-Z0-9_]{1,32}))(?=$|\s)/gm

// const textToPostContentPartForMention = (text: string): PostContentPart[] => {
//   // 匹配 @username 并处理
//   // 根据 username 在 mentionMap 找，如果找不到也可在 expand?.mentionedUsers? 里找
//   // 找不到，本个就是 type: 'text'
//   // 找得到，本个就是 type: 'mention'
//   // userId 是id
//   // userData 是expand?.mentionedUsers?里的item
//   // content 注意是 `@${username}`

//   // // 匹配 @usernae 并处理
//   // const mentionRegex = userMessageMentionRegexBulidFn()
//   // const matches = xxxxxxText.matchAll(mentionRegex)
//   // for (const match of matches) {
//   // // ...
//   // }
// }
const textToPostContentPartForMention = (text: string): PostContentPart[] => {
  const parts: PostContentPart[] = []
  const mentionRegex = userMessageMentionRegexBulidFn()

  let lastIndex = 0

  const matches = text.matchAll(mentionRegex)
  for (const match of matches) {
    const fullMatch = match[0] // 可能包含前置空格
    const mentionText =
      // match[2] // "@haruki"
      match[userMessageMentionRegexAtUsernameIndexNum]

    const username =
      // match[3] // "haruki"
      match[userMessageMentionRegexUsernameIndexNum]

    const matchIndex = match.index
    if (matchIndex == null) continue

    // 修正 index：match.index 指向前置空格，需要定位到 '@'
    const correctedIndex = matchIndex + (fullMatch.length - mentionText.length)

    // 1. 先推入 mention 前面的普通文本
    if (correctedIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, correctedIndex),
      })
    }

    // 2. 查找 userId
    const userId = messageMentionMap.value[username]
    if (userId == null) {
      // mentionMap 找不到 → 当普通文本处理
      parts.push({
        type: 'text',
        content: mentionText,
      })
      lastIndex = correctedIndex + mentionText.length
      continue
    }

    // 3. 查找 expand?.mentionedUsers? 中的 userData
    const userData = messageMentionedUsers.value.find((u) => u.id === userId)

    // 4. 推入 mention part
    parts.push({
      type: 'mention',
      content: mentionText,
      userId,
      userData,
    })

    // 更新 lastIndex
    lastIndex = correctedIndex + mentionText.length
  }

  // 5. 最后剩余的文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts
}

const textToPostContentPartForLink = (text: string): PostContentPart[] => {
  const parts: PostContentPart[] = [] // 用于存储解析后的部分
  const regex = /(https?:\/\/[^\s]+)/g // 匹配链接的正则表达式
  let lastIndex = 0 // 记录上一个匹配结束的位置

  // 使用 matchAll 方法找到所有链接
  const matches = text.matchAll(regex)
  for (const match of matches) {
    const offset = match.index // 当前匹配的开始位置
    // 如果当前匹配前有普通文本部分，添加到 parts 数组
    if (offset > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, offset),
      })
    }
    // 添加链接部分到 parts 数组
    // 限制链接文本长度
    const linkContent = (() => {
      const cutHttp = match[0].replace(/https?:\/\//, '')
      const limitLength = (() => {
        const maxLength = chatLinkContentMaxLength
        if (cutHttp.length > maxLength) {
          return cutHttp.slice(0, maxLength) + '...'
        } else {
          return cutHttp
        }
      })()
      return limitLength
    })()
    parts.push({
      type: 'link',
      content: linkContent,
      href: match[0],
    })
    // 更新 lastIndex 为当前匹配结束的位置
    lastIndex = offset + match[0].length
  }

  // 如果最后一个匹配后还有剩余的普通文本部分，添加到 parts 数组
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts // 返回解析后的部分数组
}

// const textToPostContentPart = (text: string): PostContentPart[] => {
//   // 先 textToPostContentPartForMention 处理，得到 结果1
//   // 再处理 结果1 中的 type: 'text' PostContentTextPart 的 content: string
//   // content 给 textToPostContentPartForLink
// }
const textToPostContentPart = (text: string): PostContentPart[] => {
  const mentionParts = textToPostContentPartForMention(text)
  const finalParts: PostContentPart[] = []

  for (const part of mentionParts) {
    if (part.type !== 'text') {
      // mention 或 link（未来可能扩展）直接推入
      finalParts.push(part)
      continue
    }

    // 对纯文本部分做 link 解析
    const linkParts = textToPostContentPartForLink(part.content)
    for (const lp of linkParts) {
      finalParts.push(lp)
    }
  }

  return finalParts
}

const contentParts = computed((): PostContentPart[] => {
  return textToPostContentPart(messageContent.value)
})

const {
  // 跳转至用户详情页的方法
  routerGoUserInfoPage,
} = useRouterHistoryTool()
</script>
<template>
  <div class="text-with-link">
    <template v-for="(part, index) in contentParts">
      <template v-if="part.type === 'mention'">
        <span
          :key="index"
          :class="aTwcss"
          class="cursor-pointer"
          @click="
            routerGoUserInfoPage({
              userId: part.userId,
              presetUserGetOneData: part.userData,
            })
          "
        >
          {{ part.content }}
        </span>
      </template>
      <template v-else-if="part.type === 'link'">
        <a
          :key="index"
          :href="part.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="aTwcss"
        >
          {{ part.content }}
        </a>
      </template>
      <span v-else :key="index">{{ part.content }}</span>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
