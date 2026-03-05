/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_lq3ggmke7m` ON `images` (`author`)",
      "CREATE INDEX `idx_21mpENhWUk` ON `images` (`created`)",
      "CREATE INDEX `idx_IjuwXU8Pwx` ON `images` (`updated`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_lq3ggmke7m` ON `images` (`author`)"
    ]
  }, collection)

  return app.save(collection)
})
