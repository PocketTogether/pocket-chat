:: 关闭命令回显
@echo off
:: 启用“延迟变量扩展”
setlocal enabledelayedexpansion

:: 获取脚本所在目录
set SCRIPT_DIR=%~dp0
:: 切换到脚本所在目录
cd /d "%SCRIPT_DIR%"

:: 运行前进行迁移
pocketbase migrate up
:: 运行 pocketbase
pocketbase serve --http 127.0.0.1:58090