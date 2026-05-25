@echo off
title Stop Derma-Guide AI Servers
echo ===================================================
echo   Stopping Derma-Guide AI Servers...
echo ===================================================
echo.

echo [SERVER] Terminating FastAPI Backend...
taskkill /FI "WindowTitle eq Derma-Guide Backend*" /T /F >nul 2>&1

echo [CLIENT] Terminating Next.js Frontend...
taskkill /FI "WindowTitle eq Derma-Guide Frontend*" /T /F >nul 2>&1

:: Also explicitly kill any leftover node or python processes running on our specific ports just to be safe
echo Cleaning up remaining processes on ports 3001 and 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

echo.
echo Servers successfully stopped. The website will now appear blank/offline.
echo Press any key to exit.
pause >nul
