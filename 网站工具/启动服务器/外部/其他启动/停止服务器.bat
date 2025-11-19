@echo off
chcp 65001 >nul
title 停止服务器 (外部)
color 0C

echo.
echo ╔══════════════════════════════════════╗
echo ║            停止服务器工具             ║
echo ║       Art Design Pro 全栈服务        ║
echo ╚══════════════════════════════════════╝
echo.

echo [信息] 正在查找运行中的服务...
echo.

:: 查找并终止占用3006端口的进程（前端）
echo [停止] 正在查找端口3006的进程（前端管理系统）...
set "FOUND_FRONTEND=false"
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3006') do (
    set "FOUND_FRONTEND=true"
    echo [发现] 前端进程ID: %%i
    taskkill /PID %%i /F >nul 2>&1
    if errorlevel 0 (
        echo [成功] 已成功停止前端进程 %%i
    ) else (
        echo [警告] 无法停止前端进程 %%i，可能已经停止
    )
)

if "%FOUND_FRONTEND%"=="false" (
    echo [信息] 未发现占用端口3006的前端进程
)

:: 查找并终止占用3001端口的进程（后端API）
echo.
echo [停止] 正在查找端口3001的进程（后端API服务）...
set "FOUND_BACKEND=false"
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3001') do (
    set "FOUND_BACKEND=true"
    echo [发现] 后端API进程ID: %%i
    taskkill /PID %%i /F >nul 2>&1
    if errorlevel 0 (
        echo [成功] 已成功停止后端API进程 %%i
    ) else (
        echo [警告] 无法停止后端API进程 %%i，可能已经停止
    )
)

if "%FOUND_BACKEND%"=="false" (
    echo [信息] 未发现占用端口3001的后端API进程
)

echo.
echo [检查] 验证端口状态...

:: 检查前端端口
netstat -ano | findstr :3006 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3006已释放（前端管理系统已停止）
) else (
    echo [警告] 端口3006仍被占用，请手动检查
    echo [信息] 当前占用端口3006的进程:
    netstat -ano | findstr :3006
)

:: 检查后端端口
netstat -ano | findstr :3001 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3001已释放（后端API服务已停止）
) else (
    echo [警告] 端口3001仍被占用，请手动检查
    echo [信息] 当前占用端口3001的进程:
    netstat -ano | findstr :3001
)

echo.
echo ╔══════════════════════════════════════╗
echo ║             操作完成！               ║
echo ╚══════════════════════════════════════╝
echo.
pause 