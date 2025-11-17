<div align="center">
  <svg style="width: 128px; height: 128px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7899CC"><path d="M2 8.99374C2 5.68349 4.67654 3 8.00066 3H15.9993C19.3134 3 22 5.69478 22 8.99374V21H8.00066C4.68659 21 2 18.3052 2 15.0063V8.99374ZM14 11V13H16V11H14ZM8 11V13H10V11H8Z"></path></svg>
</div>

<h1 align="center">
  PocketChat
</h1>

<p align="center">
  <!-- Vue.js -->
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js"></img>
  <!-- TailwindCSS -->
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"></img>
  <!-- TanStack Query -->
  <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query"></img>
  <!-- PocketBase -->
  <img src="https://img.shields.io/badge/PocketBase-0E83CD?style=for-the-badge&logo=pocketbase&logoColor=white" alt="PocketBase"></img>
  </br>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License"></img>
  <img src="https://img.shields.io/github/release/haruki1953/pocket-chat.svg?style=for-the-badge" alt="GitHub Release"></img>
  <img src="https://img.shields.io/github/commit-activity/m/haruki1953/pocket-chat.svg?style=for-the-badge" alt="GitHub Activity"></img>
</p>


<p align="center">
  <a href="./README.md">English</a> | 简体中文
</p>


- PocketChat 是一个基于 [PocketBase](https://github.com/pocketbase/pocketbase) 与 [Vue3](https://github.com/vuejs/vue) 的开源实时聊天平台。
- 跨平台支持 linux、windows、macos 。部署便捷，可在 windows 上解压后运行。
- 支持配置 Github、X/Twitter 等 OAuth2 登录/注册方式。
- 支持消息回复、编辑、删除等操作，支持通过消息链接定位访问消息。
- 项目地址 https://github.com/haruki1953/pocket-chat
- 预览 https://sakiko.top

![login](./assets/Snipaste_2025-11-16_16-03-05.png)

![chat](./assets/Snipaste_2025-11-16_16-00-27.png)

## 部署

在 linux 上部署前，建议先在 windows 上尝试以便了解 PocketChat

### 在 windows 上快速尝试

PocketChat 所有的版本更新都在 Github 以 release 形式发布，在 https://github.com/haruki1953/pocket-chat/releases 下载如 `pocket_chat_0.0.1_windows_amd64.zip` 这样的压缩包。

![alt text](assets/image.png)

解压，双击 start.bat 运行，会打开这样的命令行。

![alt text](assets/image-1.png)

与此同时，将会自动在浏览器打开 PocketBase 创建超级用户页面 也就是命令行中的链接如 `http://127.0.0.1:58090/_/#/pbinstal/eyJhbGciOiJI......`。

创建超级用户是 [**部署后的务必进行的操作**](#部署后的务必进行的操作)，详见 [根据日志中的链接创建用于后台管理的超级用户](#根据日志中的链接创建用于后台管理的超级用户)

![alt text](assets/image-3.png)


`http://127.0.0.1:58090/_/` 为 PocketChat 的后台管理页面，创建超级用户后即可访问

- users 选项（专业的来说是 集合），可查看所有用户
- config 集合，可查看或修改关于本项目的一些配置，详见 [config 集合配置](#config-集合配置)
- messages 集合，可查看所有用户发送的所有消息

![alt text](assets/image-4.png)

`http://127.0.0.1:58090` 为 PocketChat 的主页，在浏览器访问即可开始使用。

![alt text](assets/image-2.png)

关于 PocketChat 的更多配置请继续阅读此文档

### 在 linux 上完整部署

为了简单易懂地演示，这里使用 [1Panel](https://github.com/1Panel-dev/1Panel) linux面板来进行 PocketChat 的部署操作

#### 准备网站

准备域名：在自己的域名服务商解析域名，此次部署演示用的域名为 `uika.top`

准备反向代理：在 1Panel(OpenResty) 创建反向代理。反向代理地址即为 http://127.0.0.1:58090 。

![](./assets/Snipaste_2025-11-17_09-01-57.png)

> 笔者因为在此之前就已经部署了一个 PocketChat ，默认端口 58090 已被使用了，所以设置的是 58091，之后会讲到 PocketChat 如何 [修改端口](#修改端口)

创建反向代理之后，还要再为它配置 https ，这里就不讲了 [1Panel 文档 HTTPS](https://docs.1panel.pro/user_manual/websites/website_config_basic/#https)

#### 下载与解压

在 1Panel 打开文件管理，在合适的地方创建文件夹，此次演示创建的文件夹为 `/root/pocketchat`

创建并进入文件夹后，点击 远程下载，输入 PocketChat 在 Github Releases 的压缩包的链接，下载如 `pocket_chat_0.0.1_linux_amd64.zip` 这样的压缩包

![](./assets/Snipaste_2025-11-17_09-30-20.png)

下载后，点击解压缩进行解压，解压后即可看到如下图所示的这些文件

![](./assets/Snipaste_2025-11-17_09-36-50.png)

#### 设置执行权限

点击 `pocketbase` 文件对应的权限数字来设置执行权限

![](./assets/Snipaste_2025-11-17_13-33-57.png)


#### 修改端口（可选）

点击打开 `start.sh` （此次演示即为 `/root/pocketchat/start.sh`），就能看到以下内容（在最后一行）。将其中的 `58090` 修改为自己想要的端口即可。

```sh
./pocketbase serve --http 127.0.0.1:58090
```

#### 后台运行与开机自启

在 1Panel 文件管理打开 `/etc/systemd/system` 文件夹，创建文件 `pocketchat.service`，点击此文件以进行编辑，粘贴以下内容（需根据自己的情况进行编辑）

```ini
[Unit]
Description=PocketChat Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/pocketchat
ExecStart=/bin/sh /root/pocketchat/start.sh
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

- WorkingDirectory 为 [下载与解压](#下载与解压) 步骤中创建的文件夹，此次演示中即为 `/root/pocketchat`
- ExecStart 也要根据上述情况进行设置，此次演示中即为 `/bin/sh /root/pocketchat/start.sh`

![](./assets/collage.png)

`pocketchat.service` 文件创建完毕后，在 1Panel 打开终端，依次执行以下命令

```sh
# 重新加载 systemd 配置
systemctl daemon-reload

# 启动服务 pocketchat
systemctl start pocketchat

# 设置开机自启
systemctl enable pocketchat

# 查看日志
journalctl -u pocketchat.service --no-pager -o cat
```

![](./assets/Snipaste_2025-11-17_14-15-28.png)

将日志中的链接中的 `127.0.0.1:58090` 替换为自己刚刚配置的域名，`http` 换为 `https`。如下（笔者本次演示中更改了端口，所以是 58091）

```
http://127.0.0.1:58091/_/#/pbinstal/eyJhbGcixxxxxxxxxxx......xxxxxxxxxxxxxx

https://uika.top/_/#/pbinstal/eyJhbGcixxxxxxxxxxx......xxxxxxxxxxxxxx
```

在浏览器访问修改后的链接，即可进入 PocketBase 创建超级用户页面。[创建超级用户](#根据日志中的链接创建用于后台管理的超级用户) 并进行 [**部署后的务必进行的操作**](#部署后的务必进行的操作) 之后，即可开始使用 PocketChat

![](./assets/Snipaste_2025-11-17_14-50-28.png)

![](./assets/Snipaste_2025-11-17_15-12-46.png)


更多命令参考

```sh
# 查看状态
systemctl status pocketchat
# 重启
systemctl restart pocketchat
# 停止
systemctl stop pocketchat
# 取消开机自启
systemctl disable pocketchat
```

## 部署后的务必进行的操作

### 根据日志中的链接创建用于后台管理的超级用户

填写 邮箱 与 密码，即可创建超级用户

> 如果不想的话，邮箱不必填真实的邮箱，比如 admin@admin.test  
> （[.test 是一个保留的 顶级域名 它保证永远不会被注册到互联网上 - Wikipedia](https://en.wikipedia.org/wiki/.test)）

![](./assets/Snipaste_2025-11-17_14-50-28.png)

### config 集合配置

![](./assets/Snipaste_2025-11-17_15-30-28.png)

- [`external-links-to-social-media-icons-etc`](#社交媒体等图标外链-external-links-to-social-media-icons-etc) : 社交媒体等图标外链（显示在登录页底部的图标链接） 
- `website-name` : 网站名称，显示在 登录页 和 聊天主页左上角
- `password-update-rate-limit-second` : 发送密码修改请求后，需要等待一段时间，才能再次进行这一操作。此值控制需等待的时间，单位为秒。
- `email-verify-rate-limit-second` : 发送邮箱验证请求后，需要等待一段时间，才能再次进行这一操作。此值控制需等待的时间，单位为秒。
- `email-update-rate-limit-second` : 发送邮箱修改请求后，需要等待一段时间，才能再次进行这一操作。此值控制需等待的时间，单位为秒。
- `allow-anonymous-view` : 是否允许游客浏览，为 `true` 则允许游客浏览，为 `false` 则只允许已登录的用户浏览
- `allow-users-to-register` : 是否开启用户注册，为 `true` 则允许用户注册，为 `false` 则不允许 且登录页将不显示注册表单

#### 社交媒体等图标外链 external-links-to-social-media-icons-etc

![](./assets/Snipaste_2025-11-17_15-47-40.png)

默认值为

```json
[
  {
    "icon": "ri-github-line",
    "link": "https://github.com/haruki1953/pocket-chat",
    "name": "github"
  },
  {
    "icon": "ri-discord-line",
    "link": "https://discord.gg/aZq6u3Asak",
    "name": "discord"
  },
  {
    "icon": "ri-telegram-2-line",
    "link": "https://t.me/PocketTogether",
    "name": "telegram"
  }
]
```

如果不需要图标外链则可以设置为空数组 `[]`

`icon` 使用的图标为 https://remixicon.com/ ，使用其图标的 `class` 值

![](./assets/Snipaste_2025-11-17_15-50-13.png)

#### config 重置为默认

将 config 集合中任意一项删除，然后重启 PocketChat，此项配置就会重置为默认值。

### Application 信息配置

![](./assets/Snipaste_2025-11-17_16-30-18.png)

- **Application name** ，邮件发送将使用此值，建议和 config 集合中的 `website-name` 保持一致
- **Application URL** ，邮件发送将使用此值，应设置为自己的网站链接

关于 **User IP proxy headers** ，自己用了 cloudflare ，需按照其提示添加 `CF-Connecting-IP`，即可解除其警告，并能解析到用户的真实ip

![](./assets/Snipaste_2025-11-17_16-53-57.png)

![](./assets/Snipaste_2025-11-17_16-57-00.png)

建议浏览 [PocketBase](https://pocketbase.io) 官网进一步了解 PocketBase，并查看 [生产环境的建议](https://pocketbase.io/docs/going-to-production/)

### pb_public index.html 网站元信息配置

用于在社交媒体等地方预览网站的网站元信息，配置在 `pb_public/index.html` ，可以根据自己的信息来修改

![](./assets/Snipaste_2025-11-17_17-35-37.png)

`index.html` 也控制着网站的加载动画，有能力的话也可以自己修改

## 配置发送电子邮件的设置

用户修改邮箱、验证邮箱、重置密码、等功能需要向用户的邮箱发送邮件，不配置的话就无法使用这些功能。

应使用 SMTP ，`sakiko.top` 的邮件服务是这样配置的：

![](./assets/Snipaste_2025-11-17_17-06-11.png)

笔者使用的是自建邮箱： https://docker-mailserver.github.io/docker-mailserver/latest/usage/

或使用 PocketBase 官网中提到的  MailerSend, Brevo, SendGrid, Mailgun, AWS SES ：https://pocketbase.io/docs/going-to-production/#use-smtp-mail-server

## 配置 OAuth2 登录/注册

PocketBase OAuth2 : https://pocketbase.io/docs/authentication/#authenticate-with-oauth2

（现在看到 users 集合有警告提示图标是因为没有配置 OAuth2 ，是正常现象，即使不打算配置 OAuth2 也不必担心）

![](./assets/Snipaste_2025-11-17_18-11-27.png)

在 PocketBase 中的 user 集合，点击设置图标，点击 **Options** ，展开 **OAuth2** ，点击 **Add provider** ，选择对应的平台即可进行配置

![](./assets/collage(6).png)

以 github 为例 ，访问 https://github.com/settings/developers 以创建 OAuth App

![](./assets/Snipaste_2025-11-17_19-28-10.png)

点击 New OAuth App ，填写表单进行创建，此处用 `uika.top` 来演示

![](./assets/Snipaste_2025-11-17_19-31-36.png)

**Authorization callback URL** 很重要，应填写自己的域名 + /api/oauth2-redirect ，详见 [PocketBase OAuth2](https://pocketbase.io/docs/authentication/#authenticate-with-oauth2)

```
https://yourdomain.com/api/oauth2-redirect
```

创建后即可看到这样的页面，`Client ID` 与 `Client secrets` 就是我们需要的

![](./assets/Snipaste_2025-11-17_19-38-39.png)

除此之外，还能设置 Application logo ，可使用此图标 https://github.com/haruki1953/pocket-chat/blob/master/resources/icon1.png

## 开发指南

pocket-chat 项目目录结构

- `pocketbase/` 为 PocketBase 所在的文件夹
- `vue3/` 为 Vue3 前端文件夹
- `project-tools-node/` 为项目打包工具脚本文件夹
- `resources/` 为项目中所用到的一些图片资源
- `note/` 为项目开发过程中的一些笔记（在本项目中很少，更多的在 [PocketTogether](#关于-pockettogether) 中）
- `assets/` README.md 中使用的一些图片

### pocketbase 后端

建议用 vscode 打开 `pocketbase/` 目录进行开发（而不是打开 本项目根目录），比如修改 `pocketbase/pb_hooks/` 目录中的 js 文件时，要借助 `pocketbase/jsconfig.json` 使其更类型严格，`pocketbase/pb_hooks/` 目录中的 js 代码应使用 jsDoc 来设置类型。

为了不增加项目git体积，为 `pocketbase.exe` 配置了忽略，即本项目仓库中并不包含 `pocketbase.exe` ，在进行开发前需要手动下载 `pocketbase.exe` ，在 https://github.com/pocketbase/pocketbase/releases 下载压缩包，解压后将 `pocketbase.exe` 复制到本项目 `pocketbase/` 目录中。

关于本项目所使用的 `pocketbase.exe` 具体版本可以查看 `pocketbase/CHANGELOG.md` ，以其中最新（最靠上）的版本为准。

双击 `pocketbase/start.sh` 即可启动本项目的 PocketBase

如果在本项目的 PocketBase 的 Web UI 中修改了数据库架构，请在 `http://127.0.0.1:58090/_/#/settings/export-collections` 将其内容复制到 `pocketbase/pb_schema.json` ，并在前端重新 [生成后端数据库的 TS 类型](#生成后端数据库的-ts-类型)。

关于 `pocketbase/pb_schema.json` ，pocketbase 的运行并不依赖于这个文件，其目的主要是为了借助git更清晰地观察数据库架构变化。此外它的另一个重要用处是帮助前端 [生成后端数据库的 TS 类型](#生成后端数据库的-ts-类型)

### vue3 前端

建议用 vscode 打开 `vue3/` 目录进行开发（而不是打开 本项目根目录）

```sh
# Project Setup
pnpm install

# Compile and Hot-Reload for Development
pnpm dev

# Type-Check, Compile and Minify for Production
pnpm build

# Lint with ESLint
pnpm lint
```

#### 生成后端数据库的 TS 类型

本项目使用 [pocketbase-typegen](https://www.npmjs.com/package/pocketbase-typegen) 来在前端生成 pocketbase 后端的数据类型：

```sh
pnpm pb-typegen-json

# "pb-typegen-json": "pocketbase-typegen --json ../pocketbase/pb_schema.json --out ./src/lib/pocketbase/pocketbase-types.ts"
```

### 关于 PocketTogether

[PocketTogether](https://github.com/haruki1953/pocket-together) 是一个基于 PocketBase 与 Vue3 的实时群聊与同步观看平台（开发中），PocketChat 其实是 PocketTogether 的半成品。