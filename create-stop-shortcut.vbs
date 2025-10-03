Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Stop Beetz Servers.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\")) & "stop-beetz-dev.bat"
oLink.WorkingDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
oLink.IconLocation = "C:\Windows\System32\shell32.dll,131"
oLink.Description = "Stop Beetz Development Servers (Port 3001/8001)"
oLink.Save

MsgBox "Desktop shortcut 'Stop Beetz Servers' created successfully!" & vbCrLf & vbCrLf & "Click it to stop all running beetz servers.", vbInformation, "Shortcut Created"
