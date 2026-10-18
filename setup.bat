@echo off
setlocal EnableExtensions
title Social Travel Booking - Monorepo Setup

rem ------------------------------------------------------------
rem 1. Move to the repository root
rem ------------------------------------------------------------
cd /d "%~dp0"

rem ------------------------------------------------------------
rem 2. Check required tools
rem ------------------------------------------------------------
echo ============================================================
echo  Social Travel Booking - Monorepo setup
echo  Target folder: %CD%
echo ============================================================

set "MISSING="

call :need node "Node.js 20 or newer"
call :need pnpm "pnpm (Corepack)"
call :need git "Git"
call :need php "PHP 8.2 or newer"
call :need composer "Composer"
if defined MISSING (
    echo.
    echo [ERROR] Missing required tools:%MISSING%
    goto :eof
)

rem ------------------------------------------------------------
rem 3. Verify Node version
rem ------------------------------------------------------------
for /f "tokens=1 delims=v." %%a in ('node -v') do set NODE_MAJOR=%%a
if %NODE_MAJOR% LSS 20 (
    echo [WARN] Detected Node version %NODE_MAJOR%. Please install Node 20 or newer.
    goto :eof
)

rem ------------------------------------------------------------
rem 4. Enable Corepack and install pnpm
rem ------------------------------------------------------------
corepack enable
corepack prepare pnpm@latest --activate

rem ------------------------------------------------------------
rem 5. Install root and workspace dependencies with pnpm
rem ------------------------------------------------------------
echo [2/6] Installing dependencies across monorepo with pnpm...
call pnpm install
if errorlevel 1 (
    echo [ERROR] pnpm install failed.
    goto :eof
)

rem ------------------------------------------------------------
rem 6. (Optional) Install API dependencies if API folder exists
rem ------------------------------------------------------------
if exist apps\api (
    echo [3/6] Installing Laravel API dependencies...
    pushd apps\api
    if not exist .env (
        if exist .env.example copy .env.example .env
    )
    call composer install
    if errorlevel 1 (
        echo [ERROR] Laravel composer install failed.
        popd
        goto :eof
    )
    php artisan key:generate --force
    popd
) else (
    echo [3/6] No API folder detected, skipping.
)

rem ------------------------------------------------------------
rem 7. Setup Git hooks (Husky)
rem ------------------------------------------------------------
echo [4/6] Setting up Git hooks (Husky)...
call pnpm exec husky

rem ------------------------------------------------------------
rem 8. Verify Docker (optional, needed for PostgreSQL)
rem ------------------------------------------------------------
echo [5/6] Checking Docker...
where docker >nul 2>nul
if errorlevel 1 (
    echo [WARN] Docker not found - you will need it later for PostgreSQL.
) else (
    echo [OK] Docker is available.
)

rem ------------------------------------------------------------
rem 9. Finish
rem ------------------------------------------------------------
echo.
echo ============================================================
echo  Setup completed successfully!
echo  You can now run the following commands:
echo    - pnpm dev:mobile    (Expo Mobile)
echo    - pnpm dev:web       (Vite Web)
echo    - pnpm dev:api       (Laravel API)
echo ============================================================

exit /b 0

rem ------------------------------------------------------------
rem Helper function to check required tools
rem ------------------------------------------------------------
:need
set "TOOL=%~1"
set "DESC=%~2"
where %TOOL% >nul 2>nul
if errorlevel 1 (
    set "MISSING=%MISSING% %TOOL%"
    echo [MISSING] %DESC% (%TOOL%) not found.
) else (
    echo [OK] %DESC% (%TOOL%) found.
)
exit /b 0
