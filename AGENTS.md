# AGENTS.md

pocket-chat：基于 PocketBase（后端）与 Vue3（前端）的实时聊天平台。详细文档见 `README.md` 与 `note/项目规程.md`。

## 项目结构

无 workspace 的独立多目录仓库，根目录**没有** `package.json`。每个子目录独立安装依赖、独立运行命令，不要到根目录找命令。

- `pocketbase/` 后端（pb_hooks、pb_migrations、pb_schema.json，jsconfig + JSDoc 严格类型）
- `vue3/` 前端（Vite + Vue3 + TS + Tailwind + Element Plus/Naive UI）
- `project-tools-node/` 打包工具脚本
- `pocketbase-typegen/` 本地化的类型生成工具（fork 自 pocketbase-typegen v1.3.1）
- `note/` 开发笔记
- `out/`、`pocketbase-release-file/`、`temp/` 均为忽略的构建产物目录

## 常用命令

```sh
# 前端（vue3/）
pnpm type-check # vue-tsc --build
```
注意，你在使用时，应使用 pnpm.cmd 这种的才对，如 pnpm.cmd type-check


后端是这样启动的：我双击/运行 `pocketbase/start.sh`（先 `migrate up` 再 `serve --http 127.0.0.1:58090`）。Web UI （pocketbase管理控制台） 在 `http://127.0.0.1:58090/_/`，端口固定 58090。
（注意这个只能我来运行，即自然人手动来启动，你不要管）

## 数据库架构变更流程
（注意这个只能我来运行，即自然人手动来启动，你不要管）
1. 在 PocketBase Web UI（`http://127.0.0.1:58090/_/`）的 Settings → Export collections 修改/导出架构
2. 将 Export collections 内容复制到 `pocketbase/pb_schema.json`（此文件仅供 git 追踪与类型生成，运行不依赖它）
3. 在 `vue3/` 下运行 `pnpm pb-typegen-json`
4. 输出为 `vue3/src/lib/pocketbase/pocketbase-types.ts`，是**生成文件，勿手改**，只通过 typegen 重新生成

## 必须保持同步的配置

- **config 集合默认值双份**：`vue3/src/config/pb-collection-config.ts` 与 `pocketbase/pb_hooks/init-config.pb.js`。两处被 `【pbCollectionConfigDefault_public START/END】` 标记括住的区域必须保持一致，改一端必须同步另一端
- **PocketBase 版本号三处同步**：`project-tools-node/project-config.js`、`pocketbase/CHANGELOG.md`、`Dockerfile`（ARG PB_VERSION）

## 开发环境注意

- `pocketbase/pocketbase.exe` 已在 `.gitignore` 忽略，不在 git 仓库内。新环境需从 https://github.com/pocketbase/pocketbase/releases 手动下载对应版本放入 `pocketbase/`（版本以 `pocketbase/CHANGELOG.md` 最靠上为准）
- `pocketbase/pb_hooks/` 的 JS 必须用 JSDoc 标注类型（受 `pocketbase/jsconfig.json` 的 strict/checkJs 约束）
- 前端依赖 unplugin-auto-import / unplugin-vue-components，Vue API、Element Plus、Naive UI、`@remixicon/vue` 的组件均自动导入，不要手动 import
- 默认情况下组件自动导入只走 resolver（`Components({ dirs: [] })`），不要向 `vue3/src/components` 里新增会被自动导入的假设

## 发布与 CI
（注意这个只能我来运行，即自然人手动来启动，你不要管）
本地发布流程（详见 `README.md` 发布章节）：
1. 更新 `README.md`、根目录 `CHANGELOG.md`（打包脚本会检查 `CHANGELOG.md` 是否含 `[<版本号>]`）
2. `cd vue3 && pnpm build`
3. `cd project-tools-node && node project-package.js <版本号>`

`project-package.js` 前置检查（任一不满足即退出）：`vue3/dist` 存在、`pocketbase-release-file/` 含各平台可执行文件、`CHANGELOG.md` 含当前版本号、`LICENSE.md` 存在。

- GitHub Release **published** 触发 `.github/workflows/release.yml`，构建并上传各平台 zip 与 docker 镜像；tag 前缀 `v` 会被剥掉作为版本号
- `.github/workflows/vue3-ci.yml` 在 push 时跑 type-check、lint（`continue-on-error`）、build
- Dockerfile 为单平台开发用；Dockerfile.release 为 CI 多平台生产镜像