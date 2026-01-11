官方文档
https://docs.github.com/zh/actions

借鉴
https://github.com/maginawin/ha-dali-center/blob/main/.github/workflows/release.yml
```yml
name: Release

on:
  release:
    types: [ "published" ]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  release-zip:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ZIP Component Dir
        run: |
          cd ${{ github.workspace }}/custom_components/dali_center
          zip -r dali_center.zip ./

      - name: Upload zip to release
        uses: svenstaro/upload-release-action@v2
        with:
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          file: ${{ github.workspace }}/custom_components/dali_center/dali_center.zip
          asset_name: dali_center.zip
          tag: ${{ github.ref }}
          overwrite: true
```


## 打包工作流设计

```
name: Release

on:
  release:
    types: [ "published" ]
  workflow_dispatch:

permissions:
  id-token: write       # 用于 OIDC 身份令牌，生成签名证明
  contents: read        # 读取仓库内容（比如 Release 信息）
  attestations: write   # 写入 attestation 记录
  packages: write       # 如果工件要发布到 GitHub Packages，需要写权限


permissions:
  contents: write
```

```
pocket-chat 项目目录结构
- project-tools-node/
  - project-config.js
  - project-pocketbase-download.js
  - project-package.js
  - package.json
  - pnpm-lock.yaml
- vue3/
  - src/
  - dist/
  - package.json
  - pnpm-lock.yaml
- pocketbase/
  - pb_hooks/
  - pb_migrations/
  - pocketbase.exe
  - start.bat
  - start.sh
  - start_mac.sh
- pocketbase-release-file/
  - pocketbase_0.33.0_windows_amd64/
    - pocketbase.exe
  - pocketbase_0.33.0_linux_amd64/
    - pocketbase
  - pocketbase_0.33.0_linux_arm64/
    ……
  ……
- out/
  - 0.0.1/
    - dist/
      - pocket_chat_0.0.1_windows_amd64/
        - pb_hooks/
        - pb_migrations/
        - pb_public/
        - pocketbase.exe
        - start.bat
        - start.sh
        - start_mac.sh
        - CHANGELOG.md
        - LICENSE.md
      - pocket_chat_0.0.1_linux_amd64/
        ……
      - pocket_chat_0.0.1_linux_arm64/
        ……
      ……
    - release/
      - pocket_chat_0.0.1_windows_amd64.zip
      - pocket_chat_0.0.1_linux_amd64.zip
      - pocket_chat_0.0.1_linux_arm64.zip
      ……
- CHANGELOG.md
- LICENSE.md
- README.md


project-tools-node/ 中会写一些js脚本 用于项目 打包 之类的操作
vue3/ 是前端项目目录
vue3/dist/ 是前端打包后的内容，最终将会被打包脚本复制到各个 pb_public/ 中
pocketbase/ 是后端pocketbase的目录
pocketbase/pocketbase.exe 是pocketbase程序主体
pocketbase/start.bat、start.sh、start_mac.sh 是pocket-chat项目启动脚本
pocketbase-release-file/ 为存放不同平台的pocketbase可执行文件，打包时会从这里复制
out/ 打包时输出内容的文件夹

project-tools-node/ 目录中
project-config.js 其中导出了一些要用于其他脚本的配置，比如本项目项目名、所使用的pocketbase版本之类的
project-pocketbase-download.js 作用为下载 pocketbase 所发布的多个各版本zip文件到 pocketbase-release-file/ 文件夹并解压，打包时需要这些文件。
project-package.js 作用为打包项目，接收一个参数如 0.0.1 ，打包时以此创建新文件夹并拼接文件名，如将在 out/0.0.1/dist/ 输出各平台版本的未压缩文件、将在 out/0.0.1/release/ 输出用于上传的各平台版本的zip文件


打包时的步骤（简单描述，还有 node设置、pnpm下载依赖、缓存配置 等许多未描述操作不要忘记）
注意 在目录中移动、上传之类的操作中，请使用绝对路径

移动到 vue3/ 目录
pnpm build 构建前端，vue3/dist/

移动到 project-tools-node/ 目录
执行 project-pocketbase-download.js 脚本
下载的内容不会变，配置缓存，且在已有缓存时不执行此步骤，建议将 project-config.js、project-pocketbase-download.js 这两个文件作为缓存key

移动到 project-tools-node/ 目录
执行 project-package.js 脚本
注意 github.ref 一般为 refs/tags/v1.2.3 ，即标签名 github.ref_name 是开头带v的（v0.0.1），而打包脚本需要的参数是不能有v的（0.0.1），并且，项目中代表版本的目录名都是没有v的（0.0.1）
上传工件，dist/ 和 release/ 中的内容都需要上传 （以后还要在别的job实现docker打包，不过现在先不用实现）

Upload zip to release
需生成 项目证明 artifact-attestations 让 release 的内容有保证

项目目录结构
- docker-temp/
  - pocket_chat_0.0.1_linux_amd64/
    - pb_hooks/
    - pb_migrations/
    - pb_public/
    - pocketbase.exe
    - start.bat
    - start.sh
    - start_mac.sh
    - CHANGELOG.md
    - LICENSE.md
  - pocket_chat_0.0.1_linux_arm64/
    ……
  ……
- docker-build/
  - pb_hooks/
  - pb_migrations/
  - pb_public/
  - pocketbase
  - start.bat
  - start.sh
  - start_mac.sh
  - CHANGELOG.md
  - LICENSE.md
- Dockerfile


docker打包

job 中的准备
下载工件 out-dist 至 docker-temp 文件夹
从 docker-temp-dist 中找到名称以 linux_amd64 结尾的文件夹，复制到 docker-build 文件夹

Dockerfile中的操作
复制 docker-build 的全部内容
EXPOSE 58090
ENTRYPOINT ["sh", "start.sh"]


给我job里操作的实现
给我写Dockerfile
```

【251125】为实现多平台构建，将docker-temp至docker-build的操作放在dockerfile里
```
- docker-temp/
  - pocket_chat_0.0.1_linux_amd64/
  - pocket_chat_0.0.1_linux_arm64/
  ……
- docker-build/

（因为项目名不固定）需在 docker-temp 目录中找到以 DOCKER_BUILD_PLATFORM（环境变量 当前构建平台字符串）结尾的目录
然后将其中的内容复制到 docker-build 目录

可参考原本在cicd中的操作：
      # 准备 docker-build 目录
      - name: Prepare docker-build folder
        run: |
          # 在 docker-temp 文件夹中查找以 linux_amd64 结尾的目录（只查找第一层）
          AMD64_DIR=$(find "${{ github.workspace }}/docker-temp" -maxdepth 1 -type d -name "*linux_amd64")
          echo "Found amd64 dir: $AMD64_DIR"   # 打印找到的目录路径，方便调试
      
          # 删除旧的 docker-build 文件夹，避免残留文件影响新的构建
          rm -rf "${{ github.workspace }}/docker-build"
      
          # 创建新的 docker-build 文件夹（-p 表示父目录不存在时也一并创建，且目录已存在时不报错）
          mkdir -p "${{ github.workspace }}/docker-build"
      
          # 将找到的 amd64 目录里的所有文件复制到 docker-build 文件夹中
          cp -r "$AMD64_DIR"/* "${{ github.workspace }}/docker-build/"
```


docker测试
```
mkdir -p ${HOME}/PocketChat/pb_data
cd ${HOME}/PocketChat

docker run -d \
  --name PocketChat \
  -v ${HOME}/PocketChat/pb_data:/app/pb_data \
  -p 58090:58090 \
  --restart unless-stopped \
  ghcr.io/PocketTogether/pocket-chat-github-actions-test:0.0.13

docker logs PocketChat
```