---
name: vue3-dev-conventions
description: >-
  Use when writing Vue3/TS code following project conventions: file naming, composable (desuwa) patterns, Pinia stores, API wrapper patterns, TanStack Query usage, or project structure questions.
  编写 Vue3/TS 代码时涉及项目规范：文件命名、组合式函数（desuwa模式）、Pinia store、API封装、TanStack Query 用法、项目结构时使用。
---

# Vue3/TS 开发规范与习惯

## 项目结构

- `pocketbase/` — PocketBase 后端
- `vue3/` — Vue3 前端
- `project-tools-node/` — 项目打包工具脚本
- `pocketbase-typegen/` — 本地化的类型生成工具

技术栈：Vue3 + TypeScript + TanStack Query（@tanstack/vue-query）+ PocketBase JS SDK

---

## 文件命名规范

| 类型 | 命名风格 | 示例 |
|------|---------|------|
| Vue 文件 | PascalCase | `ExampleVueFile.vue` |
| TS 文件 | kebab-case | `example-ts-file.ts` |
| 文件夹 | kebab-case | `example-files/` |

## Vue 文件结构

```vue
<script setup lang="ts"></script>
<template></template>
<style lang="scss" scoped></style>
```

---

## 关键习惯

- 不喜欢 `defineEmits`（事件），喜欢通过 props 传入函数来实现同样效果
- 喜欢使用箭头函数 `() => {}`
- 状态管理使用 Pinia

---

## 文件组织模式

### index.ts 统一导出

目录中的内容由 `index.ts` 统一导出：

```ts
// components/index.ts
import ChatTopBar from './ChatTopBar.vue'
export { ChatTopBar }
export * from './chat-message'
```

Vue 文件也习惯用 `index.ts` 来导出，方便管理与重构。

### dependencies.ts 上级导入代理

当文件 a 中需要使用上级文件夹中文件的内容时，用 `dependencies.ts` 导入并导出上级中要使用的内容：

```ts
// dependencies.ts
export * from '../xxx'
```

文件 a 中只需 `import { xxxXxxx } from './dependencies'`，即文件中避免从上级导入，只有 `dependencies.ts` 可以从上级导出，方便管理与重构。

### 组件重构模式

当一个 Vue 文件写得比较大时，进行重构的办法（以 `ExampleFile.vue` 为例）：

```
example-file/
├── components/
│   ├── SomeRefactorComponent.vue
│   └── index.ts
├── composables/
│   ├── some-refactor-composable-func.ts
│   └── index.ts
├── ExampleFile.vue
└── index.ts
```

重构后，上级目录中的 `index.ts` 需要修改：

```ts
// 之前
import ExampleFile from './ExampleFile.vue'
export { ExampleFile }

// 之后
export * from './example-file'
```

### src/components 与 src/composables

- `src/components` — 需要在多个地方使用的组件，手动导入使用（如 `import { ContainerBar, ContainerCol2 } from '@/components'`）
- `src/composables` — 需要在多个地方使用的组合式函数

---

## 组合式函数（Desuwa 模式）

组合式函数普遍以 `use` 开头，项目中额外偏好在结尾加上 `Desuwa`。

### 基本模式

```ts
export const useXxxxxDesuwa = (
  // 参数一般习惯只有一个对象，以 data 命名
  // data: {
  //   aaaaabbbb: Ref<string>
  //   xxxxxxaaDesuwa: XxxxxxaaDesuwaType
  // }
) => {
  const name = ref('张三')
  const updateName = (val: string) => name.value = val

  return { name, updateName }
}

// 附带类型体操以便别的地方使用
export type XxxxxDesuwaaType = ReturnType<typeof useXxxxxDesuwa>
```

### 使用方式

```ts
// 组合式函数之间传递
const abcdeDesuwa = useAbcdeDesuwa({ xxxxxDesuwa, 其他参数…… })

// 传给子组件
// <AaaaaaBbbbbb :xxxxxDesuwa="xxxxxDesuwa" />

// 在 Vue 组件中使用
const props = defineProps<{ xxxxxDesuwa: XxxxxDesuwaaType }>()
const { name, updateName } = props.xxxxxDesuwa
```

### Desuwa 模式的优点

通过一个以 desuwa 结尾的组合式函数，把某块业务相关的所有数据（ref）、计算属性（computed）和修改数据的方法（actions）全部打包成一个大对象。不再费劲地把里面的东西一个个解构出来再一个个传进子组件或其他组合式函数，而是把这个对象当成一个完整的"领域模型"整体直接传递。

逻辑不再是零散的零件，而是一个个成套的模块。不仅父子组件之间传递极其整洁，不同的逻辑块（组合式函数）之间也能像拼积木一样互相组合。

---

## Pinia Store 模式

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTestStore = defineStore(
  'pocket-chat-test',
  () => {
    const testVal = ref(0)
    const testValAdd = () => {
      testVal.value += 1
    }
    return {
      testVal,
      testValAdd,
    }
  },
  {
    persist: true,
  }
)
```

由 `src/stores/index.ts` 统一导出。

---

## PocketBase JS SDK 使用习惯

封装在 `src/api` 目录中：

```ts
import { Collections, pb } from '@/lib'
import { fetchWithTimeoutPreferred } from '@/utils'

/** users集合 getOne */
export const pbUsersGetOneApi = async (id: string) => {
  const pbRes = await pb.collection(Collections.Users).getOne(id, {
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}
```

---

## TanStack Query 使用习惯

`useXxxxQuery` 写在 `src/queries` 中的文件中，`useMutation` 可以在 vue 文件里写或封装到 `src/queries` 中。

```ts
// src/queries/profile.ts
import { pbUsersGetOneApi } from '@/api'
import { queryConfig } from '@/config'
import { pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { useAuthStore } from '@/stores'
import { useQuery } from '@tanstack/vue-query'

export const useProfileQuery = () => {
  const authStore = useAuthStore()
  const query = useQuery({
    enabled: computed(() => authStore.isValid && authStore.record?.id != null),
    queryKey: computed(() => queryKeys.profile(authStore.record?.id ?? '')),
    queryFn: async () => {
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        throw new Error('!pb.authStore.isValid || pb.authStore.record?.id == null')
      }
      const pbRes = await pbUsersGetOneApi(pb.authStore.record.id)
      return pbRes
    },
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    retry: queryRetryPbNetworkError,
  })
  return { ...query }
}
```

---

## 代码理念

代码首先是为了让人看的，顺带着能运行罢了。
