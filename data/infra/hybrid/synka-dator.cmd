@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM AK1A HYBRID-SYNC — datorn som automatisk spegel + backupmottagare.
REM Körs av Windows Schemaläggaren (inloggning + varje timme).
REM (1) git pull --ff-only från GitHub (all molnutveckling hamnar på datorn)
REM (2) backup-fran-molnet.mjs — drar levande data (variabler/termbank/
REM     kurs-metadata/blogg-utkast) från Supabase till lokala backupfiler.
REM ALDRIG destruktiv: smutsigt träd = hoppa över pull, logga bara.
REM ─────────────────────────────────────────────────────────────────────────────
setlocal
set REPO=C:\Users\Workstation Z G4\.zcode\workspace\default\ak1
set LOG=%REPO%\data\backups\hybrid-sync.log

echo [%date% %time%] hybrid-sync start >> "%LOG%"

cd /d "%REPO%"

REM (1) kod-spegling — endast om trädet är rent (aldrig skriv över pågående arbete)
git fetch origin >> "%LOG%" 2>&1
git status --porcelain | findstr /r "." >nul
if errorlevel 1 (
  git pull --ff-only origin main >> "%LOG%" 2>&1
  echo [%date% %time%] kod synkad >> "%LOG%"
) else (
  echo [%date% %time%] SKIP pull - arbets-trad ej ren >> "%LOG%"
)

REM (2) data-backup från molnet (Supabase) till lokala filer
call node verktyg\backup-fran-molnet.mjs >> "%LOG%" 2>&1

echo [%date% %time%] hybrid-sync klar >> "%LOG%"
endlocal
