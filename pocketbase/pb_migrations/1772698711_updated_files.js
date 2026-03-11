/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_oQL2XaBBBV` ON `files` (`author`)",
      "CREATE INDEX `idx_znjiiQYNvh` ON `files` (`created`)",
      "CREATE INDEX `idx_pztAxKGtSi` ON `files` (`updated`)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3446931122")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_oQL2XaBBBV` ON `files` (`author`)"
    ]
  }, collection)

  return app.save(collection)
})
