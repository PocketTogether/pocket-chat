/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "file376926767",
    "maxSelect": 1,
    "maxSize": 1000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "avatar",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [
      "100x100",
      "200x200",
      "400x400"
    ],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "file376926767",
    "maxSelect": 1,
    "maxSize": 1000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "avatar",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [
      "100x100f",
      "200x200f"
    ],
    "type": "file"
  }))

  return app.save(collection)
})
