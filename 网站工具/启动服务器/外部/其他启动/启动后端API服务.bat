@echo off
chcp 65001 >nul
title Art Design Pro 后端API服务启动器 (外部)
color 0D

echo.
echo ╔══════════════════════════════════════╗
echo ║        Art Design Pro 后端API       ║
echo ║            完整启动器               ║
echo ╚══════════════════════════════════════╝
echo.

:: 设置项目路径
set "BACKEND_PATH=%~dp0..\..\..\backend"

echo [信息] Backend目录: %BACKEND_PATH%
echo.

:: 检查backend目录
if not exist "%BACKEND_PATH%" (
    echo [错误] 找不到backend目录！
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

:: 切换到backend目录
echo.
echo [信息] 切换到后端API目录...
cd /d "%BACKEND_PATH%"
if errorlevel 1 (
    echo [错误] 无法切换到backend目录！
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

:: 检查数据库服务
echo.
echo [检查] 检查数据库服务状态...

:: 检查PostgreSQL服务
echo [检查] PostgreSQL服务状态...
sc query postgresql-x64-15 >nul 2>&1
if errorlevel 1 (
    echo [警告] PostgreSQL服务未找到，可能未安装
    echo [建议] 运行: winget install PostgreSQL.PostgreSQL.15
) else (
    sc query postgresql-x64-15 | find "RUNNING" >nul 2>&1
    if errorlevel 1 (
        echo [警告] PostgreSQL服务已安装但未运行
        echo [建议] 以管理员身份运行: net start postgresql-x64-15
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

:: 检查环境配置
echo.
echo [检查] 检查环境配置...
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

:: 检查数据库文件
if exist "prisma/schema.prisma" (
    echo [成功] 数据库模型文件已找到
) else (
    echo [警告] 数据库模型文件未找到
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

:: 显示启动信息
echo.
echo ╔══════════════════════════════════════╗
echo ║               启动信息               ║
echo ╚══════════════════════════════════════╝
echo [信息] API服务地址: http://localhost:3001/api/
echo [信息] 健康检查: http://localhost:3001/api/health
echo [信息] API根路径: http://localhost:3001/
echo [信息] API文档: http://localhost:3001/api/docs
echo [信息] 按 Ctrl+C 停止服务器
echo.
echo ╔══════════════════════════════════════╗
echo ║             正在启动...              ║
echo ╚══════════════════════════════════════╝

:: 启动开发服务器
echo [启动] 正在启动Art Design Pro后端API服务...
echo.

pnpm run dev

:: 如果到达这里说明服务器已停止
echo.
echo [信息] 服务器已停止
echo.
pause 