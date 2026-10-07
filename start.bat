@echo off
chcp 65001 >nul
title Cosmic Black Hole Lucky Draw Launcher
cls
echo ========================================================
echo   COSMIC BLACK HOLE LUCKY DRAW - 1-CLICK LAUNCHER
echo ========================================================
echo.
echo Launching Cosmic Black Hole Gala Stage...
echo.

cd /d "%~dp0"

if not exist node_modules (
    echo [1/2] First time setup: Installing dependencies...
    call npm.cmd install
)

echo [2/2] Starting server at http://localhost:3000...
start "" "http://localhost:3000"
call npm.cmd run dev
