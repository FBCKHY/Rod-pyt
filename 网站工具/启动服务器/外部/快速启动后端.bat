@echo off
chcp 65001 >nul
title 快速启动订阅系统后端API (外部)
color 0D

echo.
echo ╔══════════════════════════════════════╗
echo ║        订阅系统 后端API             ║
echo ║             快速启动工具             ║
echo ╚══════════════════════════════════════╝
echo.

:: 切换到backend目录
cd /d "%~dp0..\..\..\backend"

:: 检查目录是否正确
if not exist "package.json" (
    echo [错误] 未找到backend项目文件！请检查路径是否正确
    echo [路径] 当前目录: %CD%
    echo.
    pause
    exit /b 1
)

:: 快速检查数据库服务状态
echo [检查] 快速检查数据库服务...

:: 检查MySQL端口
netstat -an | findstr ":3306" >nul 2>&1
if errorlevel 1 (
    echo [警告] MySQL端口3306未监听，请确保MySQL服务已启动
    echo [建议] 以管理员身份运行: net start mysql
) else (
    echo [成功] MySQL正在运行
)

:: 检查Redis是否需要（可选）
tasklist | findstr "redis" >nul 2>&1
if errorlevel 1 (
    echo [信息] Redis未运行（可选服务）
) else (
    echo [成功] Redis正在运行
)

:: 检查.env文件
if not exist ".env" (
    if exist ".env.example" (
        echo [配置] 正在创建.env文件...
        copy ".env.example" ".env" >nul
        echo [成功] .env文件已创建
    )
)

echo [信息] 项目目录: %CD%
echo [信息] API服务地址: http://localhost:3000/api/
echo [信息] 健康检查: http://localhost:3000/health
echo [信息] API文档: http://localhost:3000/api-docs
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