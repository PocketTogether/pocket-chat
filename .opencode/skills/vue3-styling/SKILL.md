---
name: vue3-styling
description: >-
  Use when writing or modifying UI styles, CSS variables, Tailwind classes, color themes, avatar rendering, scrollbar, dialog, dropdown menus, or Material3-style components in the vue3/ directory.
  在 vue3/ 中编写或修改样式、颜色主题、CSS变量、Tailwind类名、头像渲染、滚动条、对话框、下拉菜单、Material3风格组件时使用。
---

# Vue3 样式与UI组件

## 设计风格偏好

偏好 Material3 风格（https://m3.material.io/），但不使用 Material3 官方组件库，而是自己写样式来达到 Material3 风格。

技术栈：vue3 + ts setup + tailwind + scss

---

## 颜色系统

### Element Plus 主题颜色

`vue3/src/assets/styles/element-plus.scss` 中通过 SCSS 配置：

```scss
$types: (
  primary: #7899CC,
  success: #799978,
  info: #5A7583,
  warning: #BB9854,
  danger: #AB4378,
  error: #AB4378
);
```

生成的 CSS 变量如 `--el-color-primary`、`--el-color-primary-light-1` ~ `--el-color-primary-light-9`、`--el-color-primary-dark-1` ~ `--el-color-primary-dark-9`。

**重要：`xxx-light-N` 和 `xxx-dark-N` 的含义随明暗模式反转：**
- 明色模式下：light = 更白，dark = 更黑
- 暗色模式下：light = 更黑，dark = 更白

在暗色模式下，light 和 dark 的生成函数会互换（`color-darken` 用于 light，`color-lighten` 用于 dark）。

### 背景与文字颜色

`vue3/src/assets/styles/color.scss` 中定义的 CSS 变量：

```css
--color-background: xxxx;
--color-background-soft: xxxx;
--color-background-mute: xxxx;
--color-text: xxxx;
--color-text-soft: xxxx;
```

- `color-background` — 背景色
- `color-background-soft` — 与背景色有差别，常用于内容块背景色
- `color-background-mute` — 与背景色差别更大
- `color-text` — 文字色
- `color-text-soft` — 更淡的文字色

### Tailwind 自定义类名映射

已配置的自定义 Tailwind 类名示例：

```css
.bg-el-primary-light-6 { background-color: var(--el-color-primary-light-6); }
.bg-el-danger-light-4 { background-color: var(--el-color-danger-light-4); }
.bg-color-background-soft { background-color: var(--color-background-soft); }
.text-el-danger { color: var(--el-color-danger); }
.text-color-text { color: var(--color-text); }
.text-color-text-soft { color: var(--color-text-soft); }
.text-color-background { color: var(--color-background); }
.border-color-background { border-color: var(--color-background); }
```

---

## 全局滚动条

项目在 `app.vue` 中使用 `ElScrollbar` 作为全局滚动条，不再使用原生滚动条，因此 `vueuse` 的 `useWindowScroll` 不应再使用，应使用 `useScroll`。

```ts
import { injectAppMainElScrollbar } from '@/composables'

const appMainElScrollbar = injectAppMainElScrollbar()
// 类型为 Ref<InstanceType<typeof ElScrollbar> | null>

useScroll(appMainElScrollbar)
```

操控滚动条滚动：

```ts
const appMainElScrollbar = injectAppMainElScrollbar()
appMainElScrollbar.value?.wrapRef?.scrollTo({
  top: 0,
  behavior: 'instant',
})
```

在 `router.ts` 等非组件上下文中不能使用 provide-inject，应使用 `getAppMainElScrollbarWrap`：

```ts
import { getAppMainElScrollbarWrap } from '@/utils'

router.afterEach((to, from) => {
  const appMainElScrollbarWrap = getAppMainElScrollbarWrap()
  appMainElScrollbarWrap?.scrollTo({
    top: 0,
    behavior: 'instant',
  })
})
```

---

## 头像图片显示模式

一般模式为：无数据时返回默认头像，有头像时通过 PB 文件 URL + thumb 配置返回。

```ts
import { appUserDefaultAvatar, fileUserAvatarConfig } from '@/config'
import { pb } from '@/lib'

const authorAvatarUrl = computed(() => {
  if (fileInfoDataWithRealtime.value == null) {
    return appUserDefaultAvatar
  }
  if (fileAuthor.value == null) {
    console.error('fileAuthor.value == null')
    return appUserDefaultAvatar
  }
  if (fileAuthor.value.avatar === '') {
    return appUserDefaultAvatar
  }
  return pb.files.getURL(fileAuthor.value, fileAuthor.value.avatar, {
    thumb: fileUserAvatarConfig.thumb200x200,
  })
})
```

HTML 中头像用 `div` + `backgroundImage` 实现圆形裁切：

```html
<div
  class="h-[44px] w-[44px] shrink-0 rounded-full border-[2px] border-color-background-soft bg-color-background-soft"
  :style="{
    backgroundImage: `url('${authorAvatarUrl}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }"
></div>
```

---

## 自建对话框

推荐使用 `src/components/container/ContainerDialog.vue`。

**不使用 v-model**，而是使用 `dialogVisible` 与 `dialogCloseFn` 来控制显示：

```vue
<script setup lang="ts">
defineProps<{
  dialogVisible: boolean
  dialogCloseFn: () => void
}>()
</script>
```

建议搭配 `useRouteControlDialog` 使用，通过 router 路由参数控制对话框显示（打开时 `router.push`，关闭时 `router.back`），好处是浏览器返回键或手机返回键能控制对话框关闭，而不是导致整个页面返回。

使用示例：

```vue
<script setup lang="ts">
import { ContainerDialog } from '@/components'
import { useRouteControlDialog } from '@/composables'

const { dialogVisible, dialogOpen, dialogClose } = useRouteControlDialog({
  dialogQueryKey: 'ForgotPasswordDialog',
})

defineExpose({ dialogOpen, dialogClose })
</script>

<template>
  <ContainerDialog
    :dialogVisible="dialogVisible"
    :dialogCloseFn="dialogClose"
  >
    <div class="flow-root rounded-3xl bg-color-background-soft">
      <div class="m-4">
        <!-- ... -->
      </div>
    </div>
  </ContainerDialog>
</template>
```

---

## 主页右上角下拉菜单

在 `src/views/chat-home/ChatHome.vue` 中，通过插槽向 `ChatCol` 的 `#chatTopBarMoreMenu` 传入菜单项：

```vue
<ChatCol
  :refScrollWarp="appMainElScrollbar?.wrapRef"
  :couldGoBack="false"
  roomId=""
  :chatTitle="websiteName"
>
  <template #chatTopBarMoreMenu>
    <ChatTopBarMoreMenuItem v-if="isDev" @click="testPbSendMessage">
      <template #icon>
        <RiFlaskLine size="18px"></RiFlaskLine>
      </template>
      <template #text> 测试批量添加消息 </template>
    </ChatTopBarMoreMenuItem>

    <ChatTopBarMoreMenuItem
      v-if="authStore.isValid"
      @click="$router.push(routerDict.ChatSetting.path)"
    >
      <template #icon>
        <RiSettingsLine size="18px"></RiSettingsLine>
      </template>
      <template #text> {{ i18nStore.t('pageSetting')() }} </template>
    </ChatTopBarMoreMenuItem>
  </template>
</ChatCol>
```

主页右上角的下拉菜单充当简单的导航栏类似作用。

---

## 样式风格示例

### 顶栏样式

顶栏一般使用 `sticky top-0` 固定在顶部，配合 `z-[1]` 和 `flow-root`：

```html
<div class="sticky top-0 z-[1] flow-root">
  <!-- 顶栏内容 -->
</div>
```

顶栏菜单展开/收起使用 Transition 动画（如 `fade-down-up`），绝对定位叠加在顶栏上方。

### 内容块样式

内容块一般使用 `rounded-[24px] bg-color-background-soft` 圆角卡片：

```html
<div class="overflow-hidden rounded-[24px] bg-color-background-soft">
  <!-- 内容块内容 -->
</div>
```

### 分割线

分割线使用固定宽度的 border：

```html
<div class="border-t-[3px] border-color-background"></div>
```

### 加载指示器

```html
<div class="h-[40px] w-[40px] overflow-hidden text-color-text-soft">
  <RiLoader3Line class="loading-spinner-800ms" size="40px"></RiLoader3Line>
</div>
```

### 输入框样式（去除默认样式）

通过 SCSS `:deep()` 去除 Element Plus 输入框的默认边框和背景：

```scss
.textarea-box {
  :deep() {
    .el-textarea__inner {
      border: none;
      box-shadow: none;
      background-color: transparent;
      color: var(--color-text);
      font-size: 14px;
      overscroll-behavior: contain;
      &::placeholder {
        color: var(--color-text-soft);
        font-size: 14px;
        font-style: italic;
        font-weight: bold;
      }
    }
  }
}
```

### 上传区域拖拽样式

```scss
.upload-box {
  :deep() {
    .el-upload {
      .el-upload-dragger {
        background-color: unset;
        border: none;
        padding: 0;
        border-radius: 0;
        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        transition-duration: 150ms;
        &.is-dragover {
          background-color: var(--el-color-primary-light-6);
        }
      }
    }
  }
}
.file-upload-box {
  &:hover {
    .upload-border-content {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}
```

### 滚动分页栏

分页按钮使用横向 flex + overflow-hidden + ElScrollbar 实现可滚动的页码栏，选中项高亮使用 `bg-el-primary-light-6`。

---

## 样式与逻辑结合的参考实现

以下模块是目前比较满意的实现，可作为样式与逻辑结合的参考：
- `vue3/src/views/file-info` — 文件详情页（最推荐参考）
- `vue3/src/views/file` — 文件选择页
