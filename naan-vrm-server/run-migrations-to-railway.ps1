# ============================================
# הרצת migrations על Railway DB
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$RailwayDatabaseUrl
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  הרצת Migrations על Railway DB" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# בדיקת psql
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Host "❌ psql לא נמצא! התקן PostgreSQL client tools" -ForegroundColor Red
    exit 1
}

$migrationsDir = Join-Path $PSScriptRoot "migrations"
if (-not (Test-Path $migrationsDir)) {
    Write-Host "❌ תיקיית migrations לא נמצאה" -ForegroundColor Red
    exit 1
}

# קבלת רשימת קבצי migrations (בסדר)
$migrations = Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name

Write-Host "נמצאו $($migrations.Count) migration files:" -ForegroundColor Cyan
foreach ($migration in $migrations) {
    Write-Host "  - $($migration.Name)" -ForegroundColor Gray
}
Write-Host ""

$confirm = Read-Host "האם להריץ את כל ה-migrations? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "בוטל" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "מריץ migrations..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($migration in $migrations) {
    Write-Host "מריץ: $($migration.Name)..." -ForegroundColor Cyan
    
    try {
        $result = Get-Content $migration.FullName | psql $RailwayDatabaseUrl 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($migration.Name) הושלם בהצלחה" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "❌ שגיאה ב-$($migration.Name)" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            $errorCount++
        }
    } catch {
        Write-Host "❌ שגיאה ב-$($migration.Name): $_" -ForegroundColor Red
        $errorCount++
    }
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "סיכום:" -ForegroundColor Cyan
Write-Host "  ✅ הצליחו: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  ❌ נכשלו: $errorCount" -ForegroundColor Red
}
Write-Host "============================================" -ForegroundColor Cyan

