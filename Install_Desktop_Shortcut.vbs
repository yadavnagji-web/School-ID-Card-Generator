' ==============================================================
' School ID Card Generator - Desktop Shortcut Installer
' Compatible with Windows 7, Windows 8, Windows 10, Windows 11
' Creative Teachers Tools - www.creativeteachers.in
' ==============================================================
Option Explicit
Dim objShell, fso, desktopPath, currentDir, shortcutPath, objShortcut, exePath, htmlPath

Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

desktopPath = objShell.SpecialFolders("Desktop")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
exePath = currentDir & "\School_ID_Card_Generator.exe"
htmlPath = currentDir & "\index.html"

shortcutPath = desktopPath & "\School ID Card Generator.lnk"
Set objShortcut = objShell.CreateShortcut(shortcutPath)

If fso.FileExists(exePath) Then
    objShortcut.TargetPath = exePath
    objShortcut.WorkingDirectory = currentDir
Else
    objShortcut.TargetPath = "rundll32.exe"
    objShortcut.Arguments = "url.dll,FileProtocolHandler """ & htmlPath & """"
    objShortcut.WorkingDirectory = currentDir
End If

objShortcut.Description = "School ID Card Generator - Creative Teachers (www.creativeteachers.in)"
objShortcut.Save

MsgBox "अभिनंदन! 🎉" & vbCrLf & vbCrLf & _
       "School ID Card Generator का डेस्कटॉप शॉर्टकट सफलतापूर्वक बन गया है!" & vbCrLf & _
       "अब आप डेस्कटॉप पर बने 'School ID Card Generator' आइकन पर डबल-क्लिक करके सॉफ्टवेयर बिना किसी ब्लैक स्क्रीन के सीधे चला सकते हैं।" & vbCrLf & vbCrLf & _
       "वेबसाइट: www.creativeteachers.in", vbInformation, "स्थापना संपन्न (Setup Completed)"
