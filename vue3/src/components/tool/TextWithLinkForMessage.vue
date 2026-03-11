<script setup lang="ts">
import { computed } from 'vue'
import {
  chatLinkContentMaxLength,
  pbMessagesMentionMapSchema,
  routerDict,
  searchPageRouterQueryParametersKeyConfig,
  userMessageMentionRegexAtUsernameIndexNum,
  userMessageMentionRegexBulidFn,
  userMessageMentionRegexUsernameIndexNum,
} from '@/config'
import type { UsersResponse } from '@/lib'
import type { MessagesResponseWidthExpand } from '@/api'
import { useRouterHistoryTool } from '@/composables'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps<{
  // 字符串数据
  messageData: MessagesResponseWidthExpand
  // a标签的样式
  aTwcss?: string
}>()

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
interface PostContentHashtagPart {
  type: 'hashtag'
  content: string // "#关键词" 这种字符串，点击后会跳转至搜索页
  messageHashtagSearchRouterResolveObj: RouteLocationRaw
}

type PostContentPart =
  | PostContentTextPart
  | PostContentLinkPart
  | PostContentMentionPart
  | PostContentHashtagPart

// // type: 'hashtag' 关键词搜索#这一块
// const textToPostContentPartForHashtag = (text: string): PostContentPart[] => {
//   // 匹配 #关键词
//   const hashtagRegex = /(^|\s)(#(\S+))(?=$|\s)/gm

//   // AITODO 模仿别的textToPostContentPartFor实现

//   // AITODO
//   // 这是处理出messageSearchRouterResolveObj的示例
//   const keywordContent = '这是处理出messageSearchRouterResolveObj的示例' // 注意前面不带#
//   const messageSearchRouterResolveObj = (() => {
//     const { search: keySearch } = searchPageRouterQueryParametersKeyConfig
//     return {
//       name: routerDict.SearchPage.name,
//       query: {
//         [keySearch]: keywordContent,
//       },
//     } satisfies RouteLocationRaw
//   })()
// }

// type: 'hashtag' 关键词搜索#这一块
const textToPostContentPartForHashtag = (text: string): PostContentPart[] => {
  const parts: PostContentPart[] = []

  const hashtagRegex = /(^|\s)(#(\S+))(?=$|\s)/gm

  let lastIndex = 0

  const matches = text.matchAll(hashtagRegex)

  for (const match of matches) {
    const fullMatch = match[0]
    const hashtagText = match[2] // "#关键词"
    const keyword = match[3] // "关键词"

    const matchIndex = match.index
    if (matchIndex == null) continue

    // 修正 index（跳过前置空格）
    const correctedIndex = matchIndex + (fullMatch.length - hashtagText.length)

    // 1️⃣ 前面的普通文本
    if (correctedIndex > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, correctedIndex),
      })
    }

    // 2️⃣ 构建 router 对象
    const messageHashtagSearchRouterResolveObj = (() => {
      const { search: keySearch } = searchPageRouterQueryParametersKeyConfig

      return {
        name: routerDict.SearchPage.name,
        query: {
          [keySearch]: keyword,
        },
      } satisfies RouteLocationRaw
    })()

    // 3️⃣ push hashtag
    parts.push({
      type: 'hashtag',
      content: hashtagText,
      messageHashtagSearchRouterResolveObj,
    })

    lastIndex = correctedIndex + hashtagText.length
  }

  // 4️⃣ 剩余文本
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts
}

// type: 'mention' 用户@这一块
const textToPostContentPartForMention = (text: string): PostContentPart[] => {
  const parts: PostContentPart[] = []
  // /(^|\s)(@([a-zA-Z0-9_]{1,32}))(?=$|\s)/gm
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

// type: 'link' 链接这一块
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
//   // 先 textToPostContentPartForMention 处理，得到 预处理结果1

//   // 再处理 预处理结果1 中的 type: 'text' PostContentTextPart 的 content: string
//   // content 给 textToPostContentPartForHashtag 处理得到 预处理结果2

//   // 再处理 预处理结果2 中的 type: 'text' PostContentTextPart 的 content: string
//   // content 给 textToPostContentPartForLink 处理得到 最终结果
// }

/**
 * 对 PostContentPart 数组中的所有 `text` 类型片段执行一次转换。
 *
 * 该函数是文本解析 pipeline 的基础工具，用于实现「阶段式解析」：
 *
 * - 仅对 type === 'text' 的部分进行处理
 * - 已解析出的 token（mention / hashtag / link 等）不会被再次解析
 * - 保证前一阶段的解析结果具有不可变性（token immutability）
 *
 * 工作流程：
 * 1. 遍历现有 parts
 * 2. 遇到非 text 类型 → 原样保留
 * 3. 遇到 text → 交给 transformer 重新拆分
 * 4. 合并为新的 parts 数组
 *
 * 该设计允许多个解析阶段串联形成 tokenizer pipeline，例如：
 *
 *   text → mention → hashtag → link
 *
 * @param parts 当前解析阶段的内容片段数组
 * @param transformer 文本转换函数，将 string 拆分为新的 PostContentPart[]
 *
 * @returns 新的 PostContentPart 数组（不可变转换结果）
 */
const transformTextParts = (
  parts: PostContentPart[],
  transformer: (text: string) => PostContentPart[]
): PostContentPart[] => {
  const result: PostContentPart[] = []

  for (const part of parts) {
    if (part.type !== 'text') {
      result.push(part)
      continue
    }

    result.push(...transformer(part.content))
  }

  return result
}

/**
 * 将原始消息文本解析为可渲染的 PostContentPart 列表。
 *
 * 解析采用「多阶段 tokenizer pipeline」：
 *
 *   Raw Text
 *      ↓
 *   mention 解析
 *      ↓
 *   hashtag 解析
 *      ↓
 *   link 解析
 *      ↓
 *   Final Parts
 *
 * 每个阶段仅处理 `text` 类型片段，
 * 已识别 token 在后续阶段保持稳定，不会被重复解析。
 *
 * 解析顺序具有语义优先级：
 *
 *   1. mention (@user)   — 最高优先级
 *   2. hashtag (#topic)
 *   3. link (URL)        — 最低优先级
 *
 * @param text 原始消息文本
 * @returns 按顺序排列的内容片段数组，用于 Vue 渲染
 */
const textToPostContentPart = (text: string): PostContentPart[] => {
  let parts: PostContentPart[] = [
    {
      type: 'text',
      content: text,
    },
  ]

  // Stage 1 — @mention
  parts = transformTextParts(parts, textToPostContentPartForMention)

  // Stage 2 — #hashtag
  parts = transformTextParts(parts, textToPostContentPartForHashtag)

  // Stage 3 — URL link
  parts = transformTextParts(parts, textToPostContentPartForLink)

  return parts
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
      <template v-else-if="part.type === 'hashtag'">
        <RouterLink
          :key="index"
          :class="aTwcss"
          :to="part.messageHashtagSearchRouterResolveObj"
        >
          {{ part.content }}
        </RouterLink>
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
