下面是一篇围绕你这条正则的**机制级、结构化、可长期复用的技术笔记**。  
我写得非常贴近你的工程风格：语义明确、边界清晰、机制解释到位。

---

# 📘 正则笔记：解析 @username 的机制与设计

**正则：**

```ts
const mentionRegex = /(?:^|\s)(@([a-zA-Z0-9_]{1,32}))(?=$|\s)/gm
```

这条正则用于从文本中安全、稳定地提取 `@username`，并且在多行、多空格、相邻 mentions 的情况下保持正确行为。

---

# 1. 设计目标

这条正则的目标非常明确：

- 匹配以 `@` 开头的 username
- username 只能包含 `[a-zA-Z0-9_]`，长度 1–32
- 左侧必须是开头或空白
- 右侧必须是空白或结尾
- **右侧不能消耗字符**（避免漏匹配相邻 mentions）
- 捕获组结构稳定（便于访问 username）

---

# 2. 正则结构拆解

## 2.1 `(?:^|\s)` —— 左侧边界（非捕获组）

- `^`：行首
- `\s`：空白字符
- `?:`：非捕获组，不占用捕获组编号

为什么用 `?:`

- 不需要捕获
- 避免污染捕获组编号
- 让 `match[2]` 永远是 username，不会因为未来改动而错位

---

## 2.2 `(@([a-zA-Z0-9_]{1,32}))` —— 捕获 @username 和 username

捕获组结构：

|组号|内容|
|---|---|
|1|`@username`（带 @）|
|2|`username`（不带 @）|

你最终使用的是 `match[2]`，即纯 username。

---

## 2.3 `(?=$|\s)` —— 右侧边界（正向先行断言）

这是整个正则中最关键的部分。

### 为什么必须用 `?=`

因为如果你写成：

```
($|\s)
```

它会**消耗空白字符**，导致相邻 mentions 漏匹配：

```
@aaa␣@bbb
```

匹配过程：

- 第一次匹配：`@aaa␣`（空格被吃掉）
- exec 的 lastIndex 跳到 `@bbb` 的第一个字符之后
- 第二个 @ 被跳过

使用 `(?=$|\s)`：

- 检查右侧是否是空白或结尾
- **不消耗字符**
- exec 的 lastIndex 停在正确位置
- 相邻 mentions 不会漏掉

### `?=` 和 `?:` 是否能同时用？

可以，但必须是嵌套关系：

```
(?=(?:$|\s))
```

不能写成：

```
(?=?:$|\s)   // ❌ 非法语法
```

---

# 3. 捕获组访问是否安全？

你现在的访问方式：

```ts
usernamesSet.add(match[2])
```

在当前正则结构下是安全的，因为：

- 捕获组 1：`@username`
- 捕获组 2：`username`
- 捕获组数量固定
- `exec()` 总是返回完整的捕获组数组

但如果未来你改动正则结构（例如加括号），捕获组编号可能变化。

### 更安全的访问方式（推荐）

```ts
const username = match[2]
if (typeof username === 'string') {
  usernamesSet.add(username)
}
```

### 最安全方式：命名捕获组

```ts
const mentionRegex = /(?:^|\s)@(?<username>[a-zA-Z0-9_]{1,32})(?=$|\s)/gm

while ((match = mentionRegex.exec(content)) !== null) {
  const username = match.groups?.username
  if (typeof username === 'string') {
    usernamesSet.add(username)
  }
}
```

优点：

- 不依赖编号
- 未来改正则结构也不会出错
- TS 自动推断 groups 类型

---

# 4. 完整示例（安全访问版）

```ts
const mentionRegex = /(?:^|\s)(@([a-zA-Z0-9_]{1,32}))(?=$|\s)/gm

const usernamesSet = new Set<string>()
let match: RegExpExecArray | null

while ((match = mentionRegex.exec(content)) !== null) {
  const username = match[2]
  if (typeof username === 'string') {
    usernamesSet.add(username)
  }
}
```

---

# 5. 小结（机制级）

- `?=` 是必须的，否则相邻 mentions 会漏匹配
- `?:` 不是必须，但推荐使用
- `?=` 和 `?:` 可以同时用，但必须嵌套
- `match[2]` 在当前结构下是安全的
- 最安全方式是使用命名捕获组
- 整体正则结构是机制级正确的

---

如果你愿意，我还能帮你写：

- **支持中文昵称、emoji 的 @mention 正则**
- **支持全角字符的 @mention 正则**
- **支持 Slack/Twitter 风格的 @mention 正则**
- **一个完整的 @mention parser（不依赖正则）**

你想继续哪一块？