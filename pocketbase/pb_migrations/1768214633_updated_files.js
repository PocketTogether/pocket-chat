/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "createRule": "// 访问主体的前置条件，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，非isBanned 且 判断canUploadFile\n(\n  // 非isBanned，且\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  ) &&\n  // 判断canUploadFile，为YES，或，为空且默认允许\n  (\n    // canUploadFile 为 YES，或\n    (\n      @collection.users:canUploadFileCheckYES.id ?= @request.auth.id &&\n      @collection.users:canUploadFileCheckYES.canUploadFile ?= 'YES'\n    ) ||\n    // canUploadFile 为空 且 默认允许\n    (\n      // canUploadFile 为空，且\n      (\n        @collection.users:canUploadFileCheckEmpty.id ?= @request.auth.id &&\n        @collection.users:canUploadFileCheckEmpty.canUploadFile ?= ''\n      ) &&\n      // 配置中默认允许\n      (\n        @collection.config:UCUFD.key ?= 'user-can-upload-file-default' &&\n        @collection.config:UCUFD.value ?= true\n      )\n    )\n  )\n) &&\n// 资源本身的可访问性条件，创建时需为创建者（传入的 author 需为当前用户）\n@request.body.author = @request.auth.id",
    "listRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，isBanned需为false\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)",
    "updateRule": "// 访问主体的前置条件，需登录\n@request.auth.id != '' &&\n// 访问主体的权限条件，非isBanned 且 判断canUploadFile\n(\n  // 非isBanned，且\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  ) &&\n  // 判断canUploadFile，为YES，或，为空且默认允许\n  (\n    // canUploadFile 为 YES，或\n    (\n      @collection.users:canUploadFileCheckYES.id ?= @request.auth.id &&\n      @collection.users:canUploadFileCheckYES.canUploadFile ?= 'YES'\n    ) ||\n    // canUploadFile 为空 且 默认允许\n    (\n      // canUploadFile 为空，且\n      (\n        @collection.users:canUploadFileCheckEmpty.id ?= @request.auth.id &&\n        @collection.users:canUploadFileCheckEmpty.canUploadFile ?= ''\n      ) &&\n      // 配置中默认允许\n      (\n        @collection.config:UCUFD.key ?= 'user-can-upload-file-default' &&\n        @collection.config:UCUFD.value ?= true\n      )\n    )\n  )\n) &&\n// 资源本身的可访问性条件\n(\n  // 修改需为创建者\n  author.id = @request.auth.id &&\n  // 禁止修改 author\n  @request.body.author:isset = false\n)",
    "viewRule": "// 访问主体的前置条件 ，根据配置值判断未登录用户是否可以查看\n(\n  // 用户已登录，可以查看\n  @request.auth.id != '' ||\n  // 根据config，判断是否允许未登录用户查看\n  (\n    @collection.config:allowAnonymousView.key ?= 'allow-anonymous-view' &&\n    @collection.config:allowAnonymousView.value ?= true\n  )\n) &&\n// 访问主体的权限条件，isBanned需为false\n(\n  // 用户未登录时可通过，因为匿名访问已在前置条件控制\n  @request.auth.id = '' ||\n  // 用户已登录，检查其isBanned 为 false 才能通过\n  (\n    @collection.users:isBannedCheck.id ?= @request.auth.id &&\n    @collection.users:isBannedCheck.isBanned ?= false\n  )\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "createRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
