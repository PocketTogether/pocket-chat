下面是一篇结构化的技术笔记，偏工程记录风格，适合放在 **开发文档 / 技术博客 / 项目 wiki** 中。

---

# PocketBase 不会为 `created`、`updated` 或关系字段自动创建数据库索引

在使用 PocketBase 设计数据结构时，需要注意一个容易被忽视的性能问题：

> **PocketBase 不会自动为 `created`、`updated` 或 `relation` 字段创建数据库索引。**

如果这些字段被频繁用于 **过滤（filter）或排序（sort）**，建议手动创建索引，否则在数据量增长后可能出现明显的查询性能问题。

---

# 一、PocketBase 的索引设计

PocketBase 的集合（collection）结构中：

- **字段（fields）**
    
- **索引（indexes）**
    

是 **完全独立的两部分**。

集合 schema 的结构类似：

```json
{
  "fields": [...],
  "indexes": []
}
```

`indexes` 是一个 **SQL index 定义数组**，只有在这里声明的索引才会真正创建数据库索引。

也就是说：

- 创建字段
    
- 不会自动创建 index
    

---

# 二、系统字段 `created` / `updated`

PocketBase 在每个 collection 中自动添加以下系统字段：

|字段|作用|
|---|---|
|`id`|记录唯一 ID|
|`created`|创建时间|
|`updated`|更新时间|

其中：

- `id` 是 **PRIMARY KEY**（SQLite 自动索引）
    
- `created` / `updated` **只是普通字段**
    

在底层数据库（SQLite）中，表结构类似：

```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  created TEXT NOT NULL,
  updated TEXT NOT NULL
);
```

因此：

|字段|是否自动索引|
|---|---|
|`id`|✔|
|`created`|❌|
|`updated`|❌|

---

# 三、关系字段（relation）也不会自动索引

PocketBase 的 `relation` 字段本质只是存储：

- 单 relation → `recordId`
    
- 多 relation → `JSON array`
    

例如：

```sql
author TEXT
tags TEXT
```

这些字段默认 **也不会创建 index**。

因此如果有类似查询：

```
filter: author = "USER_ID"
```

没有索引时会触发 **全表扫描**。

---

# 四、常见需要手动创建索引的场景

## 1 时间排序（非常常见）

例如 API：

```
GET /api/collections/posts/records?sort=-created
```

建议创建：

```sql
CREATE INDEX idx_posts_created
ON posts(created);
```

---

## 2 时间分页

如果同时使用排序和分页：

```
sort=-created
page=1
perPage=20
```

更好的索引是：

```sql
CREATE INDEX idx_posts_created_id
ON posts(created DESC, id);
```

原因：

- SQLite 在排序 + 分页时可以直接利用复合索引
    
- 避免额外排序开销
    

---

## 3 relation 查询

例如：

```
filter: author = "USER_ID"
```

建议创建：

```sql
CREATE INDEX idx_posts_author
ON posts(author);
```

---

# 五、什么时候必须加索引

当数据量达到 **几万条以上**时，如果满足以下条件，建议添加索引：

|情况|建议|
|---|---|
|经常 `sort=-created`|加 `created` index|
|经常 `filter author = ...`|加 relation index|
|分页 feed / timeline|加 `(created, id)` index|

---

# 六、结论

在 PocketBase 中：

|字段类型|是否自动索引|
|---|---|
|`id`|✔（PRIMARY KEY）|
|`created`|❌|
|`updated`|❌|
|`relation` 字段|❌|
|普通字段|❌|

因此：

> **如果字段用于排序或过滤，应主动创建数据库索引。**

---

如果你需要，我可以再补充一篇 **PocketBase 数据库索引设计最佳实践（包括 timeline / chat / relation 结构）**，里面有几个 **很多项目会踩的性能坑**。