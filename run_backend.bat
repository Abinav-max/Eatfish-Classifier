@echo off
title EatFish AI - Backend Server
cd /d "%~dp0"
echo ==============================================
echo   Starting EatFish AI Classification Backend
echo ==============================================
"C:\Users\Asus\AppData\Local\Programs\Python\Python311\python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
pause
