@echo off
chcp 65001 >nul
title 检查配置依赖 (内部)
color 0E

echo.
echo [检查] 正在检查系统配置和依赖...

:: 设置项目路径
set "ADMIN_PATH=%~dp0..\..\..\admin"
set "BACKEND_PATH=%~dp0..\..\..\backend"

echo [路径] Admin目录: %ADMIN_PATH%
echo [路径] Backend目录: %BACKEND_PATH%
echo.

:: 检查目录结构
echo ═══════════════ 目录结构检查 ═══════════════
if exist "%ADMIN_PATH%" (
    echo [成功] Admin目录存在
) else (
    echo [错误] Admin目录不存在
)

if exist "%BACKEND_PATH%" (
    echo [成功] Backend目录存在
) else (
    echo [错误] Backend目录不存在
)

:: 检查Node.js
echo.
echo ═══════════════ 环境检查 ═══════════════
echo [检查] Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js未安装
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [成功] Node.js版本: %%i
)

:: 检查pnpm
echo [检查] pnpm包管理器...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [错误] pnpm未安装
) else (
    for /f "tokens=*" %%i in ('pnpm --version') do echo [成功] pnpm版本: %%i
)

:: 检查数据库服务
echo.
echo ═══════════════ 数据库服务检查 ═══════════════
echo [检查] PostgreSQL服务状态...
sc query postgresql-x64-15 >nul 2>&1
if errorlevel 1 (
    echo [警告] PostgreSQL服务未安装
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

echo [检查] Redis/Memurai服务状态...
tasklist | findstr "memurai.exe" >nul 2>&1
if errorlevel 1 (
    if exist "C:\Program Files\Memurai\memurai.exe" (
        echo [信息] Redis/Memurai已安装但未运行
        echo [建议] 可自动启动Redis
    ) else (
        echo [信息] Redis/Memurai未安装（可选服务）
        echo [建议] 运行: winget install Memurai.MemuraiDeveloper
    )
) else (
    echo [成功] Redis/Memurai服务正在运行
)

:: 检查Redis端口
netstat -an | findstr ":6379" >nul 2>&1
if errorlevel 1 (
    echo [信息] Redis端口6379未监听（可选）
) else (
    echo [成功] Redis端口6379正在监听
)

:: 检查前端项目文件
echo.
echo ═══════════════ 前端项目检查 ═══════════════
cd /d "%ADMIN_PATH%"
if exist "package.json" (
    echo [成功] package.json存在
) else (
    echo [错误] package.json不存在
)

if exist "node_modules" (
    echo [成功] node_modules目录存在
) else (
    echo [警告] node_modules目录不存在，需要运行pnpm install
)

:: 检查前端环境配置文件
if exist ".env" (
    echo [成功] .env环境配置文件存在
    echo [配置] 端口和API配置:
    findstr "VITE_PORT\|VITE_API_URL" .env 2>nul
) else (
    echo [警告] .env环境配置文件不存在
)

if exist ".env.development" (
    echo [成功] .env.development存在
) else (
    echo [警告] .env.development不存在
)

if exist ".env.production" (
    echo [成功] .env.production存在
) else (
    echo [警告] .env.production不存在
)

:: 检查后端项目文件
echo.
echo ═══════════════ 后端项目检查 ═══════════════
cd /d "%BACKEND_PATH%"
if exist "package.json" (
    echo [成功] backend/package.json存在
) else (
    echo [错误] backend/package.json不存在
)

if exist "node_modules" (
    echo [成功] backend/node_modules目录存在
) else (
    echo [警告] backend/node_modules目录不存在，需要运行pnpm install
)

if exist ".env" (
    echo [成功] backend/.env环境配置文件存在
) else (
    if exist "config/development.env" (
        echo [信息] backend/config/development.env存在，可自动创建.env
    ) else (
        echo [警告] backend环境配置文件不存在
    )
)

if exist "prisma/schema.prisma" (
    echo [成功] Prisma数据库模型文件存在
) else (
    echo [错误] Prisma数据库模型文件不存在
)

:: 检查端口占用
echo.
echo ═══════════════ 端口占用检查 ═══════════════
echo [检查] 前端端口3006占用情况...
netstat -ano | findstr :3006 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3006未被占用
) else (
    echo [警告] 端口3006已被占用
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3006') do echo [进程] 前端PID: %%i
)

echo [检查] 后端端口3001占用情况...
netstat -ano | findstr :3001 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3001未被占用
) else (
    echo [警告] 端口3001已被占用
    for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001') do echo [进程] 后端PID: %%i
)

echo.
echo ═══════════════ 总结 ═══════════════
echo [完成] 配置依赖检查完成
echo [信息] 红色[错误]需要解决，黄色[警告]建议处理
echo [建议] 运行完整启动脚本可自动处理部分问题 