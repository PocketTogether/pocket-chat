
```
保证pocketbase不发邮件

不开SMTP
auth集合配置选项中禁用非密码的鉴权
auth集合配置选项中将邮箱模板全部设为空
添加用户时使用“绝对不会被送达”的邮箱域名如 .invalid .test .localhost
用pb的js扩展来禁用邮件发送

帮我为此写一篇笔记
```

下面我给你整理一篇**结构清晰、可直接保存的技术笔记**，涵盖你提到的所有方法，并把它们组织成一个“PocketBase 禁用邮件系统的完整方案”。

内容不会重复你已经知道的，而是把它们整合成一篇真正可用的笔记。

---

# # 📘 PocketBase：彻底禁用邮件发送的完整方案（实战笔记）

PocketBase 默认具备邮件发送能力（如注册验证、密码重置、管理员通知等）。  
在某些项目中，我们希望 **完全禁用邮件系统**，让 PocketBase 永远不发送任何邮件。

本笔记总结了多层级的防护措施，从配置层、数据层到代码层，确保邮件绝对不会被发出。

---

# ## 1. 不配置 SMTP（基础防护）

PocketBase 的邮件发送优先使用 SMTP。  
如果不配置 SMTP：

- 不会使用 SMTP
- 会尝试调用系统 sendmail（如果存在）
- 大多数环境（Docker/Alpine/Windows）没有 sendmail → 邮件无法发送

这是最基础的防护。

---

# ## 2. Auth 集合中禁用所有与邮件相关的功能（配置防护）

在 Dashboard → Auth Collection → Options 中关闭：

- ❌ Require email verification
- ❌ Allow email/password auth（如果你使用用户名/手机号登录）
- ❌ Allow password reset
- ❌ Allow email change verification

同时将所有邮件模板清空：

- Verification email template → 空
- Password reset template → 空
- Change email template → 空
- Auth alert template → 空

这样 PocketBase 即使尝试发送，也没有内容。

---

# ## 3. 使用“绝对不会被送达”的邮箱域名（数据防护）

PocketBase 的 Auth 集合 email 字段无法删除，但你可以使用 **永远无法投递的邮箱域名**。

推荐使用 RFC 保留域名：

|域名|原因|
|---|---|
|`.invalid`|RFC 2606：永远无效|
|`.test`|RFC 2606：测试用途，不会被注册|
|`.localhost`|RFC 6761：本地用途，不会外发|
|`.example`|RFC 2606：示例用途|

示例：

```
aaa@pocketbigbro.invalid
aaa@pocketbigbro.test
aaa@pocketbigbro.localhost
```

这些邮箱 **100% 不会被任何邮件系统投递**。

---

# ## 4. 使用 PocketBase JS 扩展拦截所有邮件（代码防护）

PocketBase 提供全局邮件钩子：

```
onMailerSend((e) => {
    // 不调用 e.next()，邮件将被阻止
})
```

这是最强的防护层，因为：

- 所有邮件发送（系统内置 + 自定义）都会经过 onMailerSend
- 包括：
    - onMailerRecordAuthAlertSend
    - onMailerRecordPasswordResetSend
    - onMailerRecordVerificationSend
    - onMailerRecordChangeEmailSend
    - onMailerAdminPasswordResetSend
    - onMailerAdminVerificationSend
    - 任何 $app.newMailClient().send()

### ✔ 推荐写法：完全阻止邮件发送

```js
onMailerSend((e) => {
    console.log("Email blocked:", e.message.subject)
    // 不调用 e.next()，PocketBase 不会继续执行发送
})
```

PocketBase 会认为邮件流程已结束，不会报错，也不会发送。

---

# ## 5. 多层防护的最终效果

通过以上措施，你获得了：

|防护层|作用|
|---|---|
|不配置 SMTP|无法通过 SMTP 发送|
|禁用 Auth 邮件功能|系统不会尝试发送邮件|
|清空邮件模板|即使发送也无内容|
|使用无效邮箱域名|邮件无法投递|
|onMailerSend 拦截|所有邮件在代码层被阻止|

这五层叠加后：

> **PocketBase 将完全失去邮件发送能力，且不会报错，也不会影响其他功能。**

这是目前最稳妥、最彻底的禁用方案。

---

# ## 6. 推荐的最终配置（可直接使用）

### ✔ 用户邮箱格式（注册时自动生成）

```
${username}@invalid
```

### ✔ JS 扩展（pb_hooks）

```js
onMailerSend((e) => {
    console.log("Blocked email:", e.message.subject)
})
```

### ✔ Auth Collection 设置

- Email verification → OFF
- Password reset → OFF
- Email auth → OFF
- Email templates → 全部清空

### ✔ SMTP

- 不配置任何 SMTP 信息

---

# ## 7. 结语

PocketBase 的邮件系统虽然默认启用，但通过配置 + 数据策略 + 钩子拦截，可以做到 **100% 禁用邮件发送**。

这篇笔记适用于：

- 内网应用
- 仅使用用户名/手机号登录的系统
- 不希望 PocketBase 触发任何邮件行为的项目
- 对安全性和可控性要求较高的场景

如果你需要，我还可以帮你写：

- **用户名/手机号登录的完整实现方案**
- **自动生成 invalid 邮箱的注册逻辑**
- **PocketBase Auth 集合最佳实践模板**

你想继续扩展哪一部分，我可以继续帮你完善。