@echo off
chcp 65001 >nul
title 启动后台管理系统 (内部)
color 0A

echo.
echo [检查] 正在检查环境...

:: 设置项目路径
set "ADMIN_PATH=%~dp0..\..\..\admin"

:: 检查admin目录
if not exist "%ADMIN_PATH%" (
    echo [错误] 找不到admin目录！
    exit /b 1
)

:: 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js未安装！请先安装Node.js 18.20.4+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [成功] Node.js: %NODE_VERSION%

:: 检查pnpm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [安装] 正在安装pnpm...
    npm install -g pnpm
    if errorlevel 1 (
        echo [错误] pnpm安装失败！
        exit /b 1
    )
)
for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
echo [成功] pnpm: %PNPM_VERSION%

:: 切换到admin目录
cd /d "%ADMIN_PATH%"

:: 检查依赖
if not exist "node_modules" (
    echo [安装] 正在安装依赖包...
    pnpm install
    if errorlevel 1 (
        echo [警告] 标准安装失败，尝试忽略scripts...
        pnpm install --ignore-scripts
        if errorlevel 1 (
            echo [错误] 依赖安装失败！
            exit /b 1
        )
    )
    echo [成功] 依赖安装完成
) else (
    echo [成功] 依赖已安装
)

:: 显示配置信息
if exist ".env" (
    echo [配置] 环境文件已找到
) else (
    echo [警告] 环境文件(.env)未找到
)

echo.
echo [启动] 启动地址: http://localhost:3006/
echo [启动] Vue DevTools: http://localhost:3006/__devtools__/
echo [启动] 按Ctrl+C停止服务器
echo.

:: 启动服务器
pnpm dev 