【251225】勘误
```
`@tanstack/query/no-rest-destructuring` 这个 ESLint 规则是为 **React Query** 设计的，而不是为 Vue Query。 在 React 中，rest 解构会导致组件订阅 query 的所有字段，从而引发不必要的重新渲染。

但在 Vue 3 中：
- Vue 的依赖收集是 **按属性级别** 进行的
- 解构（包括 rest）**不会让组件订阅所有字段**
- 只有在模板或 effect 中 **实际访问到的字段** 才会被追踪

在 Vue 中不会导致“订阅整个 query 对象”这种 React 才会出现的问题。

虽然这样，但仍不建议对query这样复杂的对象使用剩余解构
另外我发现我自从不用剩余解构后，无限查询的向下加载，即聊天页的向上加载，明显没有以前那样轻微的错位了
```


好的，我帮你写一篇完整的中文笔记，专门解释 **`@tanstack/query/no-rest-destructuring`** 这个 ESLint 规则，以及在 Vue3/TanStack Query 中的实践。

---

# 📒 笔记：`@tanstack/query/no-rest-destructuring` 在 Vue3 中的作用与最佳实践

## 1. 背景

在 Vue3 项目中使用 **TanStack Query（vue-query）** 时，通常会写：

```ts
const query = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})
```

`useQuery` 返回的对象包含很多响应式属性，例如：

- `data`
- `error`
- `status`
- `isLoading`
- `isFetching`
- `isError`
- `isSuccess`
- `refetch`
- 等等…

这些属性都是响应式的，Vue 会追踪它们的变化。

---

## 2. 问题：对象剩余解构

很多人习惯写：

```ts
const { data, ...query } = useQuery(...)
```

或者在返回值里直接：

```ts
return {
  ...query,
  dataWithDefault,
}
```

⚠️ 这会触发 ESLint 规则 **`@tanstack/query/no-rest-destructuring`**，提示：

> Object rest destructuring on a query will observe all changes to the query, leading to excessive re-renders.

意思是：**对象剩余解构会让组件订阅整个 query 对象的所有变化，从而导致过度渲染。**

---

## 3. 为什么会有问题

- `...query` 会把整个响应式对象展开成一个新对象。
- Vue3 的响应式系统会认为这个新对象在 **任意属性变化时都“变了”**。
- 结果：依赖这个对象的地方会因为所有属性的变化而频繁重新渲染，即使你只关心其中某几个字段。

---

## 4. 正确写法：手动解构需要的字段

推荐只解构你真正需要的字段：

```ts
const {
  data,
  error,
  status,
  isLoading,
  isFetching,
  isError,
  isSuccess,
  refetch,
} = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
})

return {
  data,
  error,
  status,
  isLoading,
  isFetching,
  isError,
  isSuccess,
  refetch,
  dataWithDefault,
}
```

这样：

- 每个字段都是单独的 `ref` 或响应式值。
- Vue3 只会在 **具体字段变化** 时触发依赖更新。
- 避免了过度渲染，也不会触发 ESLint 警告。

---

## 5. 对比总结

|写法|订阅范围|渲染次数|可维护性|
|---|---|---|---|
|`...query`|整个 query 对象|很多，任何属性变化都会触发|差，升级时可能报错|
|手动解构|仅需要的字段|少，只在这些字段变化时触发|好，明确且可控|

---

## 6. Vue3 特别注意

- Vue3 的响应式系统会让对象的每个属性都是响应式的。
- 当你用 `...rest` 展开时，实际上是创建了一个新的对象引用，Vue 会认为它整体发生了变化。
- 所以在 Vue3 中，这个问题比 React 更明显，**一定要避免 `...query`**。

【251225】勘误，上面的说法是错误的

---

### ✍️ 总结

- **不要用对象剩余解构（`...query`）**，否则会导致过度渲染。
- **只解构你需要的字段**，既能避免 ESLint 报错，又能提升性能和可维护性。
- 在 Vue3 中尤其要注意，因为响应式对象的整体变化会更容易触发不必要的更新。

---

好的，我来帮你整理一份 **TanStack Query（vue-query）里 `useQuery`、`useInfiniteQuery` 等相关 Hook 的完整导出清单**，并且用「手动解构」的形式列出来，方便你避免 `...query` 的 ESLint 警告。

---

# 📒 TanStack Query 常见 Hook 返回对象的全部字段（Vue3）

## 1. `useQuery` 返回的字段

```ts
const {
  data,
  error,
  status,
  isLoading,
  isFetching,
  isError,
  isSuccess,
  isFetched,
  isFetchedAfterMount,
  isRefetching,
  isStale,
  isPaused,
  dataUpdatedAt,
  errorUpdatedAt,
  failureCount,
  fetchStatus,
  refetch,
} = useQuery(...)
```

---

## 2. `useInfiniteQuery` 返回的字段

相比 `useQuery`，多了分页相关的属性和方法：

```ts
const {
  data,
  error,
  status,
  isLoading,
  isFetching,
  isError,
  isSuccess,
  isFetched,
  isFetchedAfterMount,
  isRefetching,
  isStale,
  isPaused,
  dataUpdatedAt,
  errorUpdatedAt,
  failureCount,
  fetchStatus,
  refetch,

  // ✅ InfiniteQuery 特有
  fetchNextPage,
  fetchPreviousPage,
  hasNextPage,
  hasPreviousPage,
  isFetchingNextPage,
  isFetchingPreviousPage,
} = useInfiniteQuery(...)
```

---

## 3. 其他相关 Hook

除了 `useQuery` / `useInfiniteQuery`，TanStack Query 还提供一些常用的 Hook，它们返回的对象也有类似的响应式字段：

- **`useMutation`**
    
    ```ts
    const {
      data,
      error,
      status,
      isIdle,
      isLoading,
      isError,
      isSuccess,
      failureCount,
      failureReason,
      mutate,
      mutateAsync,
      reset,
    } = useMutation(...)
    ```
    
- **`useQueries`**（批量查询） 返回的是一个数组，每个元素的结构和 `useQuery` 一样。
    

---

## 4. 对比总结

|Hook|返回对象字段|
|---|---|
|`useQuery`|基础查询字段（data, error, status, isLoading, refetch 等）|
|`useInfiniteQuery`|在 `useQuery` 基础上增加分页控制（fetchNextPage, hasNextPage 等）|
|`useMutation`|专注于写操作，返回 mutate 方法和状态字段|
|`useQueries`|返回多个 query 结果数组，每个元素结构同 `useQuery`|

---

✅ **结论**：  
如果你要避免 `...query`，就像上面这样 **手动解构所有字段**。即使你需要“全部字段”，也要逐个写出来，而不是用对象剩余展开。这样就不会触发 ESLint 的 `no-rest-destructuring` 规则，也能保证渲染更精细。

---

好的，我来帮你写一篇完整的笔记，专门说明 **`pickQueryFields` / `pickInfiniteQueryFields`** 的设计目的，并且明确确认它们不是重蹈覆辙（不会触发 `no-rest-destructuring`），同时没有性能问题。

---

# 📒 笔记：`pickQueryFields` 与 `pickInfiniteQueryFields` ——避免 `no-rest-destructuring` 的最佳实践

## 1. 背景

在 Vue3 项目中使用 **TanStack Query（vue-query）** 时，`useQuery` / `useInfiniteQuery` 返回的对象包含很多响应式属性，例如：

- `data`, `error`, `status`
- `isLoading`, `isFetching`, `isError`, `isSuccess`
- `refetch`
- （InfiniteQuery 还包含分页相关字段：`fetchNextPage`, `hasNextPage` 等）

如果直接用：

```ts
return {
  ...query,
  dataWithDefault,
}
```

会触发 ESLint 规则 **`@tanstack/query/no-rest-destructuring`**，因为对象剩余展开会订阅整个 query 对象，导致过度渲染。

---

## 2. 问题

- **重复劳动**：每次都要手动解构一长串字段。
- **可维护性差**：字段有变化时要到处修改。
- **性能隐患**：`...query` 会让组件订阅整个对象，任何属性变化都会触发渲染。

---

## 3. 解决方案：工具函数

为了解决这些问题，可以写两个工具函数：`src\utils\tanstack-query.ts`

### `pickQueryFields`

```ts
export function pickQueryFields<TData, TError>(
  query: UseQueryReturnType<TData, TError>
) {
  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,
  } = query

  return {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,
  }
}
```

### `pickInfiniteQueryFields`

```ts
export function pickInfiniteQueryFields<TData, TError>(
  query: UseInfiniteQueryReturnType<TData, TError>
) {
  const {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,

    // ✅ InfiniteQuery 特有
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  } = query

  return {
    data,
    error,
    status,
    isLoading,
    isFetching,
    isError,
    isSuccess,
    isFetched,
    isFetchedAfterMount,
    isRefetching,
    isStale,
    isPaused,
    dataUpdatedAt,
    errorUpdatedAt,
    failureCount,
    fetchStatus,
    refetch,

    // ✅ InfiniteQuery 特有
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
  }
}

```

---

## 4. 使用方式

```ts
const query = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

return {
  ...pickQueryFields(query),
  dataWithDefault,
}
```

---

## 5. ⚠️ 关键确认

- **不是重蹈覆辙**：
    
    - `...query` 是 **对象剩余解构**，会订阅整个对象。
    - `...pickQueryFields(query)` 展开的是 **工具函数返回的新对象**，里面只有显式挑选的字段。
    - ESLint 的规则只针对解构语法（`const { ...rest } = query`），不会对函数返回值报错。
- **没有性能问题**：
    
    - 工具函数内部是显式解构字段，每个字段都是独立的 `ref`。
    - Vue3 的依赖追踪只会在这些字段变化时触发更新。
    - 外层的 `...pickQueryFields(query)` 只是普通对象展开，不会导致过度渲染。
    - 性能开销仅是一次函数调用 + 解构赋值，可以忽略。

---

## 6. 总结

- `pickQueryFields` / `pickInfiniteQueryFields` 是为了解决 **no-rest-destructuring** 的繁琐问题。
- 它们通过工具函数封装，避免了重复劳动和过度渲染。
- **确认：不是重蹈覆辙，不会触发 ESLint 规则，也没有性能问题。**
- 在 Vue3 项目里，这是一个 **最佳实践**，既保证性能，又提升代码可维护性。

---

我理解你的担心 👍。关键点在于要区分 **“对象剩余解构”** 和 **“展开一个新对象”**：

### 1. `...query` 的问题

```ts
return {
  ...query,
  dataWithDefault,
}
```

- 这里的 `query` 是 TanStack Query 返回的对象，里面塞满了很多 `ref`。
- 当你直接 `...query` 展开时，Vue 会认为你在构造一个新对象，这个新对象的依赖关系会绑定到 **所有字段**。
- 结果就是：任何一个字段变化，整个返回对象都被认为“变了”，导致过度渲染。
- ESLint 的 `no-rest-destructuring` 就是为了阻止这种写法。

---

### 2. `...pickQueryFields(query)` 的不同

```ts
return {
  ...pickQueryFields(query),
  dataWithDefault,
}
```

- `pickQueryFields(query)` 内部已经是 **显式挑选字段**：
    
    ```ts
    const { data, error, isLoading } = query
    return { data, error, isLoading }
    ```
    
- 它返回的是一个 **普通对象**，里面的属性是独立的 `ref`。
- 外层的 `...pickQueryFields(query)` 展开的是这个新对象，不是对原始 `query` 做剩余解构。
- Vue 的依赖追踪只会跟随这些具体的 `ref`，不会把整个 `query` 当成一个响应式整体。
- 所以不会触发 ESLint 规则，也不会导致过度渲染。

---

### 3. ⚠️ 关键确认

- **不是重蹈覆辙**：因为工具函数内部没有用 `...rest`，只是显式挑字段。
- **没有性能问题**：依赖更新只会跟随具体字段变化，和你手动解构完全一样。
- **ESLint 不会报错**：规则只针对 `const { ...rest } = query` 这种语法，不会对函数返回值展开报错。

---

✅ **结论**：  
`...pickQueryFields(query)` 展开的是一个你自己挑选字段的新对象，不会导致 Vue 订阅整个 query 对象，也不会触发过度渲染或 ESLint 警告。它和你手动写一长串解构是等价的，只是封装成了工具函数。

---

**结论：`...pickQueryFields(query)` 不会重蹈覆辙，不会触发 `no-rest-destructuring`，也不会导致 Vue 订阅整个 query 对象。**

---

### 🔍 英文社区搜索结果总结

我查阅了 [TanStack Query 官方 ESLint 规则说明](https://github.com/TanStack/query/blob/main/docs/eslint/no-rest-destructuring.md) 和相关讨论，确认以下几点：

- **规则目的**：`@tanstack/query/no-rest-destructuring` 是为了防止你对 `useQuery` 返回的对象使用对象剩余解构（`const { data, ...rest } = query`），因为这样会自动订阅所有字段，导致不必要的 re-render。
    
- **错误示例**（官方文档）：
    
    ```ts
    const { data, ...rest } = useQuery(...)
    return { ...rest, data }
    ```
    
    这种写法会让组件订阅整个 query 对象的变化。
    
- **正确示例**：
    
    ```ts
    const { data, error, isLoading } = useQuery(...)
    return { data, error, isLoading }
    ```
    
    只订阅你需要的字段，避免性能问题。
    
- **工具函数是否安全？** 是的，只要你的 `pickQueryFields(query)` 函数内部是显式字段解构（而不是 `...rest`），它返回的对象只是包含若干 `ref`，Vue 的依赖追踪只会跟随这些 `ref`，不会订阅整个 query 对象。
    

---

### ✅ 为什么 `...pickQueryFields(query)` 是安全的

- `pickQueryFields(query)` 返回的是一个新对象，里面的字段是你手动挑选的 `ref`。
- 外层的 `...pickQueryFields(query)` 展开的是这个新对象，不是对原始 query 做剩余解构。
- Vue 只会追踪这些 `ref` 的变化，不会把整个 query 当成响应式整体。
- ESLint 规则只针对 `const { ...rest } = query` 这种语法，不会对函数返回值展开报错。

---

### ⚠️ 注意事项

- 工具函数内部 **绝不能用 `...rest`**，否则就真的重蹈覆辙了。
- 如果你用的是 `return { ...query }` 或 `const { data, ...rest } = query`，就会触发规则。
- 如果你用的是 `return { ...pickQueryFields(query) }`，只要 `pickQueryFields` 是显式挑字段的，就不会触发规则，也不会有性能问题。

---

