#!/usr/bin/env node

/**
 * 项目打包脚本 for pocket-chat
 * 使用 Node.js 跨平台实现
 */

const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const {
  PROJECT_NAME,
  POCKETBASE_VERSION,
  POCKETBASE_PLATFORMS,
  PROJECT_ROOT_DIR
} = require("./project-config");

// === 参数解析 ===
/** @type {string|undefined} */
const version = process.argv[2];
if (version == null) {
  console.error("❌ 请提供版本号，如: node project-package.js 0.0.1");
  process.exit(1);
}

// （或许没必要）TODO 正则匹配 结尾的版本号
// version 可能为 这些字符串：0.0.1 、 v0.0.1 、 refs/tags/v0.0.1 、 dev/0.0.1
// 我想能统一解析为 如 0.0.1 这样的
// 上面初始接收的 version 变量名帮我重命名，我想让最终的结果为 version

// === 路径定义 ===
const ROOT = PROJECT_ROOT_DIR
const OUT_DIR = path.join(ROOT, "out", version);
const DIST_DIR = path.join(OUT_DIR, "dist");
const RELEASE_DIR = path.join(OUT_DIR, "release");

// === 工具函数 ===
/**
 * 确保目录存在
 * @param {string} dir
 * @returns {void}
 */
function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * 复制文件或目录（递归）
 * @param {string} src
 * @param {string} dest
 * @returns {void}
 */
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

/**
 * 压缩目录为 zip
 * @param {string} srcDir
 * @param {string} zipFile
 * @returns {Promise<void>}
 */
function zipDir(srcDir, zipFile) {
  ensureDir(path.dirname(zipFile));
  const output = fs.createWriteStream(zipFile);
  const archive = archiver("zip", { zlib: { level: 9 } });

  return new Promise((resolve, reject) => {
    output.on("close", () => resolve());
    archive.on("error", err => reject(err));
    archive.pipe(output);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

// === 前置检查 ===
/**
 * 前置检查，确保打包环境完整
 * @param {string} version 当前版本号
 * @returns {void}
 */
function preCheck(version) {
  console.log("🔍 开始检查打包环境...");
  /** @type {string[]} */
  const errors = [];

  // 1. 检查 vue3/dist 是否存在
  const vueDist = path.join(ROOT, "vue3", "dist");
  if (!fs.existsSync(vueDist)) {
    errors.push("缺少前端打包目录 vue3/dist，请先执行前端构建");
  }

  // 2. 检查 pocketbase-release-file 中各平台文件是否存在
  for (const platform of POCKETBASE_PLATFORMS) {
    const pbReleaseDir = path.join(
      ROOT,
      "pocketbase-release-file",
      `pocketbase_${POCKETBASE_VERSION}_${platform}`
    );
    const pbBinary = platform.startsWith("windows") ? "pocketbase.exe" : "pocketbase";
    const pbBinaryPath = path.join(pbReleaseDir, pbBinary);

    if (!fs.existsSync(pbBinaryPath)) {
      errors.push(`缺少 pocketbase 可执行文件: ${pbBinaryPath}`);
    }
  }

  // 3. 检查 CHANGELOG.md 是否包含当前版本号
  const changelogPath = path.join(ROOT, "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) {
    errors.push("缺少 CHANGELOG.md 文件");
  } else {
    const changelogContent = fs.readFileSync(changelogPath, "utf-8");
    if (!changelogContent.includes(`[${version}]`)) {
      errors.push(`CHANGELOG.md 未包含当前版本号 [${version}] ，请更新后再打包`);
    }
  }

  // 4. 检查 LICENSE.md 是否存在
  const licensePath = path.join(ROOT, "LICENSE.md");
  if (!fs.existsSync(licensePath)) {
    errors.push("缺少 LICENSE.md 文件");
  }

  // === 统一处理结果 ===
  if (errors.length > 0) {
    console.error("❌ 前置检查失败，发现以下问题：");
    for (const err of errors) {
      console.error(" - " + err);
    }
    process.exit(1);
  }

  console.log("✅ 检查通过，可以开始打包");
}

// === 主逻辑 ===
if (fs.existsSync(OUT_DIR)) {
  console.error(`❌ 版本 ${version} 已存在，请删除后再试`);
  process.exit(1);
}

preCheck(version); // 执行前置检查

console.log(`🚀 开始打包 ${PROJECT_NAME} ${version}`);
ensureDir(DIST_DIR);
ensureDir(RELEASE_DIR);

(async () => {
  /** 
   * 封装单个平台的打包逻辑
   * @param {string} platform 当前版本号
   */
  async function buildPlatform(platform) {
    const outName = `${PROJECT_NAME}_${version}_${platform}`;
    const outPath = path.join(DIST_DIR, outName);

    console.log(`📦 打包平台: ${platform}`);

    // 1. 从 pocketbase/ 复制基础文件
    copyRecursive(path.join(ROOT, "pocketbase", "pb_hooks"), path.join(outPath, "pb_hooks"));
    copyRecursive(path.join(ROOT, "pocketbase", "pb_migrations"), path.join(outPath, "pb_migrations"));
    copyRecursive(path.join(ROOT, "pocketbase", "start.bat"), path.join(outPath, "start.bat"));
    copyRecursive(path.join(ROOT, "pocketbase", "start.sh"), path.join(outPath, "start.sh"));
    copyRecursive(path.join(ROOT, "pocketbase", "start_mac.sh"), path.join(outPath, "start_mac.sh"));
    copyRecursive(path.join(ROOT, "pocketbase", "start_docker.sh"), path.join(outPath, "start_docker.sh"));

    // 2. pb_public 来自 vue3/dist
    copyRecursive(path.join(ROOT, "vue3", "dist"), path.join(outPath, "pb_public"));

    // 3. pocketbase 可执行文件来自 pocketbase-release-file
    const pbReleaseDir = path.join(
      ROOT,
      "pocketbase-release-file",
      `pocketbase_${POCKETBASE_VERSION}_${platform}`
    );
    const pbBinary = platform.startsWith("windows") ? "pocketbase.exe" : "pocketbase";
    copyRecursive(path.join(pbReleaseDir, pbBinary), path.join(outPath, pbBinary));

    // 4. 根目录的 CHANGELOG.md 和 LICENSE.md
    copyRecursive(path.join(ROOT, "CHANGELOG.md"), path.join(outPath, "CHANGELOG.md"));
    copyRecursive(path.join(ROOT, "LICENSE.md"), path.join(outPath, "LICENSE.md"));

    // 5. 压缩为 zip
    const zipFile = path.join(RELEASE_DIR, `${outName}.zip`);
    await zipDir(outPath, zipFile);
    console.log(`✅ 已生成: ${zipFile}`);
  }

  // 并行执行所有平台的打包
  await Promise.all(POCKETBASE_PLATFORMS.map((i) => buildPlatform(i)));
})();
