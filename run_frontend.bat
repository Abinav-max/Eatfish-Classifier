@echo off
title EatFish AI - Frontend Dev Server
cd /d "%~dp0frontend"
echo ==============================================
echo   Starting EatFish Mobile Frontend Server
echo ==============================================
npm run dev -- --host 0.0.0.0 --port 5173
pause
