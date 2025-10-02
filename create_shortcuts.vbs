Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the script directory
ScriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
DesktopPath = WshShell.SpecialFolders("Desktop")

' Create Start shortcut
Set StartLink = WshShell.CreateShortcut(DesktopPath & "\Start Estimation Tool.lnk")
StartLink.TargetPath = ScriptDir & "\start.bat"
StartLink.WorkingDirectory = ScriptDir
StartLink.Description = "Start the Project Estimation Tool"
StartLink.IconLocation = "shell32.dll,137"
StartLink.Save

' Create Stop shortcut
Set StopLink = WshShell.CreateShortcut(DesktopPath & "\Stop Estimation Tool.lnk")
StopLink.TargetPath = ScriptDir & "\stop.bat"
StopLink.WorkingDirectory = ScriptDir
StopLink.Description = "Stop the Project Estimation Tool"
StopLink.IconLocation = "shell32.dll,132"
StopLink.Save

MsgBox "Desktop shortcuts created successfully!" & vbCrLf & vbCrLf & _
       "Created:" & vbCrLf & _
       "  • Start Estimation Tool" & vbCrLf & _
       "  • Stop Estimation Tool", vbInformation, "Shortcuts Created"
