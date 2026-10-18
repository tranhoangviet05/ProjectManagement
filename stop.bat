@echo off
setlocal EnableExtensions
title Social Travel Booking - Stop All Services

cd /d "%~dp0"

echo ============================================================
echo   STOPPING ALL SOCIAL TRAVEL BOOKING SERVICES
echo ============================================================
echo.

rem 1. Stop Docker Container (PostgreSQL)
echo [1/3] Stopping Docker PostgreSQL container (if running)...
where docker >nul 2>nul
if %errorlevel% equ 0 (
    if exist infra\docker-compose.yml (
        docker compose -f infra\docker-compose.yml stop
    )
)

rem 2. Kill Windows CMD windows created with titles
echo [2/3] Closing service terminal windows...
taskkill /F /FI "WINDOWTITLE eq STB - Laravel API*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq STB - Reverb WebSocket*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq STB - Web Portal*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq STB - Mobile App*" >nul 2>&1

rem 3. Finish
echo [3/3] Done.
echo.
echo ============================================================
echo   ALL SERVICES HAVE BEEN STOPPED!
echo ============================================================
echo.
pause
