const path = require("path");

// project-tools-node\project-config.js
// 项目配置（名称、版本、平台、下载链接等）

/** 项目名 */
const PROJECT_NAME = "pocket_chat";

/** 项目根目录 */
const PROJECT_ROOT_DIR = path.resolve(__dirname, "..");

/** 要将pocketbase下载到的地方 */
const POCKETBASE_DOWNLOAD_DIR = path.join(PROJECT_ROOT_DIR, "pocketbase-release-file");

/** pocketbase版本 */
const POCKETBASE_VERSION = "0.33.0";

/** 打包平台数组 */
const POCKETBASE_PLATFORMS = [
  'darwin_amd64',
  'darwin_arm64',
  'linux_amd64',
  'linux_arm64',
  'linux_armv7',
  'linux_ppc64le',
  'linux_s390x',
  'windows_amd64',
  'windows_arm64',
];

/**
 * pocketbase下载链接拼接函数
 * https://github.com/pocketbase/pocketbase/releases/download/v0.33.0/pocketbase_0.33.0_windows_amd64.zip
 * @param {string} platformStr
 * @returns {string}
 */
const POCKETBASE_DOWNLOAD_URL_FN = (platformStr) => {
  return `https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${platformStr}.zip`
}

// === 导出配置 ===
module.exports = {
  PROJECT_NAME,
  PROJECT_ROOT_DIR,
  POCKETBASE_VERSION,
  POCKETBASE_PLATFORMS,
  POCKETBASE_DOWNLOAD_URL_FN,
  POCKETBASE_DOWNLOAD_DIR,
};