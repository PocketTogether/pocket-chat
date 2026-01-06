<div align="center">
  <img src="./assets/message-3-fill-7899CC.svg" style="width: 128px; height: 128px;">
</div>

<h1 align="center">
  PocketChat
</h1>

<p align="center">
  <!-- Vue.js -->
  <a href="https://vuejs.org/" target="_blank"><img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js"></a>
  <!-- TailwindCSS -->
  <a href="https://tailwindcss.com/" target="_blank"><img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS"></a>
  <!-- TanStack Query -->
  <a href="https://tanstack.com/query/latest" target="_blank"><img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=TanStack&logoColor=white" alt="TanStack Query"></a>
  <!-- PocketBase -->
  <a href="https://pocketbase.io/" target="_blank"><img src="https://img.shields.io/badge/PocketBase-0E83CD?style=for-the-badge&logo=pocketbase&logoColor=white" alt="PocketBase"></a>
  </br>
  <!-- License -->
  <a href="https://opensource.org/licenses/MIT" target="_blank"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License"></a>
  <!-- GitHub Release -->
  <a href="https://github.com/haruki1953/pocket-chat/releases" target="_blank"><img src="https://img.shields.io/github/release/haruki1953/pocket-chat.svg?style=for-the-badge" alt="GitHub Release"></a>
  <!-- GitHub Activity -->
  <a href="https://github.com/haruki1953/pocket-chat/commits" target="_blank"><img src="https://img.shields.io/github/commit-activity/m/haruki1953/pocket-chat.svg?style=for-the-badge" alt="GitHub Activity"></a>
  </br>
  <!-- Discord -->
  <a href="https://discord.gg/aZq6u3Asak"><img alt="Discord" src="https://img.shields.io/discord/1192346949635026944?logo=discord&logoColor=white&label=Discord&color=4285F4&style=for-the-badge"></a>
  <!-- Telegram -->
  <a href="https://t.me/PocketTogether"><img alt="Telegram" src="https://img.shields.io/badge/Telegram-JOIN-188FCA.svg?logo=telegram&logoColor=white&style=for-the-badge"></a>
</p>

<p align="center">
  English | <a href="./README_CN.md">简体中文</a>
</p>

- PocketChat is an open-source real-time chat platform built on [PocketBase](https://github.com/pocketbase/pocketbase) and [Vue3](https://github.com/vuejs/vue).
- Cross-platform support for Linux, Windows, and macOS. Easy deployment: can be run on Windows after extraction. Supports Docker deployment.
- Supports GitHub, X/Twitter, and other OAuth2 login/registration methods.
- Supports message reply, edit, delete, and jumping to a message via its link.
- Supports in-site new message notifications and desktop new message notifications.
- Supports image sending, image viewing, and image metadata editing
- Project address: https://github.com/haruki1953/pocket-chat
- Live demo: https://sakiko.top

![](./assets/Snipaste_2025-11-16_16-03-05.png)
![](./assets/Snipaste_2026-01-05_10-11-45.jpg)

<details>
<summary>📸 <b>More Screenshots</b></summary>

![](./assets/Snipaste_2026-01-05_10-33-05.jpg)
![](./assets/Snipaste_2026-01-05_10-34-08.jpg)
![](./assets/Snipaste_2025-11-16_16-00-27.png)
![](./assets/Snipaste_2025-11-26_19-39-09.png)
![](./assets/Snipaste_2025-11-26_19-30-04.png)

</details>

<details>
<summary>💡 <b>Development Plan</b></summary>

- File sending functionality
- User list and online status display
- User @ mention functionality
- Voice sending functionality

</details>

## Deployment

Before deploying on Linux, it is recommended to try it first on Windows to get familiar with PocketChat.

Since version v0.1.0, [Docker deployment](#deploy-with-docker) has been supported.

### Quick Start on Windows

All PocketChat releases are published on GitHub. Download the latest zip package from https://github.com/haruki1953/pocket-chat/releases, for example `pocket_chat_0.0.1_windows_amd64.zip`.

![](./assets/image.png)

Extract the archive and double-click `start.bat`. A command-line window will open.

![](./assets/image-1.png)

At the same time, your browser will automatically open the PocketBase superuser creation page (the link shown in the console, e.g. `http://127.0.0.1:58090/_/#/pbinstal/eyJhbGciOiJI......`).

Creating a superuser is a [**required step after deployment**](#required-post-deployment-steps). See [Create admin superuser using the link from the logs](#create-admin-superuser-using-the-link-from-the-logs).

![](./assets/image-3.png)

`http://127.0.0.1:58090/_/` → PocketChat admin panel (accessible after creating the superuser)

- `users` collection: view all registered users
- `config` collection: project-specific settings (see [Config collection settings](#config-collection-settings))
- `messages` collection: view all sent messages
- `images` collection: view all uploaded images (supported since version `v0.1.1`).

![](./assets/image-4.png)

<details>
<summary><b>images collection v0.1.1</b></summary>

![](./assets/Snipaste_2026-01-05_10-50-02.png)

</details>

`http://127.0.0.1:58090` → PocketChat main chat interface

![](./assets/image-2.png)

Continue reading this document for more configuration options.

### Full Deployment on Linux

For clarity, this guide uses the [1Panel](https://github.com/1Panel-dev/1Panel) control panel.

#### Prepare the website

- Prepare a domain name (example used here: `uika.top`)
- Create a reverse proxy in 1Panel (OpenResty) pointing to `http://127.0.0.1:58090`

![](./assets/Snipaste_2025-11-17_09-01-57.png)

> In this example the port is 58091 because 58090 was already in use by another PocketChat instance. How to change the port is explained in [Change port (optional)](#change-port-optional)

After creating the proxy, enable HTTPS (refer to 1Panel docs: https://docs.1panel.pro/user_manual/websites/website_config_basic/#https)

#### Download and extract

In 1Panel File Manager, create a folder (e.g. `/root/pocketchat`), then use `Download from remote` to fetch the Linux zip from GitHub Releases (e.g. `pocket_chat_0.0.1_linux_amd64.zip`).

![](./assets/Snipaste_2025-11-17_09-30-20.png)

After downloading, extract it.

![](./assets/Snipaste_2025-11-17_09-36-50.png)

#### Set executable permission

Click the permission number next to the `pocketbase` file and make it executable.

![](./assets/Snipaste_2025-11-17_13-33-57.png)

#### Change port (optional)

Edit `start.sh` and change the port in the last line:

```sh
./pocketbase serve --http 127.0.0.1:58090   # Change 58090 to your desired port
```

#### Run in background & start on boot

In `/etc/systemd/system`, create a file named `pocketchat.service` with the following content (adjust paths as needed):

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

![](./assets/collage.png)

Then open the terminal in 1Panel and run:

```sh
# Reload systemd configuration
systemctl daemon-reload
# Start the service
systemctl start pocketchat
# Enable on boot
systemctl enable pocketchat
# View logs
journalctl -u pocketchat.service --no-pager -o cat
```

![](./assets/Snipaste_2025-11-17_14-15-28.png)

Replace `127.0.0.1:58091` in the log link with your domain and change `http` → `https`. Example:

```
http://127.0.0.1:58091/_/#/pbinstal/eyJhbGcixxxxxxxxxxx......xxxxxxxxxxxxxx

https://uika.top/_/#/pbinstal/eyJhbGcixxxxxxxxxxx......xxxxxxxxxxxxxx
```

Open the modified link, [create the superuser](#create-admin-superuser-using-the-link-from-the-logs), and complete the [**required post-deployment steps**](#required-post-deployment-steps).

![](./assets/Snipaste_2025-11-17_14-50-28.png)
![](./assets/Snipaste_2025-11-17_15-12-46.png)

Additional useful commands:

```sh
# Check status
systemctl status pocketchat
# Restart
systemctl restart pocketchat
# Stop
systemctl stop pocketchat
# Disable boot start
systemctl disable pocketchat
```

### Deploy with Docker

You can find the latest image at: https://github.com/haruki1953/pocket-chat/pkgs/container/pocket-chat

```sh
mkdir -p ${HOME}/PocketChat/pb_data
cd ${HOME}/PocketChat

docker run -d \
  --name PocketChat \
  -v ${HOME}/PocketChat/pb_data:/app/pb_data \
  -p 58090:58090 \
  --restart unless-stopped \
  ghcr.io/haruki1953/pocket-chat:latest

docker logs PocketChat
```


### PocketChat Update Guide (For Deployed Instances)

#### Manual Update Guide

The following steps apply to **PocketChat deployed via binary (non‑Docker)**. All operations can be performed through **1Panel**.

##### 1. Stop the currently running service
```sh
systemctl stop pocketchat
```

##### 2. Navigate to the PocketChat installation directory
This is usually the directory where you originally extracted the files, for example:
```sh
cd /root/pocketchat
```

##### 3. Back up the existing version (optional but recommended)
To prevent data loss in case the update fails, you can zip the current directory as a backup.

##### 4. Remove old version files (keep `pb_data`)
Delete all files and folders **except** `pb_data`.

> `pb_data` is the PocketBase database directory and **must be preserved**.

##### 5. Download and extract the new PocketChat release
Download the latest PocketChat release from GitHub Releases and extract it, for example:
`pocket_chat_0.2.1_linux_amd64.zip`
```
pocket_chat_<VERSION>_linux_amd64.zip
```

##### 6. Important notes
- **If you changed the port**
  Update the port in `start.sh`:
  ```sh
  ./pocketbase serve --http 127.0.0.1:58090
  ```

- **If you modified frontend files**  
  (e.g., `pb_public/index.html`)  
  Reapply your custom changes after updating.

- **Ensure the `pocketbase` binary has executable permissions**

##### 7. Start the service and check its status
Start the service:
```sh
systemctl start pocketchat
```

Check the service status:
```sh
systemctl status pocketchat
```

If the status is normal, the update is complete.

#### Docker Deployment Update Guide

If you deployed PocketChat using Docker, the update process is simpler.

##### 1. Check the latest available image versions
Visit:  
https://github.com/haruki1953/pocket-chat/pkgs/container/pocket-chat

Choose the version you want to update to, for example:
`ghcr.io/haruki1953/pocket-chat:0.2.1`
```
ghcr.io/haruki1953/pocket-chat:<VERSION>
```

(Optional) Pull the image in advance:
```sh
docker pull ghcr.io/haruki1953/pocket-chat:<VERSION>
```

Benefits of pulling beforehand:
- You can clearly see the download progress.
- Avoids container creation failure if the pull fails during `docker run`.
- Cleaner separation of pull/run steps in CI/CD workflows.

##### 2. Stop and remove the old container (data will not be deleted)
```sh
docker stop PocketChat
docker rm PocketChat
```

> Your data is stored in the mounted directory `${HOME}/PocketChat/pb_data` and will not be lost.

##### 3. Start a new container using the latest image
```sh
docker run -d \
  --name PocketChat \
  -v ${HOME}/PocketChat/pb_data:/app/pb_data \
  -p 58090:58090 \
  --restart unless-stopped \
  ghcr.io/haruki1953/pocket-chat:<VERSION>
```

##### 4. Check logs to confirm everything is running correctly
```sh
docker logs PocketChat
```

Update complete.

## Required Post-Deployment Steps

### Create admin superuser using the link from the logs

Fill in email and password. The email does not need to be real (e.g. `admin@admin.test`).

> [`.test` is a reserved top-level domain that will never be registered on the public internet - Wikipedia](https://en.wikipedia.org/wiki/.test)

![](./assets/Snipaste_2025-11-17_14-50-28.png)

### Config collection settings

<!-- ![](./assets/Snipaste_2025-11-17_15-30-28.png) -->
![](./assets/Snipaste_2026-01-05_10-56-53.png)

- `website-name` – Site name displayed on login page and top-left of chat
- [`external-links-to-social-media-icons-etc`](#social-media-and-other-icon-external-links-external-links-to-social-media-icons-etc) – Social media icon links shown at the bottom of the login page
- [`upload-image-process-options`](#image-processing-configuration-upload-image-process-options) : Image processing configuration `v0.1.1`
- `password-update-rate-limit-second` – Seconds to wait before another password change request is allowed
- `email-verify-rate-limit-second` – Seconds to wait before another email verification request is allowed
- `email-update-rate-limit-second` – Seconds to wait before another email update request is allowed
- `allow-anonymous-view` – `true` = guests can view chat; `false` = only logged-in users
- `allow-users-to-register` – `true` = registration enabled; `false` = registration disabled and form hidden

#### Social media and other icon external links (external-links-to-social-media-icons-etc)

![](./assets/Snipaste_2025-11-17_15-47-40.png)

Default value:

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

Set to `[]` to disable. 

Icons come from https://remixicon.com/ (use the class name).

![](./assets/Snipaste_2025-11-17_15-50-13.png)

#### Image processing configuration (upload-image-process-options)

![](./assets/Snipaste_2026-01-05_11-23-48.png)

Default value:

```json
{
  "bigConfig": {
    "format": "image/webp",
    "quality": 0.9,
    "sumWidthHeightLimit": 4000
  },
  "imageConfig": {
    "format": "image/webp",
    "quality": 0.8,
    "sumWidthHeightLimit": 2000
  },
  "smallConfig": {
    "format": "image/webp",
    "quality": 0.8,
    "sumWidthHeightLimit": 1200
  },
  "tinyConfig": {
    "format": "image/webp",
    "quality": 0.8,
    "sumWidthHeightLimit": 800
  }
}
```

Configuration details:

```
bigConfig   Configuration for large images
imageConfig Configuration for medium images
smallConfig Configuration for small images
tinyConfig  Configuration for extra-small images

format  Image format, supported values:
        "image/png" | "image/jpeg" | "image/webp"

quality Image quality, a number between 0 and 1.
        Only applies to "image/jpeg" and "image/webp".

sumWidthHeightLimit
        The limit for the sum of image width and height.
        Images will be resized according to this value.
        Note: The values must follow the order:
              bigConfig > imageConfig > smallConfig > tinyConfig

(The frontend will automatically choose the most appropriate image size
based on element dimensions and screen resolution.)
```

#### Reset config to defaults

Delete any field in the config collection and restart PocketChat – that field will revert to its default value.

#### Config Validatio

After modifying the `config` collection, reopen the frontend webpage (note: this refers to the user-facing site at the root path, **not** the PocketBase admin panel). Then open the browser’s developer tools and check the console.  
If no error messages appear, the configuration is valid.

If a configuration entry is missing — for example, if `external-links-to-social-media-icons-etc` is not found — the following error will appear:

```
src\queries\pb-collection-config.ts
usePbCollectionConfigQuery
findKeyItem == null
key: external-links-to-social-media-icons-etc
```

If a configuration entry is invalid — for example, if the type of `upload-image-process-options` is incorrect — the following error will appear:

```
src\queries\pb-collection-config.ts
usePbCollectionConfigQuery
findKeyItemParseResult.success === false
key: upload-image-process-options
```

![](./assets/Snipaste_2026-01-05_13-30-55.png)

### Application settings

![](./assets/Snipaste_2025-11-17_16-30-18.png)

- **Application name** – used as sender name in emails (keep consistent with `website-name`)
- **Application URL** – used in emails, set to your domain

If using Cloudflare, add `CF-Connecting-IP` to **User IP proxy headers** to resolve real IPs.

![](./assets/Snipaste_2025-11-17_16-53-57.png)
![](./assets/Snipaste_2025-11-17_16-57-00.png)

See PocketBase production recommendations: https://pocketbase.io/docs/going-to-production/

### pb_public/index.html – site meta information

Used for social media previews. Edit `pb_public/index.html` as needed.

![](./assets/Snipaste_2025-11-17_17-35-37.png)

The loading animation is also defined here.

## Configure email sending (SMTP)

Required for email verification, password reset, etc.

Example configuration used on sakiko.top:

![](./assets/Snipaste_2025-11-17_17-06-11.png)

Self-hosted option: https://docker-mailserver.github.io/docker-mailserver/latest/usage/

Or use services listed on PocketBase docs (MailerSend, Brevo, SendGrid, Mailgun, AWS SES). https://pocketbase.io/docs/going-to-production/#use-smtp-mail-server

## Configure OAuth2 login/registration

PocketBase OAuth2 docs: https://pocketbase.io/docs/authentication/#authenticate-with-oauth2

(The warning icon on the users collection is normal when no providers are configured.)

![](./assets/Snipaste_2025-11-17_18-11-27.png)

In the users collection → Settings → Options → OAuth2 → Add provider.

![](./assets/collage(6).png)

Example with GitHub:

Go to https://github.com/settings/developers → New OAuth App

![](./assets/Snipaste_2025-11-17_19-28-10.png)

Click **New OAuth App** and fill out the form. In this example, `uika.top` is used for demonstration.  

![](./assets/Snipaste_2025-11-17_19-31-36.png)

The **Authorization callback URL** is very important. It should be set to your own domain followed by `/api/oauth2-redirect`. See [PocketBase OAuth2](https://pocketbase.io/docs/authentication/#authenticate-with-oauth2) for details.  

```
https://yourdomain.com/api/oauth2-redirect
```  

After creation you get Client ID and Client Secret.

![](./assets/Snipaste_2025-11-17_19-38-39.png)

You can also set an app logo, e.g. https://github.com/haruki1953/pocket-chat/blob/master/resources/icon1.png

## Development Guide

### PocketChat Project Directory Structure

- `pocketbase/` — Folder containing PocketBase  
- `vue3/` — Vue3 frontend folder  
- `project-tools-node/` — Project packaging tool scripts folder  
- `resources/` — Image resources used in the project  
- `note/` — Development notes (few in this project, more in [PocketTogether](#about-pockettogether))  
- `assets/` — Images used in README.md  

### PocketBase Backend

It is recommended to open the `pocketbase/` directory in VS Code for development (instead of opening the project root). For example, when editing JS files in `pocketbase/pb_hooks/`, use `pocketbase/jsconfig.json` to enforce stricter typing. JS code in `pocketbase/pb_hooks/` should use JSDoc for type definitions.

To avoid increasing repository size, `pocketbase.exe` is ignored in Git. This means the executable is not included in the repository. Before development, manually download `pocketbase.exe` from:  
https://github.com/pocketbase/pocketbase/releases  

Unzip and copy `pocketbase.exe` into the `pocketbase/` directory.

The specific version of `pocketbase.exe` used in this project can be found in `pocketbase/CHANGELOG.md` (use the latest entry at the top).

Double-click `pocketbase/start.sh` to start PocketBase for this project.

If you modify the database schema via the PocketBase Web UI, export it from:  
`http://127.0.0.1:58090/_/#/settings/export-collections`  

Copy the exported content into `pocketbase/pb_schema.json`, then regenerate the [TypeScript types for the backend database](#generate-backend-database-ts-types) in the frontend.

Note: PocketBase does not depend on `pb_schema.json` to run. Its purpose is to track schema changes via Git and to help the frontend [generate backend database TS types](#generate-backend-database-ts-types).

### Vue3 Frontend

It is recommended to open the `vue3/` directory in VS Code for development (instead of the project root).

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

#### Generate Backend Database TS Types

This project uses [pocketbase-typegen](https://www.npmjs.com/package/pocketbase-typegen) to generate PocketBase backend data types for the frontend:

```sh
pnpm pb-typegen-json

# "pb-typegen-json": "pocketbase-typegen --json ../pocketbase/pb_schema.json --out ./src/lib/pocketbase/pocketbase-types.ts"
```

### About PocketTogether

[PocketTogether](https://github.com/haruki1953/pocket-together) is a real-time group chat and synchronized watching platform built on PocketBase and Vue3 (currently in development). PocketChat is essentially a partial product of PocketTogether.
