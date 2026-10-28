@echo off
rem Bekijk de gebouwde site (map dist) op http://localhost:4322, zonder bewerken.
cd /d "%~dp0"
if not exist dist\index.html (
  echo De map dist ontbreekt. Voer eerst start.bat uit en daarna: npm run build
  pause
  exit /b
)
where python >nul 2>nul
if not errorlevel 1 (
  start "" http://localhost:4322
  python -m http.server 4322 --directory dist
  exit /b
)
where node >nul 2>nul
if not errorlevel 1 (
  start "" http://localhost:4322
  node "%~dp0scripts\serve.mjs"
  exit /b
)
echo Geen Python of Node.js gevonden. Installeer Node.js LTS via https://nodejs.org
start https://nodejs.org
pause
