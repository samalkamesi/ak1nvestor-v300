# HäMTA-BACKUP — körs på kundens lokala dator (PowerShell)
# =========================================================
# Hämtar senaste offsite-backup från Contabo till OneDrive.
# Schemalägg i Task Scheduler var 6:e timme, eller kör manuellt.

$Server = "ak1a@5.189.162.162"
$KeyPath = "C:\Users\Public\ak1a-contabo-key"
$RemotePath = "/home/ak1a/AK1/data/backups/offsite/"
$LocalPath = "$env:USERPROFILE\OneDrive\AK1A-backup\"

# Skapa mapp om den saknas
New-Item -ItemType Directory -Path $LocalPath -Force | Out-Null

# Hämta senaste backup
Write-Host "Hämtar senaste offsite-backup från Contabo..."
scp -i $KeyPath -o BatchMode=yes "${Server}:${RemotePath}ak1a-offsite-*.zip" $LocalPath

if ($?) {
    $filer = Get-ChildItem "$LocalPath\ak1a-offsite-*.zip" | Sort-Object LastWriteTime -Descending
    $senast = $filer | Select-Object -First 1
    Write-Host "✓ Hämtad: $($senast.Name) ($([math]::Round($senast.Length/1KB)) kB)"

    # Behåll bara senaste 7
    $filer | Select-Object -Skip 7 | Remove-Item -Force -ErrorAction SilentlyContinue

    # Hämta även git-repo om det finns nya commits
    Write-Host "Synkar git-repo till OneDrive..."
    $repoPath = "$env:USERPROFILE\OneDrive\AK1A-backup\repo"
    if (-not (Test-Path $repoPath)) {
        git clone ssh://ak1a@5.189.162.162/home/ak1a/AK1 $repoPath 2>$null
    } else {
        Push-Location $repoPath
        git pull ssh://ak1a@5.189.162.162/home/ak1a/AK1 develop 2>$null
        Pop-Location
    }
    Write-Host "✓ Klart — OneDrive synkar automatiskt till molnet"
} else {
    Write-Host "✗ Kunde ej hämta — kontrollera SSH-nyckel och nätverk"
}
