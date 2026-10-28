@echo off
setlocal
rem Dubbelklik om je aanpassingen online te zetten op https://thomaslacquet.github.io
rem Eerste keer: installeert git (vraagt eerst) en vraagt je om in te loggen bij GitHub.
cd /d "%~dp0"
set REPO=https://github.com/ThomasLacquet/ThomasLacquet.github.io.git

echo.
echo ============================================================
echo  Site online zetten
echo ============================================================
echo.

where git >nul 2>nul
if errorlevel 1 goto :installgit

rem Eerste keer: deze map koppelen aan je GitHub-repository, zonder je bestanden te overschrijven
if not exist .git (
  echo Eerste keer: map koppelen aan GitHub...
  git init -q -b main
  git remote add origin %REPO%
  git config core.autocrlf true
  git config user.name "Thomas Lacquet"
  git config user.email "ThomasLacquet@users.noreply.github.com"
  git fetch -q origin main || goto :fail
  git reset -q origin/main
  rem Bestanden die alleen online staan (zoals de publicatie-instellingen) terugzetten
  git checkout -q -- .github 2>nul
  git branch -q --set-upstream-to=origin/main main
)

rem Controleren of de site bouwt, zodat er niets kapots online komt
echo Site controleren...
if not exist node_modules call npm install --no-audit --no-fund
call npm run build >build-log.txt 2>&1
if errorlevel 1 (
  echo.
  echo De site bouwt niet. Er is niets online gezet.
  echo Kijk in build-log.txt of vraag het aan Claude.
  pause
  exit /b 1
)
del build-log.txt >nul 2>nul

rem Nieuwste online versie ophalen (bv. als Claude iets aanpaste) en jouw aanpassingen bewaren
git add -A
git restore --staged package-lock.json >nul 2>nul
git diff --cached --quiet
if errorlevel 1 (
  git commit -q -m "Update via publiceer.bat (%date% %time:~0,5%)"
) else (
  echo Geen nieuwe aanpassingen gevonden.
)
git pull -q --rebase --autostash origin main || goto :fail
git push -q origin main || goto :fail

echo.
echo ============================================================
echo  Klaar. Over ongeveer een minuut staat het online op:
echo    https://thomaslacquet.github.io
echo ============================================================
echo.
pause
exit /b 0

:installgit
echo Git is nog niet geinstalleerd. Dat is nodig om te publiceren.
choice /m "Git nu installeren via winget"
if errorlevel 2 exit /b 1
winget install --id Git.Git -e --source winget --accept-package-agreements
echo.
echo Git is geinstalleerd. Sluit dit venster en dubbelklik opnieuw op publiceer.bat.
pause
exit /b 0

:fail
echo.
echo Er ging iets mis bij GitHub. Je aanpassingen staan nog veilig op je pc.
echo Tip: log in wanneer GitHub daarom vraagt, en controleer je internet.
echo Lukt het niet, vraag het dan aan Claude.
pause
exit /b 1
