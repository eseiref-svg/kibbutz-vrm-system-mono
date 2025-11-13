# ============================================
# סקריפט לשכפול DB מקומי ל-Railway Production
# ============================================
# 
# שימוש:
#   .\sync-local-db-to-railway.ps1
#
# דרישות:
#   - PostgreSQL client tools מותקנים (pg_dump, psql)
#   - קובץ .env עם פרטי DB מקומי
#   - DATABASE_URL של Railway (יתבקש במהלך הריצה)
# ============================================

param(
    [string]$RailwayDatabaseUrl = "",
    [switch]$SkipBackup = $false,
    [switch]$DryRun = $false
)

# צבעים להודעות
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "============================================"
Write-Info "  שכפול DB מקומי ל-Railway Production"
Write-Info "============================================"
Write-Host ""

# בדיקת pg_dump ו-psql
Write-Info "בודק התקנת PostgreSQL tools..."
$pgDumpExists = Get-Command pg_dump -ErrorAction SilentlyContinue
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue

if (-not $pgDumpExists -or -not $psqlExists) {
    Write-Error "❌ PostgreSQL client tools לא נמצאו!"
    Write-Warning "אנא התקן PostgreSQL client tools:"
    Write-Warning "  - Windows: https://www.postgresql.org/download/windows/"
    Write-Warning "  - או התקן דרך Chocolatey: choco install postgresql"
    exit 1
}
Write-Success "✅ PostgreSQL tools נמצאו"

# טעינת משתני סביבה מקומיים
Write-Info "טוען פרטי DB מקומי מקובץ .env..."
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "❌ קובץ .env לא נמצא ב: $envFile"
    exit 1
}

# קריאת .env
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

# בדיקת משתנים נדרשים
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
Write-Info "   Host: $localDbHost"
Write-Info "   Port: $localDbPort"
Write-Info "   Database: $localDbName"
Write-Info "   User: $localDbUser"
Write-Host ""

# קבלת DATABASE_URL של Railway
if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl)) {
    Write-Warning "⚠️  נדרש DATABASE_URL של Railway"
    Write-Info "קבל אותו מ-Railway Dashboard:"
    Write-Info "  1. לך ל-Railway Dashboard"
    Write-Info "  2. בחר את הפרויקט שלך"
    Write-Info "  3. לך ל-PostgreSQL service → Variables"
    Write-Info "  4. העתק את DATABASE_URL"
    Write-Host ""
    $RailwayDatabaseUrl = Read-Host "הדבק את DATABASE_URL כאן (או Enter לדילוג)"
}

if ([string]::IsNullOrWhiteSpace($RailwayDatabaseUrl)) {
    Write-Error "❌ DATABASE_URL לא סופק. ביטול."
    exit 1
}

Write-Success "✅ DATABASE_URL של Railway התקבל"
Write-Host ""

# יצירת תיקיית backups אם לא קיימת
$backupsDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $backupsDir)) {
    New-Item -ItemType Directory -Path $backupsDir | Out-Null
}

# שם קובץ גיבוי
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = Join-Path $backupsDir "local_db_export_$timestamp.sql"

# שלב 1: גיבוי DB מקומי
if (-not $SkipBackup) {
    Write-Info "============================================"
    Write-Info "  שלב 1: גיבוי DB מקומי"
    Write-Info "============================================"
    
    if ($DryRun) {
        Write-Warning "[DRY RUN] היה מריץ:"
        Write-Info "pg_dump -h $localDbHost -p $localDbPort -U $localDbUser -d $localDbName -F c -f `"$backupFile`""
    } else {
        # הגדרת משתנה סביבה לסיסמה
        $env:PGPASSWORD = $localDbPassword
        
        Write-Info "מבצע גיבוי..."
        $dumpArgs = @(
            "-h", $localDbHost,
            "-p", $localDbPort,
            "-U", $localDbUser,
            "-d", $localDbName,
            "-F", "c",  # Custom format (מורכב יותר אבל טוב יותר)
            "-f", "`"$backupFile`"",
            "--verbose"
        )
        
        try {
            & pg_dump $dumpArgs
            if ($LASTEXITCODE -ne 0) {
                throw "pg_dump נכשל עם קוד יציאה $LASTEXITCODE"
            }
            Write-Success "✅ גיבוי הושלם: $backupFile"
        } catch {
            Write-Error "❌ שגיאה בגיבוי: $_"
            exit 1
        } finally {
            Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        }
    }
    Write-Host ""
} else {
    Write-Warning "⏭️  דילוג על גיבוי (--SkipBackup)"
    Write-Host ""
}

# שלב 2: שחזור ל-Railway
Write-Info "============================================"
Write-Info "  שלב 2: שחזור ל-Railway Production"
Write-Info "============================================"
Write-Warning "⚠️  זה ימחק את כל הנתונים הקיימים ב-Railway DB!"
Write-Host ""

if (-not $DryRun) {
    $confirm = Read-Host "האם אתה בטוח שברצונך להמשיך? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Warning "בוטל על ידי המשתמש"
        exit 0
    }
}

if ($DryRun) {
    Write-Warning "[DRY RUN] היה מריץ:"
    Write-Info "pg_restore -d `"$RailwayDatabaseUrl`" --clean --if-exists --verbose `"$backupFile`""
} else {
    Write-Info "משחזר ל-Railway..."
    Write-Warning "⏳ זה עלול לקחת כמה דקות..."
    
    # שימוש ב-pg_restore עבור custom format
    $restoreArgs = @(
        "-d", "`"$RailwayDatabaseUrl`"",
        "--clean",
        "--if-exists",
        "--verbose",
        "`"$backupFile`""
    )
    
    try {
        & pg_restore $restoreArgs
        if ($LASTEXITCODE -ne 0) {
            throw "pg_restore נכשל עם קוד יציאה $LASTEXITCODE"
        }
        Write-Success "✅ שחזור הושלם בהצלחה!"
    } catch {
        Write-Error "❌ שגיאה בשחזור: $_"
        Write-Warning "ייתכן שצריך להשתמש ב-psql במקום pg_restore"
        Write-Info "מנסה עם psql..."
        
        # ניסיון עם psql (אם pg_restore נכשל)
        $sqlFile = $backupFile -replace '\.sql$', '_plain.sql'
        Write-Info "ממיר ל-plain SQL format..."
        
        $env:PGPASSWORD = $localDbPassword
        $convertArgs = @(
            "-h", $localDbHost,
            "-p", $localDbPort,
            "-U", $localDbUser,
            "-d", $localDbName,
            "-F", "p",  # Plain format
            "-f", "`"$sqlFile`""
        )
        
        & pg_dump $convertArgs
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
        
        if (Test-Path $sqlFile) {
            Write-Info "משחזר עם psql..."
            Get-Content $sqlFile | & psql $RailwayDatabaseUrl
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✅ שחזור הושלם בהצלחה עם psql!"
            } else {
                Write-Error "❌ שגיאה בשחזור עם psql"
                exit 1
            }
        } else {
            Write-Error "❌ לא ניתן ליצור קובץ SQL plain"
            exit 1
        }
    }
}

Write-Host ""
Write-Info "============================================"
Write-Success "  ✅ שכפול DB הושלם בהצלחה!"
Write-Info "============================================"
Write-Host ""
Write-Info "קובץ גיבוי נשמר ב: $backupFile"
Write-Info "בדוק את Railway Dashboard כדי לוודא שהנתונים עודכנו"
Write-Host ""


