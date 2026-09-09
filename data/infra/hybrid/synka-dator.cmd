@echo off
REM ─────────────────────────────────────────────────────────────────────────────
REM AK1A HYBRID-SYNC v2 — DATORN = BACKUP-VALV (kunddirektiv 2026-09-08:
REM "servern sköter allt helt själv; datorn sparar ALL data för värsta fallet").
REM Körs av Windows Schemaläggaren (timme) + startmappen (inloggning).
REM (1) git pull --ff-only — kodspegel från GitHub (som servern pushat till)
REM (2) backup-fran-molnet.mjs — levande data (Supabase, 10 typer + FULL dump)
REM (3) server-konfig-snapshot — nginx/crontab/pm2 via ssh till data/backups/
REM (4) backup-server-filer.mjs — serverns repo (tar.gz utan node_modules/.next)
REM     + .env till data/backups/server-env-backup (chmod 600)
REM ALDRIG destruktiv: smutsigt träd = hoppa över pull, logga bara.
REM ─────────────────────────────────────────────────────────────────────────────
setlocal
set REPO=C:\Users\Workstation Z G4\.zcode\workspace\default\ak1
set LOG=%REPO%\data\backups\hybrid-sync.log
set NYCKEL=%USERPROFILE%\.ssh\contabo_key

echo [%date% %time%] hybrid-sync v2 start >> "%LOG%"
cd /d "%REPO%"

REM (1) kod-spegling
git fetch origin >> "%LOG%" 2>&1
git status --porcelain | findstr /r "." >nul
if errorlevel 1 (
  git pull --ff-only origin main >> "%LOG%" 2>&1
  echo [%date% %time%] kod synkad >> "%LOG%"
) else (
  echo [%date% %time%] SKIP pull - trad ej ren >> "%LOG%"
)

REM (2) levande data fran Supabase
call node verktyg\backup-fran-molnet.mjs >> "%LOG%" 2>&1

REM (3) server-konfig-snapshot (nginx/crontab/pm2 + senaste deploy-loggen)
if exist "%NYCKEL%" (
  scp -q -i "%NYCKEL%" -o BatchMode=yes -o ConnectTimeout=10 ak1a@5.189.162.162:/etc/nginx/sites-available/ak1a data\backups\server-nginx-ak1a.conf 2>> "%LOG%"
  scp -q -i "%NYCKEL%" -o BatchMode=yes -o ConnectTimeout=10 ak1a@5.189.162.162:/etc/crontab data\backups\server-crontab.txt 2>> "%LOG%"
  scp -q -i "%NYCKEL%" -o BatchMode=yes -o ConnectTimeout=10 ak1a@5.189.162.162:/home/ak1a/.pm2/dump.pm2 data\backups\server-pm2-dump.json 2>> "%LOG%"
  echo [%date% %time%] server-konfig snapshotad >> "%LOG%"
)

REM (4) serverns repo-filer + .env (tar-cz utan node_modules/.next, vakt 500 MB)
if exist "%NYCKEL%" (
  call node verktyg\backup-server-filer.mjs >> "%LOG%" 2>&1
)

echo [%date% %time%] hybrid-sync v2 klar >> "%LOG%"
endlocal
