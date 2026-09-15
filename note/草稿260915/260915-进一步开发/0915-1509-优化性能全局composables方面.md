
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

### 生态佐证：VueUse 三个相关 API 详解

这三个函数都在 `@vueuse/shared` 包（本项目已装 `@vueuse/core 13.3.0`，core 用 `export * from '@vueuse/shared'` 重导出，直接从 `@vueuse/core` 即可 import）。

---

#### 1. createGlobalState — 全局永久单例

**用途**：把任意组合式函数包装成模块级懒初始化单例，活到页面关闭（应用生命周期）。

**源码（v13.3.0 真实代码）**：

```ts
function createGlobalState(stateFactory) {
  let initialized = false
  let state
  const scope = effectScope(true)  // detached，不随任何组件销毁
  return (...args) => {
    if (!initialized) {
      state = scope.run(() => stateFactory(...args))
      initialized = true
    }
    return state
  }
}
```

**逻辑**：
- 接受一个"工厂函数"（也就是组合式函数本体）
- 返回一个新的函数，该函数首次被调用时在 `effectScope(true)` 内执行工厂，之后永远复用同一份 `state`
- 定时器、computed、onScopeDispose 清理全部注册在独立 scope 上，与组件生命周期无关

**与我们手写版的对照**：

```
我们手写的                          createGlobalState 内部
────────────────────────────────   ──────────────────────────────
let _instance = null                let state
const _scope = effectScope(true)    const scope = effectScope(true)
if (_instance == null) {            if (!initialized) {
  _instance = _scope.run(...)         state = scope.run(...)
}                                   }
return _instance                    return state
```

几乎逐行对应。手写版的好处是直观、可加自定义逻辑（比如注释），createGlobalState 的好处是代码更短且有官方背书。

**用法示例**：

```ts
import { createGlobalState } from '@vueuse/core'

export const useRealtimeUsersStatusComputed = createGlobalState(() => {
  // 原函数体搬进来，自动变成单例
  const nowRefTimestamp = useTimestamp({ interval: 2000 })
  // ...
  return { getStatusByUserId, checkIsOnlineByStatusIsoDate, ... }
})
```

**适用场景**：需要永久存在、常驻的全局数据（定时器、全局权限计算、在线状态等）。

---

#### 2. createSharedComposable — 引用计数的共享实例

**用途**：多个组件共享同一个 composable 实例，**最后一个使用者销毁后自动销毁**，再被调用时重新创建。

**源码（v13.3.0 真实代码）**：

```ts
function createSharedComposable(composable) {
  let subscribers = 0   // 当前"正在使用此实例"的组件数量
  let state
  let scope
  const dispose = () => {
    subscribers -= 1
    if (scope && subscribers <= 0) {
      // 没有组件在用了 → 主动销毁：停掉内部所有 effect + 清空引用
      scope.stop()
      state = void 0
      scope = void 0
    }
  }
  return (...args) => {
    subscribers += 1     // 每次有组件调用，计数 +1
    if (!scope) {
      // 首次调用（或上一个实例被销毁后的重新创建）
      scope = effectScope(true)
      state = scope.run(() => composable(...args))
    }
    // 注册到「当前组件的 scope」上：组件销毁时会触发 dispose，计数 -1
    tryOnScopeDispose(dispose)
    return state
  }
}
```

**与 createGlobalState 的核心区别**：

| | createGlobalState | createSharedComposable |
|---|---|---|
| 生命周期 | 永久，活到页面关闭 | 随引用计数，最后一个使用者走后销毁 |
| 被销毁后再次调用 | 不会（永远存在） | 会重新创建 |
| 适合场景 | 常驻数据（定时器、全局权限、在线状态） | 非常驻但可共享的资源（重的计算、很少用的图表库实例等） |
| 实现 | module 级 let + detached scope | module scope + tryOnScopeDispose 引用计数 |

**生命周期图解**：

```
时间线（createSharedComposable）

组件 A mount    → subscribers=1, 创建 scope, 创建 state
组件 B mount    → subscribers=2, 复用 state
组件 A destroy  → subscribers=1（scope 未停，state 还活着）
组件 B destroy  → subscribers=0, scope.stop() 销毁 state
组件 C mount    → subscribers=1, scope 重建, state 重新创建（全新实例）
```

**为什么 `useRealtimeUsersStatusComputed` 不适合用它**：
- `useTimestamp` 的 2 秒定时器 + init 查询包装，我们希望**始终存在**
- 如果用 `createSharedComposable`，当某时刻所有列表项组件都离开后，定时器会被销毁；下一个组件再进入时重建，重新初始化定时器和查询，有不必要的开销和短暂的数据中断
- 所以应该用 `createGlobalState`（或手写单例），保证应用级永驻

**`createSharedComposable` 更适合的场景举例**：
- 某个重型图表 composable（比如用 D3 绑定 canvas），但只在特定页面偶尔使用
- 所有使用者销毁后，D3 实例应该释放内存
- 下次有组件要用时，再重新初始化

**注意**：内部调用的 `tryOnScopeDispose(dispose)` 注册到的是**当前调用方组件的 scope**（非 detached），所以当该组件销毁时 dispose 才会执行。这也是为什么它能正确跟踪引用计数——每个调用方组件"为自己注册了一份 dispose 回调"。

**⚠️ 重要限制：不支持参数化共享**

`createSharedComposable` 的设计是"**第一次调用的 args 被锁死，之后所有调用返回同一份 state**"，而不是"相同参数共享实例"。

```ts
const useUserStatus = createSharedComposable(useUserRealtimeStatusForUserRealtimeStatus)

// 组件 A：userId = "user-1"
const statusA = useUserStatus({ userId: "user-1" })  // 创建 user-1 的状态 ✅

// 组件 B：userId = "user-2"
const statusB = useUserStatus({ userId: "user-2" })  // 拿到的还是 user-1 的状态 ❌

// 组件 C：userId = "user-1"
const statusC = useUserStatus({ userId: "user-1" })  // 拿到 user-1 ✅（碰巧对了，但只是因为第一次恰好也是 user-1）
```

组件 B 期望的是 user-2 的状态，但 `createSharedComposable` 忽略了它的参数，直接返回了第一次创建的 user-1 状态。所以它**不能做到"相同 userId 共享，不同 userId 各自创建"**。

**那为什么 `useRealtimeUsersStatusComputedForUserRealtimeStatus` 不值得优化？**

当前架构的分层其实已经是最优的：

```
第一层：useRealtimeUsersStatusComputed（全局单例）
  ├─ useTimestamp 1 个定时器（非单例时最多 4 个）   ← 性能大头，已解决
  ├─ init 查询包装 1 组（非单例时最多 4 组）         ← 已解决
  └─ 无状态工具函数：getStatusByUserId / checkIsOnlineByStatusIsoDate

第二层：useRealtimeUsersStatusComputedForUserRealtimeStatus（每组件各一份）
  └─ 3 个 computed，全部 O(1)：
     - userRealtimeStatus        → Map.get（O(1)）
     - userRealtimeStatusWithIsOnline  → 一次比较（O(1)）
     - userRealtimeStatusForShow  → 三次 if 判断（O(1)）
```

真正的性能瓶颈（定时器、查询包装）在第一层已经全局化了。第二层的 3 个 computed 极其轻量（纯 O(1) 查找），即使有 100 个同 userId 的组件，也只是 300 个微不足道的 computed。想对它做共享优化，引入的复杂度远大于收益。

**正确的原则**：把"无参数的重逻辑"全局化，"有参数的轻逻辑"让各组件各自持有——这正是我们当前的架构。

---

#### 3. createInjectionState — provide/inject 官方封装

**用途**：把"一个组合式函数 provide 给子树，子组件通过 inject 消费"这个模式封装成一对函数。正是我们最初设计的 `global-provide-inject/` + `composables-global/` 两件套的官方版。

**源码（v13.3.0 真实代码）**：

```ts
function createInjectionState(composable, options) {
  const key = options?.injectionKey || Symbol(composable.name || "InjectionState")
  const defaultValue = options?.defaultValue
  const useProvidingState = (...args) => {
    const state = composable(...args)   // 执行组合式函数，拿到实例
    provideLocal(key, state)            // provide 到当前组件树
    return state
  }
  const useInjectedState = () => injectLocal(key, defaultValue)
  return [useProvidingState, useInjectedState]
}
```

**用法示例**：

```ts
import { createInjectionState } from '@vueuse/core'

const [useProvidePermissions, useInjectPermissions] = createInjectionState(
  useUserPermissionsDesuwa  // 直接把整个组合式函数传进去
)

// App.vue
useProvidePermissions()  // 内部：执行组合式函数 + provide

// 某个子组件
const { permissionSendMessage } = useInjectPermissions()  // 内部：inject
```

**与我们手写版 `global-provide-inject/` 的对比**：

| | 手写版 | createInjectionState |
|---|---|---|
| provide/inject key | 手动定义 Symbol + InjectionKey | 内部自动生成 Symbol（可自定义） |
| 写法 | 两个文件：composable 定义 + provide/inject 函数 | 一行返回 [provider, injector] |
| 响应性 | 取决于手写实现（Vue 的 provide/inject 天然是响应式的） | 同（基于 Vue provide/inject） |

**适用场景**：当你需要**按组件树层级**隔离状态（不同子树可能有不同的状态值，或者需要测试时替换默认值）时，用这个比全局单例更灵活。

---

#### 三者选型速查

```
需要全局唯一，活到页面关闭？
├─ 是 → createGlobalState 或手写单例
│       （定时器、全局权限、在线状态等常驻数据）
│
├─ 不是永久的，但要共享，用完可释放？
│   └─ createSharedComposable
│       （重型计算实例、偶尔使用的图表库等非恒驻资源）
│
└─ 要按组件树隔离，有 provide/inject 需求？
    └─ createInjectionState
        （多套主题配置、多权限作用域、测试 mock 等）
```

---

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