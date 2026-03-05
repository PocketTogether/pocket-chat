/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2654335481")

  // update collection data
  unmarshal({
    "listRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看消息\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看消息\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)",
    "viewRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看消息\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看消息\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2654335481")

  // update collection data
  unmarshal({
    "listRule": "",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
