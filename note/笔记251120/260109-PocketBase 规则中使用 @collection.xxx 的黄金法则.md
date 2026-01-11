```
建议所有 @collection.xxx 这种 都要加上别名，即使只是用了一次
```

下面这一段是**机制级、可长期放进你笔记里的 PocketBase 规则 DSL 最佳实践**，包含解释 + 示例，能彻底避免你刚才担心的“隐式查询上下文合并”大坑。

---

# **📌 PocketBase 规则中使用 `@collection.xxx` 的黄金法则（含示例）**

在 PocketBase 的规则 DSL 中，**所有对同一个 `@collection.xxx` 的过滤条件，都会自动叠加到同一个隐式查询上下文里**。  
括号不会隔离上下文，也不会创建命名空间。

因此：

> **只要你在同一条规则表达式里引用同一个集合超过一次，就应该为每一次引用加上 alias。**

这样可以确保每一次过滤都是独立的，不会被 PocketBase 自动合并成“必须由同一条记录同时满足所有条件”。

---

# **📌 为什么必须这样做？（机制解释）**

PocketBase 的规则引擎会这样理解：

```
@collection.config.key ?= 'A'
@collection.config.value ?= true
@collection.config.key ?= 'B'
@collection.config.value ?= false
```

它会被解释为：

> 必须存在一条 config 记录，同时满足  
> key = 'A'  
> key = 'B'  
> value = true  
> value = false

这是不可能的，因此表达式永远为 false。

括号不会改变这个行为。

---

# **📌 正确写法：使用 alias 拆分成两个独立查询**

例如你要检查两个不同的 config 项：

- allow-users-to-register = true
- user-register-oauth2-only = false

错误写法（会永远 false）：

```c
@collection.config.key ?= 'allow-users-to-register' &&
@collection.config.value ?= true &&
@collection.config.key ?= 'user-register-oauth2-only' &&
@collection.config.value ?= false
```

正确写法（使用 alias）：

```c
@collection.config:register.key ?= 'allow-users-to-register' &&
@collection.config:register.value ?= true &&

@collection.config:oauthOnly.key ?= 'user-register-oauth2-only' &&
@collection.config:oauthOnly.value ?= false
```

这里：

- `@collection.config:register` 是一个独立查询上下文
- `@collection.config:oauthOnly` 是另一个独立查询上下文

它们不会互相污染，也不会被合并。
