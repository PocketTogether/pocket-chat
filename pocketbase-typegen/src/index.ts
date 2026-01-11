#!/usr/bin/env node

import type { Options } from "./types"
import { main } from "./cli"
import { program } from "commander"
import { version } from "../package.json"

program
  .name("Pocketbase Typegen")
  .version(version)
  .description(
    "CLI to create typescript typings for your pocketbase.io records."
  )
  .option(
    "-j, --json <path>",
    "Path to JSON schema exported from pocketbase admin UI."
  )
  .option(
    "-o, --out <path>",
    "Path to save the typescript output file.",
    "pocketbase-types.ts"
  )
  .option(
    "--no-sdk",
    "Removes the pocketbase package dependency. A typed version of the SDK will not be generated."
  )

program.parse(process.argv)
const options = program.opts<Options>()
main(options)
