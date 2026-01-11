自己对 pocketbase-typegen 改了改

原本有这样的问题，集合中的 select 字段，如果是非必填的，就会是这样
```ts
export enum UsersCanUploadImageOptions {
  "YES" = "YES",
  "NO" = "NO",
}
```
这是不太对的，因为其还可能是空字符串，即自己想要的是这样
```ts
export enum UsersCanUploadImageOptions {
  "YES" = "YES",
  "NO" = "NO",
  "" = "",
}
```

找到了 select 字段 Options 相关的位置
```
src\fields.ts
createSelectOptions
```

另外，自己还将其改了改，取消了从数据库生成，只保留了从json生成，还取消了很多开发依赖或测试代码

运行示例
```sh
pnpm tsx src/index.ts --json ./data-example/pb_schema-test.json --out ./data-example/pocketbase-types-test.ts
pnpm tsx src/index.ts --json ./data-example/pb_schema-test1.json --out ./data-example/pocketbase-types-test1.ts
```