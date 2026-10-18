@echo off
setlocal EnableExtensions
title Social Travel Booking - All Services Launcher

rem ------------------------------------------------------------
rem 1. Move to repository root
rem ------------------------------------------------------------
cd /d "%~dp0"

echo ============================================================
echo   SOCIAL TRAVEL BOOKING - START ALL SERVICES
echo ============================================================
echo.

rem ------------------------------------------------------------
rem 2. Check & Start Docker Database (PostgreSQL)
rem ------------------------------------------------------------
echo [1/5] Checking Docker & PostgreSQL...
where docker >nul 2>nul
if %errorlevel% equ 0 (
    if exist infra\docker-compose.yml (
        echo   - Starting PostgreSQL container (stb_postgres)...
        docker compose -f infra\docker-compose.yml up -d
        if %errorlevel% equ 0 (
            echo   [OK] PostgreSQL container is up and running.
        ) else (
            echo   [WARN] Could not start Docker container. Ensure Docker Desktop is running.
        )
    )
) else (
    echo   [INFO] Docker not found. Skipping container launch.
)
echo.

rem ------------------------------------------------------------
rem 3. Start Laravel API (Port 8000)
rem ------------------------------------------------------------
echo [2/5] Starting Laravel API Server (http://localhost:8000)...
start "STB - Laravel API (Port 8000)" cmd /k "title STB - Laravel API && cd /d "%~dp0apps\api" && php artisan serve --port=8000"

rem ------------------------------------------------------------
rem 4. Start Laravel Reverb WebSocket Server (Port 8080)
rem ------------------------------------------------------------
echo [3/5] Starting Laravel Reverb WebSocket (ws://localhost:8080)...
start "STB - Reverb WebSocket (Port 8080)" cmd /k "title STB - Reverb WebSocket && cd /d "%~dp0apps\api" && php artisan reverb:start --debug"

rem ------------------------------------------------------------
rem 5. Start Web Portal (Vite + React)
rem ------------------------------------------------------------
echo [4/5] Starting Web Portal (http://localhost:5173)...
start "STB - Web Portal (Port 5173)" cmd /k "title STB - Web Portal && cd /d "%~dp0" && pnpm dev:web"

rem ------------------------------------------------------------
rem 6. Start Mobile App (Expo)
rem ------------------------------------------------------------
echo [5/5] Starting Mobile App (Expo)...
start "STB - Mobile App (Expo)" cmd /k "title STB - Mobile App && cd /d "%~dp0" && pnpm dev:mobile"

rem ------------------------------------------------------------
rem 7. Summary & Instructions
rem ------------------------------------------------------------
echo.
echo ============================================================
echo   ALL SERVICES HAVE BEEN LAUNCHED IN SEPARATE WINDOWS!
echo ============================================================
echo   - Backend API:       http://localhost:8000/api/v1
echo   - Reverb WebSocket:  ws://localhost:8080
echo   - Web Portal:        http://localhost:5173
echo   - Mobile App (Expo): Open Expo Go on your phone
echo ============================================================
echo   De dung cac dich vu:
echo   - Dong truc tiep tung cua so Terminal tuong ung, hoac
echo   - Chay file stop.bat
echo ============================================================
echo.
pause
