# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.0] - 2026-03-11

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增
- Feature/user and user realtime by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/30
- 支持消息搜索，并可在消息中通过 “#标签” 来快速跳转至搜索页。
- 支持用户艾特功能，可在消息中使用 “@username”，点击后可查看用户详情。
- 支持用户实时状态，如 “在线”、“离线”、“闲置”、“输入中”。

</details>

### Added

- Feature/user and user realtime by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/30
- Supports message search, and allows quick navigation to the search page via “#tags” inside messages.
- Supports user mention: use “@username” in messages, and click to view user details.
- Supports real‑time user presence status, including “Online”, “Offline”, “Idle”, and “Typing”.

## [0.5.1] - 2026-02-09

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增
- 文件图标这一块，新增 苹果、安卓、Windows 相关文件的图标支持

</details>

### Added
- Added icon support for Apple‑related, Android‑related, and Windows‑related file types.

## [0.5.0] - 2026-01-20

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增
- 支持pwa安装，即“安装”或“添加到主屏幕” by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/24
  - 支持 桌面端、移动端 的pwa安装
  - 支持一定程度的离线访问
  - 网站中的图片和文件拥有更稳定缓存

### 修复
- 解决图片查看器顶栏Alt滚动条点击后会持续拖拽无法放开的问题 by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/25

</details>

### Added
- Support for PWA installation, including “Install App” or “Add to Home Screen” by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/24
  - Works on both desktop and mobile devices  
  - Provides partial offline access  
  - Offers more reliable caching for images and files  

### Fixed
- Fix an issue where clicking the Alt scrollbar in the image viewer’s top bar causes continuous dragging that cannot be released by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/25

## [0.4.0] - 2026-01-18

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增
- 实现文件功能 by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/20

### 修复
- el-scrollbar 优化 by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/21
  - 取消其点击滚动条上的任意位置来跳转，因为其体验不太好、移动端也容易误触
  - 当屏幕小于500px时，减小滚动条的宽度
- 图片查看器优化动态过渡判断 by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/22

</details>

### Added
- Implement file functionality by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/20

### Fixed
- el-scrollbar optimization by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/21
  - Removed the functionality of clicking anywhere on the scrollbar to jump to a specific position, as the user experience was poor and prone to accidental touches on mobile devices.
  - Reduced the scrollbar width when the screen width is less than 500px.
- Image viewer optimized for dynamic transition handling. by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/22

## [0.3.0] - 2026-01-11

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增
- Implement user access control and improve the front-end. by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/18
- 实现用户权限控制，发送消息权限、发送图片权限
- 实现用户封禁功能
- 实现控制是否只允许oauth2注册
- 图片查看器，实现双击缩放或还原
- 图片查看器，实现图片加载失败时重试

### 变更
- 从 devDependencies 中移除了 `pocketbase-typegen`，改为使用位于 `/pocketbase-typegen` 的本地实现

### 修复
- 解决手机输入状态时滚动可能导致底栏被overflow-hidden的问题
- 完善图片查看器底栏中图片边框的显示

</details>

### Added
- Implement user access control and improve the front-end. by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/18
- Implemented user permission controls, including message‑sending and image‑sending permissions.  
- Added user banning functionality.  
- Added an option to restrict registration to OAuth2 only.  
- Image viewer: added double‑tap to zoom/restore.  
- Image viewer: added automatic retry when image loading fails.

### Changed
- Removed `pocketbase-typegen` from devDependencies and switched to a local implementation located at `/pocketbase-typegen`.

### Fixed
- Fixed an issue where scrolling during text input on mobile could cause the bottom bar to be hidden by `overflow-hidden`.  
- Improved the display of image borders in the image viewer’s bottom bar.

## [0.2.2] - 2026-01-07

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 修改
- Improve some issues by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/16
- 图片查看器中，让加载遮罩也阻止点击关闭
- 用户头像大小限制与格式限制放宽一些，1MB

### 修复

- 解决手机浏览器可能看不到底栏的问题

</details>

### Changed

- Improve some issues by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/16
- In the image viewer, make the loading overlay also block click-to-close actions.  
- Relax the size and format restrictions for user avatars, allowing up to 1 MB.  

### Fixed

- Fix the issue where the bottom bar may not be visible in mobile browsers.

## [0.2.1] - 2026-01-06

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 修复

- Solve some problems by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/13
- 解决当聊天高度不够屏幕时，导致新消失提示无法消除的问题
- 优化图片查看器transform过渡，完善触摸缩放位移控制
- 解决图片选择页左列较空时仍有滚动的问题
- 解决未登录时仍能确认选择图片的问题

</details>

### Fixed

- Solve some problems by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/13
- Fix the issue where the “new message dismissed” indicator cannot be cleared when the chat height is shorter than the screen.
- Optimize the image viewer’s transform transitions and improve touch-based zoom and pan controls.
- Fix the issue where the left column in the image selection page still scrolls even when it has little content.
- Fix the issue where users can still confirm image selection without being logged in.

## [0.2.0] - 2026-01-05

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增

- 实现图片功能 by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/8

</details>

### Added

- Implement image functionality by @haruki1953 in https://github.com/PocketTogether/pocket-chat/pull/8

## [0.1.0] - 2025-11-27

<details>
<summary>📝 查看中文版本 (Chinese Version)</summary>

### 新增

- 添加 Claude Code GitHub 工作流程 by @niracler in [#1](https://github.com/PocketTogether/pocket-chat/pull/1)
- 支持使用 Docker 构建 by @Ecss11 in [#4](https://github.com/PocketTogether/pocket-chat/pull/4)
- 实现新消息提示 by @haruki1953 in [#5](https://github.com/PocketTogether/pocket-chat/pull/5)
- 实现桌面消息通知，实现pb实时订阅断线重连时消息补偿 by @haruki1953 in [#6](https://github.com/PocketTogether/pocket-chat/pull/6)
- 通过github actions实现 项目打包并上传至release、docker打包与推送 by @haruki1953 in [#7](https://github.com/PocketTogether/pocket-chat/pull/7)

### 修改

- 消息发送快捷键从 `Shift + Enter` 改为 `Alt + Enter`

</details>

### Added

- Add Claude Code GitHub Workflow by @niracler in [#1](https://github.com/PocketTogether/pocket-chat/pull/1)
- Support build with docker by @Ecss11 in [#4](https://github.com/PocketTogether/pocket-chat/pull/4)
- Implemented new message alerts by @haruki1953 in [#5](https://github.com/PocketTogether/pocket-chat/pull/5)  
- Implemented desktop message notifications, with pb real-time subscription reconnection and message compensation by @haruki1953 in [#6](https://github.com/PocketTogether/pocket-chat/pull/6)  
- Implemented project packaging via GitHub Actions, uploading to release, and Docker build & push by @haruki1953 in [#7](https://github.com/PocketTogether/pocket-chat/pull/7)  

### Changed

- The message sending shortcut has been changed from Shift + Enter to Alt + Enter.

## [0.0.1] - 2025-11-16

### Changed

- `pocketbase/start.sh` `pocketbase/start.sh` script updated to use LF line endings  
  `pocketbase/start.sh` `pocketbase/start_mac.sh` 脚本改为 LF 换行符
- Documentation reorganized for clarity  
  文档整理与结构优化

## [0.0.0] - 2025-11-15

- pocket-chat: 一个基于 PocketBase 与 Vue3 的实时聊天平台 | A real-time chat platform built with PocketBase and Vue3. 

[unreleased]: https://github.com/PocketTogether/pocket-chat/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/PocketTogether/pocket-chat/compare/v0.5.1...v0.6.0
[0.5.1]: https://github.com/PocketTogether/pocket-chat/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/PocketTogether/pocket-chat/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/PocketTogether/pocket-chat/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/PocketTogether/pocket-chat/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/PocketTogether/pocket-chat/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/PocketTogether/pocket-chat/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/PocketTogether/pocket-chat/compare/v0.1.0...v0.2.0
