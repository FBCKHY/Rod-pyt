@echo off
chcp 65001 >nul
title 快速启动网站前端 (外部)
color 0C

echo.
echo ╔══════════════════════════════════════╗
echo ║         快速启动网站前端             ║
echo ║      (高端厨电企业官网)             ║
echo ╚══════════════════════════════════════╝
echo.

:: 设置项目路径
set "WEBSITE_PATH=%~dp0..\..\..\web Site\web PC"

echo [检查] 正在检查网站前端环境...
echo [路径] 网站目录: %WEBSITE_PATH%

:: 检查网站目录
if not exist "%WEBSITE_PATH%" (
    echo [错误] 找不到网站前端目录！
    echo [路径] 检查路径: %WEBSITE_PATH%
    pause
    exit /b 1
)

:: 切换到网站目录
cd /d "%WEBSITE_PATH%"

:: 检查主要文件
if not exist "index.html" (
    echo [错误] 未找到网站主页文件！
    pause
    exit /b 1
)

:: 检查Node.js
echo [检查] Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] Node.js未安装！请先安装Node.js 18.20.4+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [成功] Node.js: %NODE_VERSION%

echo.
echo ╔══════════════════════════════════════╗
echo ║             启动信息                 ║
echo ╚══════════════════════════════════════╝
echo.
echo [启动] 网站前端地址: http://localhost:8080/
echo [启动] 联系表单页面: http://localhost:8080/pages/contact.html
echo [启动] 关于我们页面: http://localhost:8080/pages/about.html
echo [启动] 产品中心页面: http://localhost:8080/pages/products.html
echo [启动] API连接地址: http://localhost:3000/api
echo [启动] 按Ctrl+C停止服务器
echo.
echo [提示] 联系表单已集成订阅系统API
echo [提示] 表单提交会自动添加到订阅列表
echo.

:: 启动HTTP服务器
echo [启动] 正在启动HTTP服务器...
npx serve -p 8080 --yes

pause 