# 📦 project-tools-node

基于 **Node.js + pnpm** 的项目管理工具脚本集合，用于 `pocket-chat` 项目的 **打包、构建、版本管理** 等操作，确保跨平台的可维护性与可重复性。

---

## 📂 目录结构

```
project-tools-node/
  ├── project-config.js              # 项目配置（名称、版本、平台、下载链接等）
  ├── project-package.js             # 打包脚本：生成多平台发行包
  ├── project-pocketbase-download.js # 下载并解压 PocketBase 各平台版本，将下载至
  ├── package.json                   # Node 项目依赖配置
  ├── pnpm-lock.yaml                 # pnpm 锁文件
  ├── node_modules/                  # 第三方依赖（archiver、extract-zip 等）
  └── README.md                      # 使用说明文档
```

---

## 🛠️ 功能说明

### `project-config.js`
- 定义项目名、根目录、PocketBase 版本号与下载目录  
- 提供平台数组（如 `windows_amd64`, `linux_arm64` 等）  
- 提供下载链接拼接函数，自动生成各平台的下载地址  

### `project-pocketbase-download.js`
- 自动下载并解压 PocketBase 各平台二进制文件  
- 支持并行下载，统一存放在 `pocketbase-release-file/`  

### `project-package.js`
- **版本号参数化**：命令行传入版本号（如 `0.0.1`）  
- **前置检查**：确保以下条件满足：
  - `vue3/dist/` 前端构建产物存在  
  - `pocketbase-release-file/` 中各平台可执行文件完整  
  - `CHANGELOG.md` 包含当前版本号  
  - `LICENSE.md` 存在  
- **打包输出**：
  - 在 `out/<version>/dist/` 生成各平台目录  
  - 在 `out/<version>/release/` 生成对应 zip 压缩包  

---

## 🚀 使用方法

1. 安装依赖  
   ```bash
   cd project-tools-node
   pnpm install
   ```

2. 下载 PocketBase 各平台版本  
   ```bash
   pnpm node project-pocketbase-download.js
   ```

3. 执行打包  
   ```bash
   pnpm node project-package.js 0.0.1
   ```

4. 输出结果  
   ```
   out/0.0.1/dist/pocket_chat_0.0.1_<platform>/
   out/0.0.1/release/pocket_chat_0.0.1_<platform>.zip
   ```

---

## 🔧 推荐工作流

1. **前端构建**  
   在 `vue3/` 中执行：  
   ```bash
   pnpm build
   ```

2. **更新版本信息**  
   在根目录更新 `CHANGELOG.md`，确保包含新版本号。  

3. **下载 PocketBase**  
   在 `project-tools-node/` 中运行：  
   ```bash
   pnpm node project-pocketbase-download.js
   ```

4. **执行打包脚本**  
   ```bash
   pnpm node project-package.js <version>
   ```

---

## 📌 注意事项

- 如果 `out/<version>/` 已存在，脚本会提示并退出，避免覆盖。  
- 打包前务必确认 `CHANGELOG.md` 已更新到当前版本。  
- 脚本依赖 Node.js 环境，需安装 `archiver` 与 `extract-zip`。  
- 下载 PocketBase 时需保证网络可访问 GitHub Release。  
