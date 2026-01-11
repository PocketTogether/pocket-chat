/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "// 根据config，允许注册时 才通过（且进行下一条件判断）\n(\n  @collection.config:allowRegister.key ?= 'allow-users-to-register' &&\n  @collection.config:allowRegister.value ?= true\n) &&\n// 配置中并非只允许oauth2注册时 或 oauth2注册时 才通过（且进行下一条件判断）\n(\n  // config配置中，非 只允许oauth2注册 通过\n  (\n    @collection.config:oauthOnly.key ?= 'user-register-oauth2-only' &&\n    @collection.config:oauthOnly.value ?= false\n  ) || \n  // 这里即只允许oauth2注册\n  (\n    // 上下文为oauth2 且 当前未登录时 通过\n    // 当前未登录这个判断主要用于防止已登录的用户再次注册\n    @request.context = 'oauth2' &&\n    @request.auth.id = ''\n  )\n) &&\n// 资源本身的可访问性条件\n(\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.isBanned:isset = false\n)",
    "listRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问，或当前为访问自己的\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned\n  (\n    // 不为 isBanned 才能通过\n    (\n      @collection.users:isBannedCheck.id ?= @request.auth.id &&\n      @collection.users:isBannedCheck.isBanned ?= false\n    ) ||\n    // isBanned 时，只查自己的用户数据，可以通过\n    id = @request.auth.id\n  )\n)",
    "updateRule": "// 访问主体的前置条件 ，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，isBanned为false的用户才能访问\n(\n  @collection.users:isBannedCheck.id ?= @request.auth.id &&\n  @collection.users:isBannedCheck.isBanned ?= false\n) &&\n// 资源本身的可访问性条件\n(\n  // 只能修改用户自己的\n  id = @request.auth.id &&\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.isBanned:isset = false\n)",
    "viewRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问，或当前为访问自己的\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned\n  (\n    // 不为 isBanned 才能通过\n    (\n      @collection.users:isBannedCheck.id ?= @request.auth.id &&\n      @collection.users:isBannedCheck.isBanned ?= false\n    ) ||\n    // isBanned 时，只查自己的用户数据，可以通过\n    id = @request.auth.id\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "// 根据config，判断是否允许用户注册\n(\n  @collection.config.key ?= 'allow-users-to-register' &&\n  @collection.config.value ?= true\n)",
    "listRule": "",
    "updateRule": "id = @request.auth.id",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
