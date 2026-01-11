const { execSync } = require("child_process");
const path = require("path");

/** pocket-chat/vue3 */
const projectVue3Path = path.resolve(__dirname, "..");

/** pocket-chat */
const projectRootPath = path.resolve(projectVue3Path, "..");

/** pocket-chat/pocketbase */
const projectPocketbasePath = path.resolve(projectRootPath, "pocketbase");

/** pocket-chat/pocketbase-typegen */
const projectPocketbaseTypegenPath = path.resolve(projectRootPath, "pocketbase-typegen");

/** pocket-chat/pocketbase/pb_schema.json */
const jsonPocketbasePbSchema = path.resolve(projectPocketbasePath, 'pb_schema.json')

/** pocket-chat/vue3/src/lib/pocketbase/pocketbase-types.ts */
const outVue3PbTypes = path.resolve(projectVue3Path, './src/lib/pocketbase/pocketbase-types.ts')

// console.log("=== Path Debug Info ===");
// console.log("projectVue3Path:", projectVue3Path);
// console.log("projectRootPath:", projectRootPath);
// console.log("projectPocketbasePath:", projectPocketbasePath);
// console.log("projectPocketbaseTypegenPath:", projectPocketbaseTypegenPath);
// console.log("jsonPocketbasePbSchema:", jsonPocketbasePbSchema);
// console.log("outVue3PbTypes:", outVue3PbTypes);
// console.log("========================");

execSync(
  `pnpm tsx src/index.ts --json ${jsonPocketbasePbSchema} --out ${outVue3PbTypes}`,
  {
    cwd: projectPocketbaseTypegenPath,
    stdio: "inherit"
  }
);
