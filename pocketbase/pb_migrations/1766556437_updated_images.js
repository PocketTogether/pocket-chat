/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number771016896",
    "max": null,
    "min": null,
    "name": "imageFileSize",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number1447597139",
    "max": null,
    "min": null,
    "name": "imageBigFileSize",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number335877280",
    "max": null,
    "min": null,
    "name": "imageSmallFileSize",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number3304724116",
    "max": null,
    "min": null,
    "name": "imageTinyFileSize",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // remove field
  collection.fields.removeById("number771016896")

  // remove field
  collection.fields.removeById("number1447597139")

  // remove field
  collection.fields.removeById("number335877280")

  // remove field
  collection.fields.removeById("number3304724116")

  return app.save(collection)
})
