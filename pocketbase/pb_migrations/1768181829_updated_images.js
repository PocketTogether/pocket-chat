/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3804557486",
    "max": null,
    "min": 0,
    "name": "imageWidth",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1872529420",
    "max": null,
    "min": 0,
    "name": "imageHeight",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number771016896",
    "max": null,
    "min": 0,
    "name": "imageFileSize",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1877215162",
    "max": null,
    "min": 0,
    "name": "imageBigWidth",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1976269958",
    "max": null,
    "min": 0,
    "name": "imageBigHeight",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number1447597139",
    "max": null,
    "min": 0,
    "name": "imageBigFileSize",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number755211556",
    "max": null,
    "min": 0,
    "name": "imageSmallWidth",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1648239967",
    "max": null,
    "min": 0,
    "name": "imageSmallHeight",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(12, new Field({
    "hidden": false,
    "id": "number335877280",
    "max": null,
    "min": 0,
    "name": "imageSmallFileSize",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number3682501131",
    "max": null,
    "min": 0,
    "name": "imageTinyWidth",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "number3373884697",
    "max": null,
    "min": 0,
    "name": "imageTinyHeight",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(16, new Field({
    "hidden": false,
    "id": "number3304724116",
    "max": null,
    "min": 0,
    "name": "imageTinyFileSize",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3804557486",
    "max": null,
    "min": null,
    "name": "imageWidth",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number1872529420",
    "max": null,
    "min": null,
    "name": "imageHeight",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
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

  // update field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number1877215162",
    "max": null,
    "min": null,
    "name": "imageBigWidth",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number1976269958",
    "max": null,
    "min": null,
    "name": "imageBigHeight",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
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

  // update field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number755211556",
    "max": null,
    "min": null,
    "name": "imageSmallWidth",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(11, new Field({
    "hidden": false,
    "id": "number1648239967",
    "max": null,
    "min": null,
    "name": "imageSmallHeight",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
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

  // update field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "number3682501131",
    "max": null,
    "min": null,
    "name": "imageTinyWidth",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
  collection.fields.addAt(15, new Field({
    "hidden": false,
    "id": "number3373884697",
    "max": null,
    "min": null,
    "name": "imageTinyHeight",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // update field
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
})
