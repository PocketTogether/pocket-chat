
```
【0756】
现在我有个想法，就是整理 vue\src\composables\ 这块，就是现在组合式函数相关只有composables一个目录是吧，我觉得改为多个比较好
global-provide-inject/   ← 全局状态容器（Service Locator）
composables-global/      ← 全局组合式函数（App.vue 中 use → provide）
composables-app/         ← 仅 App.vue 使用的启动逻辑之类的东西
composables/             ← 任意地方可用的组合式函数

global-provide-inject 和 composables-global 这有不少东西我说一下
就是某些全局唯一的desuwa对象与依赖注入存在的意义之类的，就是我现在的项目都是普通的组合式函数Desuwa，有不少组合式函数都是用来封装处理数据的计算属性之类的东西，比如某计算属性处理store里的数据以便外部使用之类的，而正因为它是普通的组合式函数，每个不同的地方或不同的组件使用时都用调用一次，即其中的计算属性被创建了好多个，这就会有性能问题你说对吗？
  
而如果有了 global-provide-inject 和 composables-global 就会好很多，我来说一下
就是 global-provide-inject 里会有多个文件，其中文件的内容差不多都是这样的
let data: XxxXxxxDesuwaType | null = null
export const provideXxxXxxxDesuwa = (d: XxxXxxxDesuwaType) => {
  data = d
}
export const injectXxxXxxxDesuwa = () => {
  if (data == null) throw new Error('not provided')
  return data
}
然后说 composables-global ，其中里会有多个文件就和 global-provide-inject 里的对应，composables-global 里的文件就是组合式函数如
export const useXxxXxxxDesuwa = () => {
  // ...
}
export type XxxXxxxDesuwaType = ReturnType<
  typeof useXxxXxxxDesuwa
>
然后就是App.vue或composables-app里的文件中，会provideXxxXxxxDesuwa(useXxxXxxxDesuwa())
然后在别的地方如果要使用，就injectXxxXxxxDesuwa()即可
这样就能让性能有很好的提升，你觉得对吗，你研究一下？
不着急实施，咱们先来聊
```

```
我打算不必纠结于我上面说的那么多改动了，现在我只想做最小改动
你看看我这里 src\composables\realtime-users-status\computed.ts 改的怎么样

不对，我有点担心其有问题，担心其可能第一次执行如果在别的组件中，而当这个组件销毁时，是不是计算属性之类的也会随着销毁啊，而这对于现在的代码就有很大问题是吗，还是说不必担心？
不过如果是用我之前说的 global-provide-inject 和 composables-global 就没有这种问题对吗，因为都是可以确认其是在 src\App.vue 来 provideXxxXxxxDesuwa(useXxxXxxxDesuwa()) 的，即App.vue永远都是在其他组件之前第一个执行的，你说对不对

计算属性之类的也会随着销毁吗？我其实想让你给我讲这个
另外你说的effectScope我第一次听说，原来还能这么用吗，你详细给我讲讲

【5722】
我希望你写详细的注释，包括但不限于优化的原因和用_instance与_scope的原因等，另外再帮我在此处写一篇笔记来记录我们聊的全部内容中的知识 note\草稿260915\260915-进一步开发\0915-1509-优化性能全局composables方面.md
```


# 0915-1509-优化性能全局composables方面

> 编号：【0756】
> 场景：讨论 `vue3/src/composables/` 的优化方向，最终落地方案为对 `realtime-users-status/computed.ts` 做模块级单例优化。
> 涉及文件：`vue3/src/composables/realtime-users-status/computed.ts`

## 背景

一开始想对 `composables/` 做目录重构，拆成：

- `global-provide-inject/` — 全局状态容器（Service Locator）
- `composables-global/` — 全局组合式函数（App.vue 中 use → provide）
- `composables-app/` — 仅 App.vue 使用的启动逻辑
- `composables/` — 任意地方可用的组合式函数

讨论后认为当前改动过于工程化，改为**最小改动**方案：只对真正有性能问题的组合式函数做单例化。

## 分析的结论

### 性能问题成立，但只有少数真正值得全局单例化

| 组合式函数 | 是否值得单例 | 原因 |
|---|---|---|
| `useRealtimeUsersStatusComputed` | ✅ 首要不 | 内部有 `useTimestamp`（2 秒定时器）+ init 查询包装；被最多 4 处调用 → 最多 4 个定时器，全部冗余 |
| `useUserPermissionsDesuwa` | ✅ 次要 | 12 个 computed × ~16 个 consumer = 192 个 computed |
| `useRouteControlDialog` | ❌ | 10 个 consumer 各用不同 `dialogQueryKey`，参数化，无法共享 |
| `useMessageContentProcess` | ❌ | 按消息参数创建，无法共享 |
| `useRouterHistoryTool` | ❌ | 21 个 consumer 但完全无 reactive state，零收益 |

关键点：**参数化组合式函数不能全局单例化**（参数不同 → 实例不同）；无状态组合式函数无收益。

### store / query 本来就全局

- Pinia store：全局单例，不受组件生命周期影响
- TanStack Query：query 缓存是全局的，网络请求会去重；但每个组合式函数实例创建各自的响应式包装层
- 真正需要防护的只有带 `onScopeDispose` 的副作用，如 `useTimestamp`

## 核心知识点：组件销毁与计算属性

### effect 是 Vue 响应式系统的最小单位

`computed`、`watch`、`watchEffect`、组件渲染函数本质都是 **effect**：
- 执行时读取响应式数据 → 建立依赖
- 数据变更 → 触发重新执行
- 可被 `stop()`：停止后不再追踪依赖、不再响应

computed 就是**带缓存值的 effect**（dirty 标记 + 缓存值）。

### 组件与 effectScope

Vue 3 为每个组件 `setup()` 创建隐式的 `effectScope`，期间创建的所有 computed/watch/onScopeDispose 回调都注册到当前活跃 scope。组件卸载 → scope.stop() → 内部 effect 全部停止 + 清理回调执行。

### 关键区分：对象存活 ≠ 响应活性

| 东西 | 组件销毁后 |
|---|---|
| computed | effect 被 stop，**值冻结**成最后结果不再更新（对象还在，不会被 GC 回收，因为有引用） |
| watch/watchEffect | 被 stop |
| onScopeDispose/onBeforeUnmount 回调 | 执行 |
| useTimestamp 定时器 | 通过 onScopeDispose 被 stop |
| ref | 普通容器，不会消失，但依赖它的 effect 已停 |
| TanStack Query | 全局缓存，不受影响 |
| Pinia store | 全局单例，不受影响 |

**误区**：不是"内存泄漏/GC"，而是"活性"被 stop 死掉了。

## 核心知识点：effectScope 详解

### 是什么

`effectScope` 是 Vue 3.2 官方 API（非实验性），给一组 effect 提供统一生命周期容器，可整体 stop，也可让一套 effect **脱离任何组件生命周期**。

### API

```ts
import { effectScope } from 'vue'

const scope = effectScope(detached?: boolean) // 创建容器
scope.run(fn)   // 回调内创建的 effect 全部注册到该 scope，返回回调返回值
scope.stop()    // 停止 scope 内所有 effect + 执行清理回调
```

配套：`getCurrentScope()`、`onScopeDispose(cb)`（VueUse 的 useTimestamp/useIntervalFn 内部用它注册清理）。

### detached 的含义

scope 可嵌套（默认非 detached 会成为当前活跃 scope 的子 scope）：

```
App（根 scope，永存）
 └── 组件 A scope
      └── effectScope() 子 scope B（非 detached）
              └─ 内部 effect（A.stop() 会级联 stop B）
```

- `detached = false`（默认）：挂父节点下，父 stop 级联 stop 它
- `detached = true`：脱离，父死它不死，除非手动 stop

### 为什么单例要 effectScope(true)

若首次调用发生在某个会被销毁的组件 setup 中：
- `useTimestamp` 的定时器清理通过 `onScopeDispose` 绑定到该组件 scope
- 组件卸载 → 定时器永久停 → `nowRefTimestamp` 冻结 → 在线判断失准
- 单例对象还活着，后续拿到的是"僵尸实例"

`effectScope(true)` 把创建动作放进独立宿主，定时器/computed 与任何组件生命周期无关。

### 生态佐证

VueUse 官方：
- `createGlobalState()` — 全局永久单例，内部 detached effectScope
- `createSharedComposable()` — 共享实例，同样用 `effectScope(true)` 保护

手工实现模块级单例本质就是 `createGlobalState`。

## 最终落地：computed.ts 的方案

```ts
let _instance: RealtimeUsersStatusComputedType | null = null
const _scope = effectScope(true) // 独立宿主，不随组件销毁

export const useRealtimeUsersStatusComputed = () => {
  if (_instance == null) {
    _instance = _scope.run(() => {
      return useRealtimeUsersStatusComputedWithoutOptimization()
    })!
  }
  return _instance
}
```

- 原实现改名 `useRealtimeUsersStatusComputedWithoutOptimization`，仅被单例调用一次
- 类型 `RealtimeUsersStatusComputedType = ReturnType<typeof <原实现>>`
- 调用方（`user-realtime-status.ts`、`user-list.ts`）**零改动**
- 首次惰性创建，之后复用同一实例
- 定时器/computed 注册在独立 scope，任何组件销毁不影响

## 备选思路（未采用，记录对比）

### 方案 A：provide/inject Service Locator（用户最初设计）

```ts
// composables-global/user-permissions.ts
export const useXxxDesuwa = () => { ... }
export type XxxDesuwaType = ReturnType<typeof useXxxDesuwa>

// global-provide-inject/user-permissions.ts
let data: XxxDesuwaType | null = null
export const provideXxxDesuwa = (d) => { data = d }
export const injectXxxDesuwa = () => { if (!data) throw Error; return data }

// App.vue
provideXxxDesuwa(useXxxDesuwa())
```

- 优点：全局性显式可见；App.vue 永远第一个执行可确保顺序；测试可 reset
- 缺点：消费者要改 16 个文件的 import（use → inject）；App.vue 要为每个服务手动 init

### 方案 B：模块内懒初始化单例（最终采用）

- 优点：**零迁移成本**，消费者完全不用改；不用 App.vue 任何 wiring
- 缺点：需配合 `effectScope(true)` 解决"首次调用在会销毁的组件中"导致定时器被 stop 的问题；无法 reset

### 结论

最小改动 + 守护 scope 即得到方案 A 的主要收益（单一实例、性能提升），代价最小。

## 目录重构讨论要点（未实施）

- 若日后执行四目录重构：
  - `composables-app/`：App 独有逻辑（现 `app.ts`、`realtime-{messages,images,files}.ts`、`realtime-users-status/subscription.ts`、`self-presence/loop-hook.ts`）
  - 全局候选：`useUserPermissionsDesuwa`、`useRealtimeUsersStatusComputed`
  - `balanced-grid.ts` 目前 0 个消费者（dead code），删除还是保留待定