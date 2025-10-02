#!/bin/bash
# Quick Start Script for macOS/Linux
# Run this file to start both backend and frontend

echo ""
echo "============================================================"
echo "     ENGINEERING ESTIMATION SYSTEM - QUICK START"
echo "============================================================"
echo ""

# Check if setup has been run
if [ ! -f "backend/.env" ]; then
    echo "[WARNING] System not set up yet!"
    echo ""
    echo "Please run: ./setup_wizard.sh"
    echo ""
    exit 1
fi

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "[ERROR] Docker is not running!"
    echo ""
    echo "Please start Docker and try again"
    echo ""
    exit 1
fi

echo "[1/3] Starting Backend (Docker)..."
cd backend
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to start backend"
    exit 1
fi
echo "[OK] Backend started"
echo ""

echo "[2/3] Waiting for services to be ready..."
sleep 5
echo "[OK] Services ready"
echo ""

echo "[3/3] Starting Frontend..."
cd ../frontend

# Start frontend in new terminal window
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open -a Terminal -n "$(pwd)" --args bash -c "npm run dev; exec bash"
else
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "npm run dev; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "npm run dev; exec bash" &
    else
        # Fallback - run in background
        npm run dev &
    fi
fi

cd ..

echo "[OK] Frontend starting"
echo ""

echo "============================================================"
echo "                    SYSTEM STARTED!"
echo "============================================================"
echo ""
echo "Backend API:  http://localhost:8000"
echo "API Docs:     http://localhost:8000/api/docs"
echo "Frontend:     http://localhost:3000"
echo ""
echo "Opening browser in 5 seconds..."
sleep 5

# Open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open http://localhost:3000 &>/dev/null &
fi

echo ""
echo "============================================================"
echo ""
echo "To stop the system:"
echo "  1. Close the frontend terminal (Ctrl+C)"
echo "  2. Run: cd backend && docker-compose down"
echo ""
echo "Press Ctrl+C to exit..."
sleep infinity