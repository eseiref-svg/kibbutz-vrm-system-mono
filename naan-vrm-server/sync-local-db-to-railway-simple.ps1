# ============================================
# סקריפט פשוט לשכפול DB מקומי ל-Railway
# גרסה פשוטה עם Plain SQL format
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayDatabaseUrl
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  שכפול DB מקומי ל-Railway Production" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# בדיקת pg_dump ו-psql
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Host "❌ pg_dump לא נמצא! התקן PostgreSQL client tools" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ psql לא נמצא! התקן PostgreSQL client tools" -ForegroundColor Red
    exit 1
}

# טעינת .env
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ קובץ .env לא נמצא ב: $envFile" -ForegroundColor Red
    exit 1
}

$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

$localDbHost = $envVars['DB_HOST']
$localDbPort = $envVars['DB_PORT']
$localDbUser = $envVars['DB_USER']
$localDbPassword = $envVars['DB_PASSWORD']
$localDbName = $envVars['DB_NAME']

Write-Host "פרטי DB מקומי:" -ForegroundColor Cyan
Write-Host "  Host: $localDbHost"
Write-Host "  Database: $localDbName"
Write-Host ""

# תיקיית backups
$backupsDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $backupsDir "local_db_export_$timestamp.sql"

# שלב 1: גיבוי
Write-Host "שלב 1: גיבוי DB מקומי..." -ForegroundColor Cyan
$env:PGPASSWORD = $localDbPassword

$dumpArgs = @(
    "-h", $localDbHost,
    "-p", $localDbPort,
    "-U", $localDbUser,
    "-d", $localDbName,
    "-F", "p",  # Plain SQL format
    "-f", $backupFile,
    "--no-owner",
    "--no-privileges"
)

& pg_dump $dumpArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ שגיאה בגיבוי!" -ForegroundColor Red
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
Write-Host "✅ גיבוי הושלם: $backupFile" -ForegroundColor Green
Write-Host ""

# שלב 2: שחזור ל-Railway
Write-Host "שלב 2: שחזור ל-Railway..." -ForegroundColor Cyan
Write-Host "⚠️  זה ימחק את כל הנתונים הקיימים ב-Railway DB!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "האם אתה בטוח שברצונך להמשיך? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "בוטל" -ForegroundColor Yellow
    exit 0
}

Write-Host "משחזר... זה עלול לקחת כמה דקות..." -ForegroundColor Cyan

# קריאת הקובץ ושימוש ב-psql
Get-Content $backupFile | & psql $RailwayDatabaseUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ שכפול DB הושלם בהצלחה!" -ForegroundColor Green
    Write-Host ""
    Write-Host "קובץ גיבוי: $backupFile" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ שגיאה בשחזור!" -ForegroundColor Red
    Write-Host "בדוק את ה-logs למעלה" -ForegroundColor Yellow
    exit 1
}


