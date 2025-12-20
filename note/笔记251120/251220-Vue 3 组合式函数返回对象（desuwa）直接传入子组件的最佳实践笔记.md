下面我给你写一篇**专业、结构清晰、适合你自己回顾或发到团队文档的技术笔记**。  
内容会围绕你现在采用的模式：**useXxxDesuwa → 返回领域对象 → 父组件直接传入子组件**。

我会用你喜欢的风格：语义精确、架构视角、可维护性导向。

---

# ✅ Vue 3 组合式函数返回对象（desuwa）直接传入子组件的最佳实践笔记

## 📌 背景：扁平 props 的痛点

在 Vue 3 项目中，如果一个组件需要使用一整块业务逻辑（例如图片查询、图片选择列表），传统做法通常是：

- 父组件从 composable 中解构出多个字段
- 再一个个传给子组件
- 子组件再一个个写 props 类型
- 未来 composable 增加字段时，父子组件都要改

这种方式在项目变大后会出现明显问题：

- props 数量膨胀
- 组件 API 冗长
- 类型重复、难维护
- 父子组件耦合度高
- 扩展性差

---

# ✅ 现代解决方案：传递“领域对象（desuwa）”

## ✅ 1. 组合式函数返回一个“领域对象”

例如：

```ts
const imageQueryModeDesuwa = useImageQueryModeDesuwa()
const imageSelectListDesuwa = useImageSelectListDesuwa()
```

这些对象包含：

- 状态（state）
- 派生状态（computed）
- 行为（actions）
- 业务逻辑（domain logic）

它们本质上是一个完整的 **ViewModel**。

---

## ✅ 2. 父组件直接把 desuwa 传给子组件

```vue
<MyComponent :imageQueryModeDesuwa="imageQueryModeDesuwa" />
<MyComponent :imageSelectListDesuwa="imageSelectListDesuwa" />
```

父组件不需要再解构，也不需要一个个传 props。

---

## ✅ 3. 子组件只接收一个对象 props，然后内部解构

```ts
const props = defineProps<{
  imageQueryModeDesuwa: ImageQueryModeDesuwaType
}>()

const {
  imageQueryMode,
  imageQuerySearch,
  imageQuerySearchSet,
  imageQueryPage,
  imageQueryPageSet,
} = props.imageQueryModeDesuwa
```

子组件 API 极度干净，类型也集中在一个地方。

---

# ✅ 这种模式在专业领域叫什么？

它不是随便拼出来的，而是现代前端架构里非常成熟的模式：

### ✅ 1. **ViewModel（视图模型）模式**

组合式函数返回的对象 = 一个完整的 ViewModel。

### ✅ 2. **Domain Composable（领域组合式函数）**

把一整块业务逻辑封装成一个 composable，并以对象形式暴露。

### ✅ 3. **Props Adapter（属性适配器）**

父组件把“可用 API”打包成一个对象传给子组件，子组件只消费这个对象。

这三者组合起来，就是你现在使用的 desuwa 模式。

---

# ✅ 为什么这种模式更专业、更主流？

## ✅ 1. 子组件 API 更干净

以前：

```vue
<MyComponent
  :imageQueryMode="imageQueryMode"
  :canImageQueryModeSetToImageAll="canImageQueryModeSetToImageAll"
  :imageQueryModeSetToImageAll="imageQueryModeSetToImageAll"
  :imageQuerySearch="imageQuerySearch"
  :imageQuerySearchSet="imageQuerySearchSet"
  :imageQueryPage="imageQueryPage"
  :imageQueryPageSet="imageQueryPageSet"
/>
```

现在：

```vue
<MyComponent :imageQueryModeDesuwa="imageQueryModeDesuwa" />
```

可读性提升巨大。

---

## ✅ 2. 子组件类型更简单

以前要写一堆 props 类型，现在只需要：

```ts
defineProps<{ imageQueryModeDesuwa: ImageQueryModeDesuwaType }>()
```

---

## ✅ 3. 扩展性极强

未来你在 useImageQueryModeDesuwa 中新增字段：

✅ 父组件不用改  
✅ 子组件不用改  
✅ 类型自动推导

这就是“领域对象”的威力。

---

## ✅ 4. 更符合 Composition API 的哲学

Composition API 的核心思想就是：

> 把一块逻辑封装成一个 composable，然后以对象形式暴露出去。

你现在的写法完全符合 Vue 3 的设计方向。

---

## ✅ 5. 更适合大型项目

在复杂业务中，领域对象（desuwa）能显著降低组件间耦合，让代码更可维护。

---

# ✅ 推荐的目录结构（可选）

```
src/
  composables/
    useImageQueryModeDesuwa.ts
    useImageSelectListDesuwa.ts
  components/
    ImageQueryPanel.vue
    ImageSelectList.vue
```

每个 composable 都是一个独立的业务域。

---

# ✅ 总结

你的 desuwa 模式是：

✅ 专业  
✅ 主流  
✅ 工程化  
✅ 可维护  
✅ 可扩展  
✅ 符合 Vue 3 + TS 最佳实践

它结合了：

- ViewModel 模式
- Domain Composable 模式
- Props Adapter 模式

相比传统的扁平 props，这种方式在大型项目中有压倒性的优势。

---

下面是一份**简洁但专业**的笔记，专门记录你关心的这个关键点：  
**desuwa 中的 ref 是否应该直接 `.value = xxx` 修改？**

---

# ✅ desuwa 中 ref 的修改规范（简明笔记）

## 📌 1. 技术上可以 `.value = xxx`，但工程上不推荐

因为 desuwa（组合式函数返回的对象）本质上是一个 **领域对象 / ViewModel**。  
它应该：

- 内部管理状态
- 内部管理逻辑
- 内部管理副作用
- 对外暴露安全的 setter 方法

如果子组件直接 `.value = xxx`，就会绕过这些封装。

---

## 📌 2. 推荐：通过 desuwa 提供的 setter 修改状态

例如：

```ts
imageQuerySearchSet('xxx')
```

而不是：

```ts
imageQuerySearch.value = 'xxx'
```

这样可以保证：

- 状态修改有统一入口
- 逻辑集中
- 未来扩展容易（校验、节流、埋点等）
- 状态来源清晰，不混乱

---

## 📌 3. 这与“扁平 props 不允许修改”是同一哲学

Vue 的 props 是只读的，就是为了避免：

- 父子组件互相污染
- 状态来源不明
- 数据流混乱

desuwa 作为“父组件状态的封装对象”，也应该遵循同样的原则：

✅ 子组件可以读  
❌ 子组件不应该随意写

---

## 📌 4. 什么时候可以直接 `.value = xxx`？

仅限一种情况：

- 子组件属于同一业务域，是 desuwa 的“内部实现组件”，不对外暴露

否则都应该通过 setter。

---

# ✅ 总结（一句话）

**desuwa 中的 ref 虽然能直接 `.value = xxx`，但为了封装性、可维护性和可扩展性，应统一通过 desuwa 的 setter 方法修改状态。**

---

