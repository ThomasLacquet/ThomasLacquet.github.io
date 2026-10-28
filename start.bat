@echo off
setlocal
rem Dubbelklik om de site lokaal te openen op http://localhost:4321
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto :installnode

rem Astro heeft Node 20.19 of nieuwer nodig (22 of 24 LTS aanbevolen)
for /f "tokens=1 delims=." %%v in ('node -v') do set NODEMAJOR=%%v
set NODEMAJOR=%NODEMAJOR:v=%
if %NODEMAJOR% LSS 20 goto :oldnode
if %NODEMAJOR%==21 goto :oldnode

if not exist node_modules\@keystatic\astro (
  echo Eerste keer: onderdelen installeren...
  call npm install --no-audit --no-fund
)
start "" http://localhost:4321/keystatic
start "" http://localhost:4321
echo.
echo ============================================================
echo  Op je iPhone (zelfde wifi) open je in Chrome of Safari:
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress"`) do echo    http://%%i:4321
echo  Vraagt Windows om toegang tot het netwerk: kies Prive netwerk en Toestaan.
echo ============================================================
echo.
call npm run dev -- --host
pause
exit /b

:oldnode
echo.
echo Je Node.js is te oud voor bewerken:
node -v
echo De site heeft versie 22 of nieuwer nodig.
goto :installnode

:installnode
echo.
where winget >nul 2>nul
if errorlevel 1 (
  echo Download Node.js LTS via https://nodejs.org, installeer het en dubbelklik opnieuw op start.bat.
  start https://nodejs.org
  goto :preview
)
choice /c JN /m "Node.js LTS nu automatisch installeren via winget"
if errorlevel 2 goto :preview
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
if exist node_modules rmdir /s /q node_modules
echo.
echo Klaar. Sluit dit venster en dubbelklik opnieuw op start.bat.
pause
exit /b

:preview
echo.
echo Intussen open ik de kant-en-klare versie (alleen bekijken, niet live bewerken).
call "%~dp0bekijk.bat"
exit /b
