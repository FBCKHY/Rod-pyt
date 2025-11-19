@echo off
chcp 65001 >nul
title 检查配置依赖 (外部)
color 0E

echo.
echo ╔══════════════════════════════════════╗
echo ║           系统配置依赖检查            ║
echo ║       Art Design Pro 后台管理        ║
echo ╚══════════════════════════════════════╝
echo.

:: 设置项目路径
set "ADMIN_PATH=%~dp0..\..\..\admin"

echo [路径] Admin目录: %ADMIN_PATH%
echo.

echo ═══════════════ 目录检查 ═══════════════
:: 检查admin目录
if exist "%ADMIN_PATH%" (
    echo [✓] Admin目录存在
) else (
    echo [✗] Admin目录不存在
    echo [错误] 请检查项目路径配置
    pause
    exit /b 1
)

echo.
echo ═══════════════ 环境检查 ═══════════════
:: 检查Node.js
echo [检查] Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [✗] Node.js未安装
    echo [建议] 请访问 https://nodejs.org/ 下载安装Node.js 18.20.4+
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [✓] Node.js版本: %%i
)

:: 检查pnpm
echo [检查] pnpm包管理器...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [✗] pnpm未安装
    echo [建议] 运行: npm install -g pnpm
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do echo [✓] pnpm版本: %%i
)

echo.
echo ═══════════════ 项目文件检查 ═══════════════
:: 检查项目文件
cd /d "%ADMIN_PATH%"
if exist "package.json" (
    echo [✓] package.json存在
) else (
    echo [✗] package.json不存在
)

if exist "vite.config.ts" (
    echo [✓] vite.config.ts存在
) else (
    echo [✗] vite.config.ts不存在
)

if exist "tsconfig.json" (
    echo [✓] tsconfig.json存在
) else (
    echo [✗] tsconfig.json不存在
)

echo.
echo ═══════════════ 依赖检查 ═══════════════
if exist "node_modules" (
    echo [✓] node_modules目录存在
    echo [信息] 依赖已安装
) else (
    echo [✗] node_modules目录不存在
    echo [建议] 需要运行: pnpm install
)

if exist "pnpm-lock.yaml" (
    echo [✓] pnpm-lock.yaml存在
) else (
    echo [✗] pnpm-lock.yaml不存在
)

echo.
echo ═══════════════ 环境配置检查 ═══════════════
:: 检查环境配置文件
if exist ".env" (
    echo [✓] .env环境配置文件存在
    echo.
    echo [配置信息] .env文件内容:
    findstr "VITE_" .env 2>nul
) else (
    echo [✗] .env环境配置文件不存在
)

if exist ".env.development" (
    echo [✓] .env.development存在
) else (
    echo [✗] .env.development不存在
)

if exist ".env.production" (
    echo [✓] .env.production存在
) else (
    echo [✗] .env.production不存在
)

echo.
echo ═══════════════ 端口检查 ═══════════════
:: 检查端口占用
echo [检查] 端口3006占用情况...
netstat -ano | findstr :3006 >nul 2>&1
if errorlevel 1 (
    echo [✓] 端口3006未被占用，可以正常启动
) else (
    echo [!] 端口3006已被占用
    echo [进程信息] 当前占用进程:
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3006') do echo [PID] %%i
    echo [建议] 先停止占用进程或修改端口配置
)

echo.
echo ╔══════════════════════════════════════╗
echo ║             检查完成！               ║
echo ╚══════════════════════════════════════╝
echo.
echo [总结] 配置依赖检查完成
echo [建议] 如有红色✗标记，请先解决相关问题
echo.
pause 