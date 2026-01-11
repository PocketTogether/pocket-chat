/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "createRule": "// 访问主体的前置条件，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，非isBanned 且 判断canSendMessage\n(\n  // 非isBanned，且\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  ) &&\n  // 判断canSendMessage，为YES，或，为空且默认允许\n  (\n    // canSendMessage为YES，或\n    (\n      @collection.users:canSendMessageCheckYES.id ?= @request.auth.id &&\n      @collection.users:canSendMessageCheckYES.canSendMessage ?= 'YES'\n    ) ||\n    // canSendMessage为空 且 默认允许\n    (\n      // canSendMessage为空，且\n      (\n        @collection.users:canSendMessageCheckEmpty.id ?= @request.auth.id &&\n        @collection.users:canSendMessageCheckEmpty.canSendMessage ?= ''\n      ) &&\n      // 配置中默认允许\n      (\n        @collection.config:UCSMD.key ?= 'user-can-send-message-default' &&\n        @collection.config:UCSMD.value ?= true\n      )\n    )\n  )\n) &&\n// 资源本身的可访问性条件，创建时需为创建者（传入的author需为当前用户）\n@request.body.author = @request.auth.id",
    "listRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看消息\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看消息\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)",
    "updateRule": "// 访问主体的前置条件，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，非isBanned 且 判断canSendMessage\n(\n  // 非isBanned，且\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  ) &&\n  // 判断canSendMessage，为YES，或，为空且默认允许\n  (\n    // canSendMessage为YES，或\n    (\n      @collection.users:canSendMessageCheckYES.id ?= @request.auth.id &&\n      @collection.users:canSendMessageCheckYES.canSendMessage ?= 'YES'\n    ) ||\n    // canSendMessage为空 且 默认允许\n    (\n      // canSendMessage为空，且\n      (\n        @collection.users:canSendMessageCheckEmpty.id ?= @request.auth.id &&\n        @collection.users:canSendMessageCheckEmpty.canSendMessage ?= ''\n      ) &&\n      // 配置中默认允许\n      (\n        @collection.config:UCSMD.key ?= 'user-can-send-message-default' &&\n        @collection.config:UCSMD.value ?= true\n      )\n    )\n  )\n) &&\n// 资源本身的可访问性条件\n(\n  // 修改消息需为创建者\n  author.id = @request.auth.id &&\n  // 禁止修改author\n  @request.body.author:isset = false\n)",
    "viewRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看消息\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看消息\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，只有isBanned为false的用户才能访问\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "createRule": "// 创建消息需登录\n@request.auth.id != \"\" &&\n// 创建时需为创建者（传入的author需为当前用户）\n@request.auth.id = @request.body.author",
    "listRule": "// 用户已登录，可以查看消息\n@request.auth.id != \"\" ||\n// 根据config，判断是否允许未登录用户查看消息\n(\n  @collection.config.key ?= 'allow-anonymous-view' &&\n  @collection.config.value ?= true\n)",
    "updateRule": "// 修改消息需登录\n@request.auth.id != \"\" &&\n// 修改消息需为创建者\n@request.auth.id = author.id &&\n// 禁止修改author\n@request.body.author:isset = false",
    "viewRule": "// 用户已登录，可以查看消息\n@request.auth.id != \"\" ||\n// 根据config，判断是否允许未登录用户查看消息\n(\n  @collection.config.key ?= 'allow-anonymous-view' &&\n  @collection.config.value ?= true\n)"
  }, collection)

  return app.save(collection)
})
