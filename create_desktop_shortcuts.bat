@echo off
echo Creating desktop shortcuts...

set SCRIPT_DIR=%~dp0
set DESKTOP=%USERPROFILE%\Desktop

REM Create Start shortcut
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\Start Estimation Tool.lnk'); $s.TargetPath = '%SCRIPT_DIR%start.bat'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.IconLocation = 'shell32.dll,137'; $s.Description = 'Start the Project Estimation Tool'; $s.Save()"

REM Create Stop shortcut
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\Stop Estimation Tool.lnk'); $s.TargetPath = '%SCRIPT_DIR%stop.bat'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.IconLocation = 'shell32.dll,132'; $s.Description = 'Stop the Project Estimation Tool'; $s.Save()"

echo.
echo Desktop shortcuts created successfully!
echo.
echo Created:
echo   - Start Estimation Tool.lnk
echo   - Stop Estimation Tool.lnk
echo.
echo You can now start/stop the application from your desktop!
echo.
pause
