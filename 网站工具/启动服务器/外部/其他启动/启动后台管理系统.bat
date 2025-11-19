@echo off
chcp 65001 >nul
title Art Design Pro 后台管理系统启动器 (外部)
color 0A

echo.
echo ╔══════════════════════════════════════╗
echo ║        Art Design Pro 后台管理       ║
echo ║            完整启动器               ║
echo ╚══════════════════════════════════════╝
echo.

:: 设置项目路径
set "ADMIN_PATH=%~dp0..\..\..\admin"

echo [信息] Admin目录: %ADMIN_PATH%
echo.

:: 检查admin目录
if not exist "%ADMIN_PATH%" (
    echo [错误] 找不到admin目录！
    echo [错误] 请确保脚本位于正确的项目目录中
    echo.
    pause
    exit /b 1
)

:: 检查Node.js
echo [检查] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js未安装或未添加到PATH中！
    echo [错误] 请访问 https://nodejs.org/ 下载并安装Node.js
    echo [错误] 要求版本: Node.js 18.20.4 及以上
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [成功] Node.js已安装: %NODE_VERSION%

:: 检查pnpm
echo [检查] 检查pnpm包管理器...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [警告] pnpm未安装，正在安装pnpm...
    npm install -g pnpm
    if errorlevel 1 (
        echo [错误] pnpm安装失败！
        echo [信息] 请手动运行: npm install -g pnpm
        echo.
        pause
        exit /b 1
    )
    echo [成功] pnpm安装完成！
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do set PNPM_VERSION=%%i
    echo [成功] pnpm已安装: %PNPM_VERSION%
)

:: 切换到admin目录
echo.
echo [信息] 切换到后台管理目录...
cd /d "%ADMIN_PATH%"
if errorlevel 1 (
    echo [错误] 无法切换到admin目录！
    pause
    exit /b 1
)

:: 检查依赖
echo [检查] 检查项目依赖...
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖包...
    echo [信息] 这可能需要几分钟时间，请耐心等待...
    echo.
    
    pnpm install
    if errorlevel 1 (
        echo.
        echo [警告] 标准安装失败，尝试忽略scripts安装...
        pnpm install --ignore-scripts
        if errorlevel 1 (
            echo [错误] 依赖安装失败！
            echo [信息] 请检查网络连接或手动运行: pnpm install
            echo.
            pause
            exit /b 1
        )
    )
    echo.
    echo [成功] 依赖安装完成！
) else (
    echo [成功] 依赖已安装
)

:: 显示环境配置信息
echo.
echo ╔══════════════════════════════════════╗
echo ║               启动信息               ║
echo ╚══════════════════════════════════════╝
if exist ".env" (
    echo [配置] 环境配置文件已找到
    findstr "VITE_PORT" .env 2>nul
    findstr "VITE_API_URL" .env 2>nul
) else (
    echo [警告] 环境配置文件(.env)未找到
)

echo.
echo [信息] 启动地址: http://localhost:3006/
echo [信息] Vue DevTools: http://localhost:3006/__devtools__/
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ╔══════════════════════════════════════╗
echo ║             正在启动...              ║
echo ╚══════════════════════════════════════╝

:: 启动开发服务器
echo [启动] 正在启动Art Design Pro后台管理系统...
echo [启动] 服务器启动后会自动打开浏览器
echo.

pnpm dev

:: 如果到达这里说明服务器已停止
echo.
echo [信息] 服务器已停止
echo.
pause 