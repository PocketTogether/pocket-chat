/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file2958181620",
    "maxSelect": 1,
    "maxSize": 20000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "imageBig",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "file463167378",
    "maxSelect": 1,
    "maxSize": 2000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "imageSmall",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "file2958181620",
    "maxSelect": 1,
    "maxSize": 10000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "imageBig",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "file463167378",
    "maxSelect": 1,
    "maxSize": 1000000,
    "mimeTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ],
    "name": "imageSmall",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  return app.save(collection)
})
