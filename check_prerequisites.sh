#!/bin/bash
# Prerequisite Checker for Mac/Linux
# ===================================

echo ""
echo "============================================================"
echo "   PREREQUISITE CHECKER"
echo "============================================================"
echo ""
echo "Scanning your system for required software..."
echo ""

# Make executable if needed
chmod +x check_prerequisites.py

# Try to run with Python
if command -v python3 &> /dev/null; then
    python3 check_prerequisites.py
elif command -v python &> /dev/null; then
    python check_prerequisites.py
else
    echo "[ERROR] Python not found!"
    echo ""
    echo "Please install Python 3.11+ from: https://www.python.org/downloads/"
    echo ""
    exit 1
fi