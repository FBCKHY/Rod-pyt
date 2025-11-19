@echo off
echo ========================================
echo PostgreSQL 密码重置工具
echo ========================================
echo.
echo 正在重置postgres用户密码为: 101011
echo.

"C:\Program Files\PostgreSQL\15\bin\psql.exe" -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD '101011';"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 密码重置成功！
    echo 新密码: 101011
    echo ========================================
) else (
    echo.
    echo ========================================
    echo 密码重置失败！
    echo 请检查是否有权限或PostgreSQL服务是否运行
    echo ========================================
)

echo.
pause
