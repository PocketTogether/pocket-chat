/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_EvGVtTLFw0` ON `messages` (`author`)",
      "CREATE INDEX `idx_0HywW3Oa80` ON `messages` (`replyMessage`)",
      "CREATE INDEX `idx_JWlR4e2P9J` ON `messages` (`images`)",
      "CREATE INDEX `idx_6t47i1IN7l` ON `messages` (`file`)",
      "CREATE INDEX `idx_sStLG437oQ` ON `messages` (`mentionedUsers`)",
      "CREATE INDEX `idx_bRy1vmOOPn` ON `messages` (`created`)",
      "CREATE INDEX `idx_2Wn4zSR3iY` ON `messages` (`updated`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2605467279")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
