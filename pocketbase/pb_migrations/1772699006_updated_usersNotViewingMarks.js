/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2654335481")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX `idx_X5iw7XYOKP` ON `usersNotViewingMarks` (`author`)",
      "CREATE INDEX `idx_D0NJG8AyBW` ON `usersNotViewingMarks` (`created`)"
    ]
  }, collection)

  // remove field
  collection.fields.removeById("autodate3332085495")

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2654335481")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "autodate3332085495",
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
})
