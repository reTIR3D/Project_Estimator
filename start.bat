@echo off
REM Change to the script directory
cd /d "%~dp0"

echo ========================================
echo Project Estimation Tool - Startup
echo ========================================
echo.

REM Check if Docker Desktop is running
echo Step 1 of 6: Checking Docker status
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Starting Docker Desktop
    echo Please wait for Docker Desktop to start (this may take 30-60 seconds)
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    REM Wait for Docker to be ready
    :WAIT_DOCKER
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo Still waiting for Docker
        goto WAIT_DOCKER
    )
    echo Docker Desktop is now running!
) else (
    echo Docker is already running.
)
echo.

REM Start PostgreSQL database
echo Step 2 of 6: Starting PostgreSQL database
docker-compose up -d
if %errorlevel% neq 0 (
    echo Failed to start database!
    pause
    exit /b 1
)
echo Database started successfully!
echo.

REM Wait for database to be ready
echo Step 3 of 6: Waiting for database to be ready
timeout /t 3 /nobreak >nul
echo.

REM Run database migrations
echo Step 4 of 6: Running database migrations
cd backend
call alembic upgrade head
if %errorlevel% neq 0 (
    echo Warning: Migration failed, but continuing...
)
cd ..
echo.

REM Start backend and frontend servers
echo Step 5 of 6: Starting application servers
echo.
echo Starting backend on http://127.0.0.1:8000
start "Backend Server" cmd /k "cd /d "%~dp0backend" && uvicorn app.main:app --reload --port 8000"

echo Starting frontend on http://localhost:3000
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Step 6 of 6: Waiting for servers to start
timeout /t 8 /nobreak >nul

echo Opening browser
start http://localhost:3000

echo.
echo ========================================
echo Startup Complete!
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:3000
echo.
echo The application should now be open in your browser!
echo.
echo Press any key to exit this window...
pause >nul
