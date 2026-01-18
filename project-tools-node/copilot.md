使用 dev-flatten-text-to-ai.js 时可以附带本文件以达到技术架构提示的效果
```PowerShell

node dev-flatten-text-to-ai.js `
xxxxx `
E:\Project\pocket-chat\vue3\src\lib `
E:\Project\pocket-chat\project-tools-node\copilot.md

```

pocket-chat 项目目录结构
- `pocketbase/` 为 PocketBase 所在的文件夹
- `vue3/` 为 Vue3 前端文件夹
- `project-tools-node/` 为项目打包工具脚本文件夹

技术栈
- 后端使用 pocketbase
- 前端使用 vue3 ts 
- tanstack/query（@tanstack/vue-query）
- pocketbase js sdk

vue3 ts 前端的一些编程习惯
```
vue文件 文件名习惯的命名规范为 pascal 如 ExampleVueFile.vue
ts文件 文件名习惯的命名规范为 kebab 如 example-ts-file.ts
文件夹名习惯的命名规范为 kebab 如 example-files/

自己习惯这样的vue文件结构
<script setup lang="ts"></script>
<template></template>
<style lang="scss" scoped></style>

本人不喜欢defineEmits（事件），喜欢通过props传入函数的方式来实现同样的效果

本人喜欢使用箭头函数 () => {}

状态管理使用pinia，已配置了状态管理
自己习惯例如这样： E:\Project\pocket-chat\vue3\src\stores\test.ts
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
会由 src\stores\index.ts 统一导出
例如这种的，ts文件导出管理，都是由目录中的index.ts统一导出
几个自己习惯的特殊文件、文件夹

index.ts
统一导出文件夹中的内容，如
import ChatTopBar from './ChatTopBar.vue'
export { ChatTopBar }
export * from './chat-message'
注意vue文件自己也习惯用 index.ts 来导出，方便管理与重构

dependencies.ts 
当文件a中需要使用上级文件夹中文件的内容时，就用 dependencies.ts 导入并导出上级中要使用的内容，如
export * from '../xxx'
文件a中只需 import { xxxXxxx } from './dependencies' 就行，即文件中避免从上级导入，只有dependencies.ts可以从上级导出，方便管理与重构

src/components 需要在多个地方使用的组件会封装在这里，自己习惯手动导入使用，如
import { ContainerBar, ContainerCol2 } from '@/components'

src/composables 需要在多个地方使用的组合式函数会封装在这里

./components ./composables 的用处，当一个vue文件写得比较大时，一般进行重构的办法，这里拿 ExampleFile.vue 举例
删除ExampleFile.vue文件
新建如此
example-file/
- components/
  - SomeRefactorComponent.vue
  - index.ts
- composables/
  - some-refactor-composable-func.ts
  - index.ts
- ExampleFile.vue
- index.ts
example-file/ExampleFile.vue 中就可以使用 ./components ./composables 中的内容
example-file/index.ts 中又会导出 example-file/ExampleFile.vue
重构后，需要注意，要在 example-file 的上级目录中的 index.ts 中修改，
如原先为：
import ExampleFile from './ExampleFile.vue'
export { ExampleFile }
就修改为：
export * from './example-file'
```

tanstack query 的一些推荐使用习惯
```
可参考 E:\Project\pocket-chat\vue3\src\queries\profile.ts
useXxxxQuery 之类的，推荐写在，src\queries 中的文件中
useMutation 之类的，推荐在vue文件里写，或封装到 src\queries 中都可以

E:\Project\pocket-chat\vue3\src\queries\profile.ts
import { pbUsersGetOneApi } from '@/api'
import { queryConfig } from '@/config'
import { pb } from '@/lib'
import { queryKeys, queryRetryPbNetworkError } from '@/queries'
import { useAuthStore } from '@/stores'
import { useQuery } from '@tanstack/vue-query'
// 个人信息查询
export const useProfileQuery = () => {
  const authStore = useAuthStore()
  const query = useQuery({
    // 查询依赖，需登录（响应式）
    enabled: computed(() => authStore.isValid && authStore.record?.id != null),
    // 查询键（响应式）
    queryKey: computed(() => queryKeys.profile(authStore.record?.id ?? '')),
    // 查询函数
    queryFn: async () => {
      // 未登录，抛出错误
      if (!pb.authStore.isValid || pb.authStore.record?.id == null) {
        throw new Error(
          '!pb.authStore.isValid || pb.authStore.record?.id == null'
        )
      }
      // pb请求
      const pbRes = await pbUsersGetOneApi(pb.authStore.record.id)
      // console.log(pbRes)
      return pbRes
    },
    // 缓存时间
    gcTime: queryConfig.gcTimeLong,
    staleTime: queryConfig.staleTimeLong,
    // ✅ 在网络错误时重试
    retry: queryRetryPbNetworkError,
  })
  return {
    ...query,
  }
}
```

pocketbase js sdk 的一些使用习惯
```
封装在 src/api 比较好
如 E:\Project\pocket-chat\vue3\src\api\users.ts
import { Collections, pb } from '@/lib'
import { fetchWithTimeoutPreferred } from '@/utils'
/** users集合 getOne */
export const pbUsersGetOneApi = async (id: string) => {
  const pbRes = await pb.collection(Collections.Users).getOne(id, {
    // timeout为5000
    fetch: fetchWithTimeoutPreferred,
  })
  return pbRes
}
……
```

关于i18n的实现
```
是我自己实现的 i18n ，vue中使用时如这样
import { useI18nStore } from '@/stores'
const i18nStore = useI18nStore()
// 基本使用
const title = i18nStore.t('chatInputBarBackBottomText')()
// 其也是可以带参数的
const msg = i18nStore.t('chatInputBarNewMessageText')(1)

你不用管我是怎么实现的，你在生成代码时可以使用i18nStore.t，然后给我像下面这样的东西即可，我自己知道怎样处理

// 同类的尽量保持开头单词一致有利于参数提示

  chatInputBarBackBottomText: {
    'en-US': () => 'Back to bottom' as const,
    'zh-CN': () => '回到底部' as const,
    'zh-TW': () => '回到底部' as const,
    'ja-JP': () => '一番下へ戻る' as const,
    'ko-KR': () => '맨 아래로 돌아가기' as const,
    'ru-RU': () => 'Вернуться вниз' as const,
  },
  chatInputBarNewMessageText: {
    'en-US': (num: number) =>
      `${num} new message${num > 1 ? 's' : ''}` as const,
    'zh-CN': (num: number) => `${num} 条新消息` as const,
    'zh-TW': (num: number) => `${num} 則新訊息` as const,
    'ja-JP': (num: number) => `${num} 件の新しいメッセージ` as const,
    'ko-KR': (num: number) => `${num}개의 새 메시지` as const,
    'ru-RU': (num: number) =>
      `${num} новое сообщение${num > 1 ? 'й' : ''}` as const,
  },
```
