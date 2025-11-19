@echo off
chcp 65001 >nul
title 快速启动订阅系统后台 (内部)
color 0B

echo.
echo [启动] 快速启动订阅系统后台管理...

:: 切换到admin目录
cd /d "%~dp0..\..\..\admin"

:: 检查目录是否正确
if not exist "package.json" (
    echo [错误] 未找到项目文件！请检查路径
    exit /b 1
)

echo [启动] 启动地址: http://localhost:3006/
echo [启动] API连接: http://localhost:3000/api
echo [启动] 按Ctrl+C停止服务器
echo.

:: 启动开发服务器
npm run dev 