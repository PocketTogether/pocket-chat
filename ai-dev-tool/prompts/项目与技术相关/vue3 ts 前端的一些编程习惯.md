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


关于组合式函数自己的习惯
```ts
// 组合式函数普遍以use开头这是共识
// 自己还有另外的偏好是在结尾加上Desuwa（就是这一块的意思说是）

// xxxxxx.ts
export const useXxxxxDesuwa = (
// 参数需要的话就有，不需的话就没有
// （参数一般习惯只有一个对象，习惯以data命名）
// data: {
//   // 一些能传入的数据如别的ref值或别的desuwa
//   aaaaabbbb: Ref<string>
//   // 参数命名也要遵循xxxxxxaaDesuwa这种格式（即useXxxxxxaaDesuwa去掉use这种的）
//   xxxxxxaaDesuwa: XxxxxxaaDesuwaType（像这种别的desuwa的类型是可以导入的）
// }
) => {
  // 参数会像这样解构出来使用
  // const { aaaaabbbb, xxxxxxaaDesuwa } = data

  const name = ref('张三')
  const updateName = (val: string) => name.value = val
  
  return { name, updateName }
}
// 每个组合式函数一般都要附带这个类型体操以方便别的地方使用
export type XxxxxDesuwaaType = ReturnType<typeof useXxxxxDesuwa>


// 别的地方一般会像这样使用
const xxxxxDesuwa = useXxxxxDesuwa()
// xxxxDesuwa 不仅适合传入子组件，也非常适合传入其他组合式函数
// 会可以像如此传给另一个组合式函数
// const abcdeDesuwa = useAbcdeDesuwa({ xxxxxDesuwa, 其他参数…… })
// 会可以像如此传给子组件
// <AaaaaaBbbbbb :xxxxxDesuwa="xxxxxDesuwa" />
// 在vue组件中使用
const props = defineProps<{ xxxxxDesuwa: XxxxxDesuwaaType }>()
// 子组件里也能解构
const { name, updateName } = props.xxxxxDesuwa
```

组合式函数desuwa这一块的优点
```
简单来说，就是通过一个以desuwa结尾的组合式函数，把某块业务相关的所有数据（ref）、计算属性（computed）和修改数据的方法（actions）全部打包成一个大对象。在父组件里，我们不再费劲地把里面的东西一个个解构出来再一个个传进子组件或其他组合式函数，而是把这个对象当成一个完整的“领域模型”整体，直接传给子组件，或者传给其他的组合式函数。

这种模式的精髓在于：逻辑不再是零散的零件，而是一个个成套的模块。不仅父子组件之间传递极其整洁，不同的逻辑块（组合式函数）之间也能像拼积木一样互相组合。
```

一种思想我很喜欢：代码首先是为了让人看的，顺带着能运行罢了
