# ============================================
# סקריפט אוטומטי לשכפול DB מקומי ל-Railway
# מנסה לקבל DATABASE_URL אוטומטית
# ============================================

param(
    [string]$RailwayDatabaseUrl = "",
    [switch]$ForceManual = $false
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  שכפול DB מקומי ל-Railway Production" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# פונקציות עזר
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# בדיקת PostgreSQL tools
Write-Info "בודק התקנת PostgreSQL tools..."
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) {
    Write-Error "❌ pg_dump לא נמצא! התקן PostgreSQL client tools"
    exit 1
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "❌ psql לא נמצא! התקן PostgreSQL client tools"
    exit 1
}
Write-Success "✅ PostgreSQL tools נמצאו"

# טעינת .env מקומי
Write-Info "טוען פרטי DB מקומי..."
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "❌ קובץ .env לא נמצא ב: $envFile"
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

$requiredVars = @('DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME')
foreach ($var in $requiredVars) {
    if (-not $envVars.ContainsKey($var)) {
        Write-Error "❌ משתנה $var לא נמצא ב-.env"
        exit 1
    }
}

$localDbHost = $envVars['DB_HOST']
$localDbPort = $envVars['DB_PORT']
$localDbUser = $envVars['DB_USER']
$localDbPassword = $envVars['DB_PASSWORD']
$localDbName = $envVars['DB_NAME']

Write-Success "✅ פרטי DB מקומי נטענו"
Write-Host ""

# ניסיון לקבל DATABASE_URL אוטומטית
if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl) -and -not $ForceManual) {
    Write-Info "מנסה לקבל DATABASE_URL אוטומטית..."
    
    # ניסיון 1: משתנה סביבה
    if ($env:DATABASE_URL) {
        Write-Success "✅ נמצא DATABASE_URL במשתנה סביבה"
        $RailwayDatabaseUrl = $env:DATABASE_URL
    }
    # ניסיון 2: Railway CLI
    elseif (Get-Command railway -ErrorAction SilentlyContinue) {
        Write-Info "מנסה דרך Railway CLI..."
        try {
            $railwayVars = railway variables --json 2>&1
            if ($railwayVars -match 'DATABASE_URL') {
                # נסה לפרסר את ה-JSON
                $railwayVarsObj = $railwayVars | ConvertFrom-Json -ErrorAction SilentlyContinue
                if ($railwayVarsObj) {
                    $dbUrlVar = $railwayVarsObj | Where-Object { $_.name -eq 'DATABASE_URL' }
                    if ($dbUrlVar) {
                        $RailwayDatabaseUrl = $dbUrlVar.value
                        Write-Success "✅ נמצא DATABASE_URL דרך Railway CLI"
                    }
                }
            }
        } catch {
            Write-Warning "⚠️  Railway CLI לא מחובר או לא זמין"
        }
    }
    
    # ניסיון 3: קובץ config (אם קיים)
    if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl)) {
        $configFile = Join-Path $PSScriptRoot ".railway-config"
        if (Test-Path $configFile) {
            $configContent = Get-Content $configFile -Raw
            if ($configContent -match 'DATABASE_URL\s*=\s*(.+)') {
                $RailwayDatabaseUrl = $matches[1].Trim()
                Write-Success "✅ נמצא DATABASE_URL בקובץ config"
            }
        }
    }
}

# אם עדיין אין DATABASE_URL, בקש מהמשתמש
if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl)) {
    Write-Warning "⚠️  לא ניתן לקבל DATABASE_URL אוטומטית"
    Write-Host ""
    Write-Info "קבל אותו מ-Railway Dashboard:"
    Write-Info "  1. לך ל: https://railway.app"
    Write-Info "  2. בחר את הפרויקט: truthful-recreation-production"
    Write-Info "  3. לך ל-PostgreSQL service → Variables"
    Write-Info "  4. העתק את DATABASE_URL"
    Write-Host ""
    
    $RailwayDatabaseUrl = Read-Host "הדבק את DATABASE_URL כאן"
    
    if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl)) {
        Write-Error "❌ DATABASE_URL לא סופק. ביטול."
        exit 1
    }
}

Write-Success "✅ DATABASE_URL התקבל"
Write-Host ""

# תיקיית backups
$backupsDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $backupsDir "local_db_export_$timestamp.sql"

# שלב 1: גיבוי
Write-Info "============================================"
Write-Info "  שלב 1: גיבוי DB מקומי"
Write-Info "============================================"
Write-Info "מבצע גיבוי..."

$env:PGPASSWORD = $localDbPassword

$dumpArgs = @(
    "-h", $localDbHost,
    "-p", $localDbPort,
    "-U", $localDbUser,
    "-d", $localDbName,
    "-F", "p",
    "-f", $backupFile,
    "--no-owner",
    "--no-privileges"
)

try {
    & pg_dump $dumpArgs 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump נכשל"
    }
    Write-Success "✅ גיבוי הושלם: $backupFile"
} catch {
    Write-Error "❌ שגיאה בגיבוי: $_"
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    exit 1
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""

# שלב 2: שחזור ל-Railway
Write-Info "============================================"
Write-Info "  שלב 2: שחזור ל-Railway Production"
Write-Info "============================================"
Write-Warning "⚠️  זה ימחק את כל הנתונים הקיימים ב-Railway DB!"
Write-Host ""

$confirm = Read-Host "האם אתה בטוח שברצונך להמשיך? (yes/no)"
if ($confirm -ne "yes") {
    Write-Warning "בוטל על ידי המשתמש"
    exit 0
}

Write-Info "משחזר ל-Railway... זה עלול לקחת כמה דקות..."

try {
    Get-Content $backupFile | & psql $RailwayDatabaseUrl 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Success "✅ שכפול DB הושלם בהצלחה!"
        Write-Host ""
        Write-Info "קובץ גיבוי: $backupFile"
        Write-Info "בדוק את Railway Dashboard כדי לוודא שהנתונים עודכנו"
    } else {
        Write-Error "❌ שגיאה בשחזור (קוד יציאה: $LASTEXITCODE)"
        Write-Warning "בדוק את ה-logs למעלה לפרטים"
        exit 1
    }
} catch {
    Write-Error "❌ שגיאה בשחזור: $_"
    exit 1
}

Write-Host ""
Write-Info "============================================"
Write-Success "  ✅ התהליך הושלם בהצלחה!"
Write-Info "============================================"


