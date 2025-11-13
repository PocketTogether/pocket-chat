#!/bin/bash

# 获取脚本所在目录
SCRIPT_DIR="$(dirname "$(realpath "$0")")"
# 切换到脚本所在目录
cd "$SCRIPT_DIR"

# 运行前进行迁移
./pocketbase migrate up
# 运行 pocketbase
./pocketbase serve --http 127.0.0.1:58090