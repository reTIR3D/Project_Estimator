Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\Beetz Dev Server.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = WScript.ScriptFullName
oLink.Arguments = ""
oLink.WorkingDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
oLink.IconLocation = "C:\Windows\System32\shell32.dll,21"
oLink.Description = "Start Beetz Development Environment (Port 3001/8001)"
oLink.Save

' Now create the actual shortcut pointing to the bat file
sLinkFile2 = oWS.SpecialFolders("Desktop") & "\Beetz Dev Server.lnk"
Set oLink2 = oWS.CreateShortcut(sLinkFile2)
oLink2.TargetPath = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\")) & "start-beetz-dev.bat"
oLink2.WorkingDirectory = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
oLink2.IconLocation = "C:\Windows\System32\shell32.dll,21"
oLink2.Description = "Start Beetz Development Environment - Auto-updates and starts servers on port 3001/8001"
oLink2.Save

MsgBox "Desktop shortcut 'Beetz Dev Server' created successfully!" & vbCrLf & vbCrLf & "Click it to:" & vbCrLf & "  • Pull latest beetz changes" & vbCrLf & "  • Start backend (port 8001)" & vbCrLf & "  • Start frontend (port 3001)" & vbCrLf & "  • Open browser", vbInformation, "Shortcut Created"
