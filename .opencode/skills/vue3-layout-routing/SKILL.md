---
name: vue3-layout-routing
description: >-
  Use when working on page layout (single/dual column), router configuration, responsive design, or page scroll position restoration in the vue3/ directory.
  在 vue3/ 中处理页面布局（单列/双列）、路由配置、响应式设计、页面返回内容恢复时使用。
---

# Vue3 布局、路由与页面恢复

## 基本布局习惯

pocket-chat 没有全局性的侧栏、顶栏或底栏，一般顶栏或底栏都在单独的某列中。

### 单列布局

参考 `vue3/src/views/file-info/FileInfoPage.vue`：

```vue
<template>
  <div>
    <!-- 边距控制 -->
    <div class="mx-[8px]">
      <div class="mx-auto" :style="{ maxWidth: '500px' }">
        <div class="relative">
          <!-- 顶栏 -->
          <div class="sticky top-0 z-[1] flow-root">
            <!-- 顶栏内容 -->
          </div>
          <!-- 内容 -->
          <!-- 加载状态 -->
          <!-- 文件不存在 -->
        </div>
      </div>
    </div>
  </div>
</template>
```

### 较宽的单列布局

参考 `vue3/src/views/chat-home/ChatHome.vue`，根据窗口宽度动态调整边距：

```vue
<template>
  <div
    :class="{
      'mx-[40px]': showChatWidthLargerTrueWidthSmallerFalse,
      'mx-[8px]': !showChatWidthLargerTrueWidthSmallerFalse,
    }"
  >
    <div class="mx-auto max-w-[768px]">
      <!-- 聊天列内容 -->
    </div>
  </div>
</template>
```

### 双列布局

参考 `vue3/src/views/file/FileSelectPage.vue`，使用 `ContainerBar` + `ContainerCol2` 组件，需要考虑大小屏响应式：

```vue
<script setup lang="ts">
import { ContainerBar, ContainerCol2 } from '@/components'
</script>
<template>
  <div>
    <!-- 大屏 双列 -->
    <div v-if="windowSize.width.value >= 768">
      <ContainerCol2
        col1Position="right"
        :col2StyleValue="{ width: windowSize.width.value >= 1024 ? '500px' : '400px' }"
        col1Twcss="flex-1 overflow-hidden"
      >
        <template #col2>
          <div class="ml-6 mr-4">
            <ContainerBar :defaultBarHeight="60">
              <template #default>
                <div class="relative mb-4">
                  <div class="sticky top-0 z-[1] flow-root">
                    <!-- 顶栏 -->
                  </div>
                  <!-- 操作面板、上传列表、文件预览 -->
                </div>
              </template>
              <template #bar>
                <div class="flow-root">
                  <!-- 底栏 -->
                </div>
              </template>
            </ContainerBar>
          </div>
        </template>
        <template #col1>
          <div class="my-4 ml-2 mr-6">
            <!-- 文件列表 -->
          </div>
        </template>
      </ContainerCol2>
    </div>
    <!-- 小屏 单列 -->
    <div v-else>
      <div class="mx-[8px]">
        <div class="mx-auto" :style="{ maxWidth: '500px' }">
          <ContainerBar :defaultBarHeight="52">
            <template #default>
              <!-- 顶栏 + 内容 -->
            </template>
            <template #bar>
              <!-- 底栏 -->
            </template>
          </ContainerBar>
        </div>
      </div>
    </div>
  </div>
</template>
```

---

## 路由配置

### 页面路由一览

- 主页（聊天页）— 单列布局，有顶栏底栏，底栏即聊天输入栏
- 设置页
- 登录页
- 图片选择页
- 图片详情页
- 文件选择页
- 文件详情页

### router.ts 结构

```ts
import {
  ChatHome, ChatSetting, FileInfoPage, FileSelectPage,
  ImageInfoPage, ImageSelectPage, LayoutSimple, LoginPage,
} from './views'
import { routerDict } from './config'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      ...routerDict.LayoutSimple,
      component: LayoutSimple,
      redirect: routerDict.ChatHome.path,
      children: [
        { ...routerDict.LoginPage, component: LoginPage },
        { ...routerDict.ChatHome, component: ChatHome },
        { ...routerDict.ChatSetting, component: ChatSetting },
        { ...routerDict.ImageSelectPage, component: ImageSelectPage },
        { ...routerDict.ImageInfoPage, component: ImageInfoPage },
        { ...routerDict.FileSelectPage, component: FileSelectPage },
        { ...routerDict.FileInfoPage, component: FileInfoPage },
      ],
    },
  ],
})
```

### LayoutSimple

```vue
<template>
  <div class="layout-simple">
    <RouterView></RouterView>
  </div>
</template>
<style lang="scss" scoped>
.layout-simple {
  max-width: 2000px;
  margin: 0 auto;
}
</style>
```

### App.vue 主滚动条

```vue
<template>
  <div>
    <ElScrollbar ref="appMainElScrollbar" height="100dvh" class="appMainElScrollbar">
      <RouterView></RouterView>
    </ElScrollbar>
  </div>
</template>
```

### routerDict 配置

`vue3/src/config/router.ts`：

```ts
interface RouterItem {
  path: string
  name: string
  paramsKey?: Record<string, string>
}

export const routerDict = {
  ChatHome: { path: '/', name: 'ChatHome' },
  ChatSetting: { path: '/setting', name: 'SettingPage' },
  LayoutSimple: { path: '/LayoutSimple', name: 'LayoutSimple' },
  LoginPage: { path: '/login', name: 'LoginPage' },
  ImageSelectPage: { path: '/image-select', name: 'ImageSelectPage' },
  ImageInfoPage: (() => {
    const paramsKey = { id: 'id' } as const
    return {
      path: `/image-info/:${paramsKey.id}`,
      name: 'ImageInfoPage',
      paramsKey,
    } as const
  })(),
  FileSelectPage: { path: '/file-select', name: 'FileSelectPage' },
  FileInfoPage: (() => {
    const paramsKey = { id: 'id' } as const
    return {
      path: `/file-info/:${paramsKey.id}`,
      name: 'FileInfoPage',
      paramsKey,
    } as const
  })(),
} as const satisfies Record<string, RouterItem>
```

---

## 页面返回时的内容恢复

### 机制概述

当用户在某个页面（如聊天页）向上滚动了很多，然后跳转到其他页面（如设置页），操作完毕后点击返回回到聊天页时，聊天页能恢复到之前浏览的位置。

不是每个页面都需要内容恢复功能，内容很少的页面就没必要做。

### 关键文件

- `src/stores/router-history/router-history.ts` — 自建路由栈，跟踪路由变化，存储恢复数据
- 示例1 恢复模块：`src/stores/router-history/modules/recover-chat-col.ts`
- 示例1 恢复逻辑：`src/components/chat/chat-col/composables/chat-display-dependent-data.ts`
- 示例2 恢复模块：`src/stores/router-history/modules/recover-file-select-page.ts`
- 示例2 恢复逻辑：`src/views/file/composables/page-recover.ts`

### router-history.ts 中新增页面恢复的模式

1. 在 `src/stores/router-history/modules/` 下新建 `recover-xxx.ts`，定义恢复数据类型和模块函数
2. 在 `router-history.ts` 中 import 并使用该模块
3. 在 `routerAfterEachCheckHistoryStateAndControlRouterHistoryStack` 中添加清理逻辑

恢复数据模块的模式：

```ts
export type PageRecoverDataForXxxItemType = {
  uuid: string
  data: {
    // 该页面需要恢复的所有数据
  }
}

export const useRecoverXxxModule = (data: {
  currentUuid: Ref<string | null>
}) => {
  const { currentUuid } = data

  const pageRecoverDataForXxx = ref<Array<PageRecoverDataForXxxItemType>>([])

  const pageRecoverDataForXxxItemSetFn = (val: PageRecoverDataForXxxItemType) => {
    const find = pageRecoverDataForXxx.value.find((i) => i.uuid === val.uuid)
    if (find != null) {
      find.data = val.data
      return 'update' as const
    } else {
      pageRecoverDataForXxx.value.push(val)
      return 'push' as const
    }
  }

  const pageRecoverDataForXxxItemGetFn = (uuid: string) => {
    return pageRecoverDataForXxx.value.find((i) => i.uuid === uuid)
  }

  const currentSetPageRecoverDataForXxxItem = (data: PageRecoverDataForXxxItemType['data']) => {
    if (currentUuid.value == null) return null
    return pageRecoverDataForXxxItemSetFn({ uuid: currentUuid.value, data })
  }

  const currentGetPageRecoverDataForXxxItem = () => {
    if (currentUuid.value == null) return null
    return pageRecoverDataForXxxItemGetFn(currentUuid.value)
  }

  return {
    pageRecoverDataForXxx,
    pageRecoverDataForXxxItemSetFn,
    pageRecoverDataForXxxItemGetFn,
    currentGetPageRecoverDataForXxxItem,
    currentSetPageRecoverDataForXxxItem,
  }
}
```

在 `router-history.ts` 中的清理逻辑（在 `handleRoutorHistoryForRoutorPushFn` 中）：

```ts
pageRecoverDataForXxx.value = pageRecoverDataForXxx.value.filter((i) => {
  const find = stack.value.find((item) => item.uuid === i.uuid)
  return find != null
})
```
