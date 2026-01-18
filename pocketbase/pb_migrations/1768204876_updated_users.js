/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "// 根据config，允许注册时 才通过（且进行下一条件判断）\n(\n  @collection.config:allowRegister.key ?= 'allow-users-to-register' &&\n  @collection.config:allowRegister.value ?= true\n) &&\n// 配置中并非只允许oauth2注册时 或 oauth2注册时 才通过（且进行下一条件判断）\n(\n  // config配置中，非 只允许oauth2注册 通过\n  (\n    @collection.config:oauthOnly.key ?= 'user-register-oauth2-only' &&\n    @collection.config:oauthOnly.value ?= false\n  ) || \n  // 这里即只允许oauth2注册\n  (\n    // 上下文为oauth2 且 当前未登录时 通过\n    // 当前未登录这个判断主要用于防止已登录的用户再次注册\n    @request.context = 'oauth2' &&\n    @request.auth.id = ''\n  )\n) &&\n// 资源本身的可访问性条件\n(\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.canUploadFile:isset = false &&\n  @request.body.maxUploadFileSize:isset = false &&\n  @request.body.isBanned:isset = false\n)",
    "updateRule": "// 访问主体的前置条件 ，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，isBanned为false的用户才能访问\n(\n  @collection.users:isBannedCheck.id ?= @request.auth.id &&\n  @collection.users:isBannedCheck.isBanned ?= false\n) &&\n// 资源本身的可访问性条件\n(\n  // 只能修改用户自己的\n  id = @request.auth.id &&\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.canUploadFile:isset = false &&\n  @request.body.maxUploadFileSize:isset = false &&\n  @request.body.isBanned:isset = false\n)"
  }, collection)

  // add field
  collection.fields.addAt(13, new Field({
    "hidden": false,
    "id": "select4207878442",
    "maxSelect": 1,
    "name": "canUploadFile",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "YES",
      "NO"
    ]
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number2537851761",
    "max": null,
    "min": 0,
    "name": "maxUploadFileSize",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "createRule": "// 根据config，允许注册时 才通过（且进行下一条件判断）\n(\n  @collection.config:allowRegister.key ?= 'allow-users-to-register' &&\n  @collection.config:allowRegister.value ?= true\n) &&\n// 配置中并非只允许oauth2注册时 或 oauth2注册时 才通过（且进行下一条件判断）\n(\n  // config配置中，非 只允许oauth2注册 通过\n  (\n    @collection.config:oauthOnly.key ?= 'user-register-oauth2-only' &&\n    @collection.config:oauthOnly.value ?= false\n  ) || \n  // 这里即只允许oauth2注册\n  (\n    // 上下文为oauth2 且 当前未登录时 通过\n    // 当前未登录这个判断主要用于防止已登录的用户再次注册\n    @request.context = 'oauth2' &&\n    @request.auth.id = ''\n  )\n) &&\n// 资源本身的可访问性条件\n(\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.isBanned:isset = false\n)",
    "updateRule": "// 访问主体的前置条件 ，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，isBanned为false的用户才能访问\n(\n  @collection.users:isBannedCheck.id ?= @request.auth.id &&\n  @collection.users:isBannedCheck.isBanned ?= false\n) &&\n// 资源本身的可访问性条件\n(\n  // 只能修改用户自己的\n  id = @request.auth.id &&\n  // 这些值不能由用户控制，不能设置\n  @request.body.canSendMessage:isset = false &&\n  @request.body.canUploadImage:isset = false &&\n  @request.body.isBanned:isset = false\n)"
  }, collection)

  // remove field
  collection.fields.removeById("select4207878442")

  // remove field
  collection.fields.removeById("number2537851761")

  return app.save(collection)
})
