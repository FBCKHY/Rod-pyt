@echo off
chcp 65001 >nul
title 启动后端API服务 (内部)
color 0D

echo.
echo [检查] 正在检查后端环境...

:: 设置项目路径
set "BACKEND_PATH=%~dp0..\..\..\backend"

:: 检查backend目录
if not exist "%BACKEND_PATH%" (
    echo [错误] 找不到backend目录！
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

:: 检查数据库服务
echo.
echo [检查] 正在检查数据库服务状态...

:: 检查PostgreSQL服务
echo [检查] PostgreSQL服务状态...
sc query postgresql-x64-15 >nul 2>&1
if errorlevel 1 (
    echo [警告] PostgreSQL服务未找到，可能未安装
) else (
    sc query postgresql-x64-15 | find "RUNNING" >nul 2>&1
    if errorlevel 1 (
        echo [警告] PostgreSQL服务已安装但未运行
        echo [信息] 请以管理员身份运行: net start postgresql-x64-15
    ) else (
        echo [成功] PostgreSQL服务正在运行
    )
)

:: 检查PostgreSQL端口
netstat -an | findstr ":5432" >nul 2>&1
if errorlevel 1 (
    echo [警告] PostgreSQL端口5432未监听
) else (
    echo [成功] PostgreSQL端口5432正在监听
)

:: 检查Redis/Memurai进程
echo [检查] Redis/Memurai服务状态...
tasklist | findstr "memurai.exe" >nul 2>&1
if errorlevel 1 (
    echo [启动] 正在启动Redis/Memurai服务...
    if exist "C:\Program Files\Memurai\memurai.exe" (
        start "" /min "C:\Program Files\Memurai\memurai.exe"
        timeout /t 3 /nobreak >nul
        echo [成功] Redis/Memurai已启动
    ) else (
        echo [警告] Redis/Memurai未找到，但服务可以在没有缓存的情况下运行
    )
) else (
    echo [成功] Redis/Memurai服务正在运行
)

:: 检查Redis端口
netstat -an | findstr ":6379" >nul 2>&1
if errorlevel 1 (
    echo [信息] Redis端口6379未监听（可选服务）
) else (
    echo [成功] Redis端口6379正在监听
)

:: 切换到backend目录
cd /d "%BACKEND_PATH%"

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

:: 检查环境配置文件
if exist ".env" (
    echo [成功] 环境配置文件已找到
) else (
    if exist "config/development.env" (
        echo [配置] 正在创建.env文件...
        copy "config\development.env" ".env" >nul
        echo [成功] .env文件已创建
    ) else (
        echo [警告] 环境配置文件未找到
    )
)

:: 检查Prisma客户端
echo [检查] 检查数据库客户端...
if not exist "node_modules\.pnpm\@prisma+client@*" (
    echo [生成] 正在生成Prisma客户端...
    pnpm db:generate
    if errorlevel 1 (
        echo [警告] Prisma客户端生成失败，但服务器可以启动
    ) else (
        echo [成功] Prisma客户端已生成
    )
)

echo.
echo [启动] API服务地址: http://localhost:3001/api/
echo [启动] 健康检查: http://localhost:3001/api/health
echo [启动] API文档: http://localhost:3001/api/docs
echo [启动] 按Ctrl+C停止服务器
echo.
echo [提示] 🚀 准备部署到阿里云？
echo [提示] 📖 查看部署指南: backend\docs\阿里云部署指南.md
echo [提示] 📊 配置对比表: backend\docs\配置对比表.md
echo [提示] ⚙️ 生产配置模板: backend\config\production.env
echo.

:: 启动服务器
pnpm run dev 