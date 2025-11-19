@echo off
chcp 65001 >nul
title 快速启动网站前端 (内部)
color 0C

echo.
echo [启动] 快速启动网站前端服务...

:: 切换到网站前端目录
cd /d "%~dp0..\..\..\web Site\web PC"

:: 检查目录是否正确
if not exist "index.html" (
    echo [错误] 未找到网站前端文件！请检查路径
    exit /b 1
)

:: 快速检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js未安装！请先安装Node.js
    exit /b 1
)

echo.
echo [启动] 网站前端地址: http://localhost:8080/
echo [启动] 联系表单页面: http://localhost:8080/pages/contact.html
echo [启动] API连接: http://localhost:3000/api
echo [启动] 按Ctrl+C停止服务器
echo.

:: 启动HTTP服务器
npx serve -p 8080 