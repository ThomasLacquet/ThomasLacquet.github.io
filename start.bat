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

set NEEDINSTALL=
if not exist node_modules\@keystatic\astro set NEEDINSTALL=1
if not exist node_modules\qrcode set NEEDINSTALL=1
rem Eenmalig de editor-buffer vernieuwen na de update van oktober
if not exist node_modules\.cache-reset-v2 set NEEDINSTALL=1
if defined NEEDINSTALL (
  echo Onderdelen installeren of bijwerken...
  call npm install --no-audit --no-fund
)
if not exist node_modules\.cache-reset-v2 type nul > node_modules\.cache-reset-v2
rem Open het bedieningspaneel zodra de lokale server klaar is
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "for($i=0;$i -lt 90;$i++){try{Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:4321/start | Out-Null; Start-Process 'http://localhost:4321/start'; break}catch{Start-Sleep -Milliseconds 700}}"
echo.
echo ============================================================
echo  Je bedieningspaneel opent zo vanzelf in je browser:
echo    http://localhost:4321/start
echo  Daar vind je: editor, voorbeeld EN/NL, QR-code voor je telefoon
echo  en de knop Zet online.
echo.
echo  Op je iPhone (zelfde wifi) open je in Chrome of Safari:
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|WSL' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 1).IPAddress"`) do echo    http://%%i:4321
echo  Vraagt Windows om toegang tot het netwerk: kies Prive netwerk en Toestaan.
echo ============================================================
echo.
rem Na een installatie of als de editor wit bleef: tijdelijke bestanden van de editor opnieuw opbouwen
if defined NEEDINSTALL (call npm run dev -- --host --force) else (call npm run dev -- --host)
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
