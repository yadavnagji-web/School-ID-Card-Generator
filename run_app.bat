@echo off
rem ==============================================================
rem School ID Card Generator - Creative Teachers (www.creativeteachers.in)
rem Windows 7 / 8 / 10 / 11 Compatible Launcher
rem ==============================================================
cd /d "%~dp0"
if exist "%~dp0School_ID_Card_Generator.exe" (
    start "" "%~dp0School_ID_Card_Generator.exe"
) else (
    start "" rundll32.exe url.dll,FileProtocolHandler "%~dp0index.html"
)
exit
