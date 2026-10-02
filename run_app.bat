@echo off
title EatFish AI Launcher
cd /d "%~dp0"
echo ==============================================
echo       Launching EatFish AI (Full Stack)
echo ==============================================
echo 1. Starting Backend...
start "EatFish Backend" "%~dp0run_backend.bat"

echo 2. Starting Frontend...
start "EatFish Frontend" "%~dp0run_frontend.bat"

echo.
echo Both servers are starting up!
echo - Web App: http://localhost:5173
echo - Mobile on Wi-Fi: http://10.249.164.1:5173
echo.
timeout /t 5
