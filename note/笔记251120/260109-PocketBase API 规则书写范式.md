```
规则只能表达“在什么条件下允许访问”，而不能表达“在什么条件下拒绝访问”。
只要表达式为 true，请求就被允许。
表达式为 false，请求就被拒绝。

所有逻辑都是“允许式”、拒绝逻辑转化为允许逻辑的补集。
分层结构清晰，每一层都是“可独立理解”的，规则是“可组合”的
顶层永远是 AND（&&）组合，即全部条件通过才能访问
```

下面是一份**文档化、范式化、可直接放进团队 Wiki 的 PocketBase API 规则书写规范**。  
我保持了你原本的思想体系，但将其组织成更正式、更可复用的文档结构。

---

# PocketBase API 规则书写范式

**—— 面向可读性、可维护性与机制一致性的逻辑表达规范**

## 1. 设计哲学：PocketBase 规则是“允许式”逻辑

PocketBase 的 API 规则本质上是一个**布尔表达式**。

- **表达式为 `true` → 请求被允许**
- **表达式为 `false` → 请求被拒绝**

因此，规则只能表达：

> **“在什么条件下允许访问”**  
> 而不能直接表达  
> **“在什么条件下拒绝访问”**

所有“拒绝逻辑”都必须转换为其补集的“允许逻辑”。

---

## 2. 结构化表达：分层、可读、可组合

为了让规则具备可读性、可维护性与可审计性，推荐采用**分层 AND（&&）结构**：

```
(
  <访问主体的前置条件>
) &&
(
  <访问主体的权限条件>
) &&
(
  <资源本身的可访问性条件>
)
```

### 2.1 分层的意义

- **每一层都是独立可理解的逻辑单元**
- **每一层内部可使用 OR（||）表达“允许的多种情况”**
- **顶层永远使用 AND（&&）组合**，确保所有条件都满足才允许访问
- **逻辑可组合、可扩展、可调试**

---

## 3. 推荐的三层逻辑模型

### **层 1：访问主体的前置条件（Authentication Preconditions）**

用于描述“谁可以进入下一层判断”。

典型模式：

```js
(
  @request.auth.id != "" ||   // 已登录
  (
    @collection.config.key ?= 'allow-anonymous-view' &&
    @collection.config.value ?= true
  )                           // 未登录但允许匿名访问
)
```

说明：

- 若未登录但允许匿名访问 → 通过
- 若未登录且不允许匿名访问 → 阻断（表达式为 false）
- 若已登录 → 直接通过

---

### **层 2：访问主体的权限条件（Authorization Conditions）**

用于描述“登录用户是否具备访问权限”。

典型模式：

```js
(
  @request.auth.id = "" ||   // 未登录用户不经过此过滤
  (
    (
      @collection.users.id ?= @request.auth.id &&
      @collection.users.isBanned ?= false
    ) ||                      // 非 isBanned 用户
    id = @request.auth.id     // isBanned 用户只能访问自己的资源
  )
)
```

说明：

- 未登录用户跳过此层（因为匿名访问已在层 1 控制）
- 已登录用户必须满足：
    - **不是 isBanned**，或
    - **是 isBanned 但访问自己的资源**

---

### **层 3：资源本身的可访问性条件（Resource Constraints）**

用于描述资源自身的限制，例如：

```js
(
  status = "public" ||
  owner = @request.auth.id
)
```

说明：

- 资源公开 → 允许
- 资源私有 → 仅作者可访问

---

## 4. 完整范式示例（可直接用于团队规范）

```js
(
  // Layer 1: Authentication Preconditions
  // 访问主体必须满足的前置条件
  @request.auth.id != "" ||
  (
    @collection.config.key ?= 'allow-anonymous-view' &&
    @collection.config.value ?= true
  )
) &&
(
  // Layer 2: Authorization Conditions
  // 访问主体的权限条件
  @request.auth.id = "" ||
  (
    (
      @collection.users.id ?= @request.auth.id &&
      @collection.users.isBanned ?= false
    ) ||
    id = @request.auth.id
  )
) &&
(
  // Layer 3: Resource Constraints
  // 资源本身的可访问性条件（示例）
  status = "public" || owner = @request.auth.id
)
```

---

## 5. 书写规范总结（可放在文档顶部）

### **5.1 规则永远写“允许逻辑”，不写“拒绝逻辑”**

PocketBase 规则是 allow-based，不支持 deny-based。

### **5.2 顶层永远是 AND（&&）**

每一层都是必须满足的条件。

### **5.3 每一层内部使用 OR（||）表达“允许的多种情况”**

### **5.4 每一层都是独立可理解的逻辑块**

### **5.5 拒绝逻辑必须转换为允许逻辑的补集**

### **5.6 规则要可读、可维护、可审计**

---

如果你愿意，我还能进一步帮你：

- **把这个范式做成 Markdown 模板**
- **为你的 PocketChat 项目生成一套完整的规则文档**
- **为每个 collection 生成标准化规则骨架**
- **提供“拒绝逻辑 → 允许逻辑补集”的转换指南**

你想继续往哪个方向扩展？