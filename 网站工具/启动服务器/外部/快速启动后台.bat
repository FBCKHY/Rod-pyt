@echo off
chcp 65001 >nul
title 快速启动订阅系统后台 (外部)
color 0B

echo.
echo ╔══════════════════════════════════════╗
echo ║        订阅系统 后台管理             ║
echo ║             快速启动工具             ║
echo ╚══════════════════════════════════════╝
echo.

:: 切换到admin目录
cd /d "%~dp0..\..\..\admin"

:: 检查目录是否正确
if not exist "package.json" (
    echo [错误] 未找到项目文件！请检查路径是否正确
    echo [路径] 当前目录: %CD%
    echo.
    pause
    exit /b 1
)

echo [信息] 项目目录: %CD%
echo [信息] 启动地址: http://localhost:3006/
echo [信息] API连接: http://localhost:3000/api
echo [信息] Vue DevTools: http://localhost:3006/__devtools__/
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ╔══════════════════════════════════════╗
echo ║             正在启动...              ║
echo ╚══════════════════════════════════════╝
echo.

:: 启动开发服务器
npm run dev

echo.
echo [信息] 服务器已停止
echo.
pause 