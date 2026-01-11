// import dotenv from "dotenv-flow"

import type { CollectionRecord, Options } from "./types"
import {
  // fromDatabase,
  fromJSON,
  // fromURLWithPassword,
  // fromURLWithToken,
} from "./schema"

import { generate } from "./lib"
import { saveFile } from "./utils"

export async function main(options: Options) {
  let schema: Array<CollectionRecord>
  
  if (options.json) {
    schema = await fromJSON(options.json)
  } 
  else {
    return console.error(
      "Missing schema path. Check options: pocketbase-typegen --help"
    )
  }
  const typeString = generate(schema, {
    sdk: options.sdk ?? true,
  })
  await saveFile(options.out, typeString)
  return typeString
}
