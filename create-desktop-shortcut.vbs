Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Master Dev Server.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\")) & "start-master-dev.bat"
oLink.WorkingDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
oLink.IconLocation = "C:\Windows\System32\shell32.dll,165"
oLink.Description = "Start Master Development Environment - Auto-updates and starts servers on port 3000/8000"
oLink.Save

MsgBox "Desktop shortcut 'Master Dev Server' created successfully!" & vbCrLf & vbCrLf & "Click it to:" & vbCrLf & "  • Pull latest master changes" & vbCrLf & "  • Start backend (port 8000)" & vbCrLf & "  • Start frontend (port 3000)" & vbCrLf & "  • Open browser", vbInformation, "Shortcut Created"
