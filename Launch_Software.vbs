' ==============================================================
' School ID Card Generator - Silent Launcher (No Black Screen)
' Compatible with Windows 7, Windows 8, Windows 10, Windows 11
' Creative Teachers Tools - www.creativeteachers.in
' ==============================================================
Option Explicit
Dim objShell, fso, currentDir, exePath, htmlPath
Set objShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
exePath = currentDir & "\School_ID_Card_Generator.exe"
htmlPath = currentDir & "\index.html"

If fso.FileExists(exePath) Then
    objShell.Run """" & exePath & """", 1, False
ElseIf fso.FileExists(htmlPath) Then
    objShell.Run "rundll32.exe url.dll,FileProtocolHandler """ & htmlPath & """", 1, False
Else
    MsgBox "त्रुटि: index.html या School_ID_Card_Generator.exe फ़ाइल नहीं मिली!" & vbCrLf & "कृपया सुनिश्चित करें कि फाइलें H:\ID Card में मौजूद हैं।", vbCritical, "School ID Card Generator"
End If
