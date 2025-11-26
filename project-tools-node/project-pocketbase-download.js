// project-pocketbase-download.js
// 下载并解压 pocketbase 各平台版本

const fs = require("fs");
const path = require("path");
const extract = require("extract-zip");
const { 
  POCKETBASE_VERSION, 
  POCKETBASE_PLATFORMS, 
  POCKETBASE_DOWNLOAD_URL_FN,
  POCKETBASE_DOWNLOAD_DIR,
} = require("./project-config");

/**
 * 清空并重新创建 release 目录
 */
function resetReleaseDir() {
  if (fs.existsSync(POCKETBASE_DOWNLOAD_DIR)) {
    fs.rmSync(POCKETBASE_DOWNLOAD_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(POCKETBASE_DOWNLOAD_DIR, { recursive: true });
}

/**
 * 下载文件
 * @param {string} url 下载链接
 * @param {string} dest 保存路径
 * @returns {Promise<void>}
 */
async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`下载失败: ${url}, 状态码: ${res.status}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
}

/**
 * 解压文件
 * @param {string} zipPath 压缩包路径
 * @param {string} targetDir 解压目标目录
 */
async function unzipFile(zipPath, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });
  await extract(zipPath, { dir: targetDir });
}

/**
 * 主流程
 */
async function main() {
  console.log(`开始下载 PocketBase v${POCKETBASE_VERSION} 到 ${POCKETBASE_DOWNLOAD_DIR}`);

  resetReleaseDir();

  // 并行下载所有平台的 zip
  await Promise.all(
    POCKETBASE_PLATFORMS.map(async (platform) => {
      const url = POCKETBASE_DOWNLOAD_URL_FN(platform);
      const zipName = `pocketbase_${POCKETBASE_VERSION}_${platform}.zip`;
      const zipPath = path.join(POCKETBASE_DOWNLOAD_DIR, zipName);
      const extractDir = path.join(POCKETBASE_DOWNLOAD_DIR, `pocketbase_${POCKETBASE_VERSION}_${platform}`);

      console.log(`下载: ${url}`);
      await downloadFile(url, zipPath);

      console.log(`解压: ${zipName}`);
      await unzipFile(zipPath, extractDir);
    })
  );

  console.log("✅ 全部下载并解压完成");
}

// 执行
main().catch((err) => {
  console.error("❌ 出错:", err);
  process.exit(1);
});
