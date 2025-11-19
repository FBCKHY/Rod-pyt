@echo off
chcp 65001 >nul
title 快速启动订阅系统后端API (内部)
color 0D

echo.
echo [启动] 快速启动订阅系统后端API服务...

:: 切换到backend目录
cd /d "%~dp0..\..\..\backend"

:: 检查目录是否正确
if not exist "package.json" (
    echo [错误] 未找到backend项目文件！请检查路径
    exit /b 1
)

:: 快速检查数据库服务状态
echo [检查] 快速检查数据库服务...

:: 检查MySQL端口
netstat -an | findstr ":3306" >nul 2>&1
if errorlevel 1 (
    echo [警告] MySQL端口3306未监听，请确保MySQL服务已启动
    echo [信息] 以管理员身份运行: net start mysql
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

echo.
echo [启动] API服务地址: http://localhost:3000/api/
echo [启动] 健康检查: http://localhost:3000/health
echo [启动] API文档: http://localhost:3000/api-docs
echo [启动] 按Ctrl+C停止服务器
echo.

:: 启动开发服务器
npm run dev 