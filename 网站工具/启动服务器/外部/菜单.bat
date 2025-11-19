@echo off
chcp 65001 >nul
title Art Design Pro 后台管理菜单 (外部)
color 0A

:MENU
cls
echo.
echo ╔══════════════════════════════════════╗
echo ║    Art Design Pro 后台管理菜单       ║
echo ║          (独立终端版)               ║
echo ╚══════════════════════════════════════╝
echo.
echo   [1] 启动后台管理系统 (完整检查)
echo   [2] 启动后端API服务 (完整检查)
echo   [3] 启动网站前端 (企业官网)
echo   [4] 停止服务器
echo   [5] 检查配置依赖
echo   [6] 退出
echo.
set /p choice=请选择操作 (1-6): 

if "%choice%"=="1" goto START_FULL
if "%choice%"=="2" goto START_BACKEND
if "%choice%"=="3" goto START_WEBSITE
if "%choice%"=="4" goto STOP_SERVER
if "%choice%"=="5" goto CHECK_CONFIG
if "%choice%"=="6" goto EXIT
echo [ERROR] 无效选择，请重新输入
pause
goto MENU

:START_FULL
echo.
echo [INFO] 正在启动完整检查模式...
call "%~dp0启动后台管理系统.bat"
pause
goto MENU

:START_BACKEND
echo.
echo [INFO] 正在启动后端API服务(完整检查)...
call "%~dp0其他启动\启动后端API服务.bat"
pause
goto MENU

:START_WEBSITE
echo.
echo [INFO] 正在启动网站前端(企业官网)...
call "%~dp0快速启动网站前端.bat"
pause
goto MENU

:STOP_SERVER
echo.
echo [INFO] 正在停止服务器...
call "%~dp0停止服务器.bat"
pause
goto MENU

:CHECK_CONFIG
echo.
echo [INFO] 正在检查配置依赖...
call "%~dp0检查配置依赖.bat"
pause
goto MENU

:EXIT
echo.
echo [INFO] 感谢使用 Art Design Pro 后台管理系统！
pause
exit 