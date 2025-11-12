<script setup lang="ts">
import { computed } from 'vue'
import { chatLinkContentMaxLength } from '@/config'

const props = defineProps<{
  // 字符串数据
  data: string
  // a标签的样式
  aTwcss?: string
}>()

interface PostContentTextPart {
  type: 'text'
  content: string
}
interface PostContentLinkPart {
  type: 'link'
  content: string
  href: string
}
type PostContentPart = PostContentTextPart | PostContentLinkPart

const textToPostContentPart = (text: string): PostContentPart[] => {
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

const contentParts = computed((): PostContentPart[] => {
  return textToPostContentPart(props.data)
})
</script>
<template>
  <div class="text-with-link">
    <template v-for="part in contentParts">
      <template v-if="part.type === 'link'">
        <a
          :key="part.content"
          type="primary"
          :href="part.href"
          target="_blank"
          rel="noopener noreferrer"
          :class="aTwcss"
        >
          {{ part.content }}
        </a>
      </template>
      <template v-else>{{ part.content }}</template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.text-with-link {
  a {
    // color: var(--el-color-primary); // 未访问链接的颜色
    // text-decoration: none; // 平时不显示下划线

    // &:visited {
    //   color: var(--el-color-info); // 已访问链接的颜色
    // }

    // &:hover {
    //   color: var(--el-color-success); // 悬停时的颜色
    //   text-decoration: underline; // 悬停时显示下划线
    // }
  }
}
</style>
