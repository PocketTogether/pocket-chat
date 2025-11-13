#!/bin/bash
# 关闭命令回显 (bash 默认就不会像 cmd 那样 echo，所以这行只是说明)

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 切换到脚本所在目录
cd "$SCRIPT_DIR" || exit 1

# 运行前进行迁移
./pocketbase migrate up

# 运行 pocketbase
./pocketbase serve --http 127.0.0.1:58090