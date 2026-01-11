/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "bool1512114028",
    "name": "isBanned",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "select3254728963",
    "maxSelect": 1,
    "name": "canSendMessage",
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
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "select55021050",
    "maxSelect": 1,
    "name": "canUploadImage",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "YES",
      "NO"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("bool1512114028")

  // remove field
  collection.fields.removeById("select3254728963")

  // remove field
  collection.fields.removeById("select55021050")

  return app.save(collection)
})
