@echo off
echo ===================================================
echo Starting Sheprenure Full-Stack Application
echo ===================================================

echo [1/2] Launching Spring Boot Backend...
start "Sheprenure Backend (Port 8080)" cmd /k ".\mvnw.cmd spring-boot:run"

echo [2/2] Launching React Frontend...
start "Sheprenure Frontend (Port 5173)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Backend API: http://localhost:8080
echo - Frontend UI:  http://localhost:5173
echo.
pause
