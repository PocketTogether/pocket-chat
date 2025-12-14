/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // add field
  collection.fields.addAt(5, new Field({
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

  // add field
  collection.fields.addAt(6, new Field({
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

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3607937828")

  // remove field
  collection.fields.removeById("number755211556")

  // remove field
  collection.fields.removeById("number1648239967")

  return app.save(collection)
})
