Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Stop Master Servers.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\")) & "stop-master-dev.bat"
oLink.WorkingDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
oLink.IconLocation = "C:\Windows\System32\shell32.dll,131"
oLink.Description = "Stop Master Development Servers (Port 3000/8000)"
oLink.Save

MsgBox "Desktop shortcut 'Stop Master Servers' created successfully!" & vbCrLf & vbCrLf & "Click it to stop all running master servers.", vbInformation, "Shortcut Created"
