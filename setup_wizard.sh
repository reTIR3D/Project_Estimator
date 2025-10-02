#!/bin/bash
# Engineering Estimation System - Setup Wizard for macOS/Linux
# ==============================================================

echo ""
echo "============================================================"
echo "   ENGINEERING ESTIMATION SYSTEM - SETUP WIZARD"
echo "============================================================"
echo ""
echo "This will set up the complete system for you..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python3 not found! Please install Python 3.11+"
    exit 1
fi

echo "[OK] Python found"
echo ""

# Make the Python script executable if needed
chmod +x setup_wizard.py

# Run the Python setup wizard
python3 setup_wizard.py

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Setup failed!"
    exit 1
fi

echo ""
echo "============================================================"
echo "                   SETUP COMPLETE!"
echo "============================================================"
echo ""