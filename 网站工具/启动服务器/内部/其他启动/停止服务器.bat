@echo off
chcp 65001 >nul
title 停止服务器 (内部)
color 0C

echo.
echo [停止] 正在查找运行中的服务...

:: 查找并终止占用3006端口的进程（前端）
echo [停止] 正在查找端口3006的进程（前端）...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3006') do (
    echo [发现] 前端进程ID: %%i
    taskkill /PID %%i /F >nul 2>&1
    if errorlevel 0 (
        echo [成功] 已停止前端进程 %%i
    ) else (
        echo [警告] 无法停止前端进程 %%i
    )
)

:: 查找并终止占用3000端口的进程（后端API）
echo [停止] 正在查找端口3000的进程（后端API）...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000') do (
    echo [发现] 后端API进程ID: %%i
    taskkill /PID %%i /F >nul 2>&1
    if errorlevel 0 (
        echo [成功] 已停止后端API进程 %%i
    ) else (
        echo [警告] 无法停止后端API进程 %%i
    )
)

:: 查找并终止占用8080端口的进程（网站前端）
echo [停止] 正在查找端口8080的进程（网站前端）...
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :8080') do (
    echo [发现] 网站前端进程ID: %%i
    taskkill /PID %%i /F >nul 2>&1
    if errorlevel 0 (
        echo [成功] 已停止网站前端进程 %%i
    ) else (
        echo [警告] 无法停止网站前端进程 %%i
    )
)

:: 检查端口状态
echo.
echo [检查] 验证服务停止状态...

:: 检查前端端口
netstat -ano | findstr :3006 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3006已释放（前端已停止）
) else (
    echo [警告] 端口3006仍被占用
)

:: 检查后端端口
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口3000已释放（后端API已停止）
) else (
    echo [警告] 端口3000仍被占用
)

:: 检查网站前端端口
netstat -ano | findstr :8080 >nul 2>&1
if errorlevel 1 (
    echo [成功] 端口8080已释放（网站前端已停止）
) else (
    echo [警告] 端口8080仍被占用
)

echo [完成] 服务器停止操作完成 