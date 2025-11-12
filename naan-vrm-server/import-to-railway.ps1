# ============================================
# Import Database to Railway Script
# ============================================
# This script imports a local database export to Railway
# ============================================

param(
    [Parameter(Mandatory=$false)]
    [string]$SqlFile
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Import Database to Railway" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL environment variable is not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "To set it temporarily:" -ForegroundColor Yellow
    Write-Host '  $env:DATABASE_URL="postgresql://user:pass@host:port/db"' -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get the DATABASE_URL from:" -ForegroundColor Yellow
    Write-Host "  1. Railway Dashboard" -ForegroundColor Yellow
    Write-Host "  2. Your project → Database → Connect → Connection String" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Find the most recent SQL file if not specified
if (-not $SqlFile) {
    $backupDir = Join-Path $PSScriptRoot "backups"
    if (-not (Test-Path $backupDir)) {
        Write-Host "❌ ERROR: No backups directory found" -ForegroundColor Red
        exit 1
    }
    
    $latestFile = Get-ChildItem -Path $backupDir -Filter "local_db_export_*.sql" | 
                  Sort-Object LastWriteTime -Descending | 
                  Select-Object -First 1
    
    if (-not $latestFile) {
        Write-Host "❌ ERROR: No SQL export files found in backups directory" -ForegroundColor Red
        exit 1
    }
    
    $SqlFile = $latestFile.FullName
    Write-Host "📁 Using most recent export: $($latestFile.Name)" -ForegroundColor Cyan
}

# Check if SQL file exists
if (-not (Test-Path $SqlFile)) {
    Write-Host "❌ ERROR: SQL file not found: $SqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 SQL File: $SqlFile" -ForegroundColor White
Write-Host "📊 Size: $([math]::Round((Get-Item $SqlFile).Length / 1KB, 2)) KB" -ForegroundColor White
Write-Host ""

# Find psql executable
$psql = $null
$possiblePaths = @(
    "psql",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $psql = $path
        break
    }
}

if (-not $psql) {
    Write-Host "❌ ERROR: psql not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL or add psql to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found psql: $psql" -ForegroundColor Green
Write-Host ""

# Confirm before proceeding
Write-Host "⚠️  WARNING: This will REPLACE all data in the Railway database!" -ForegroundColor Yellow
Write-Host "   The SQL file contains DROP TABLE IF EXISTS statements." -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type 'YES' to continue"

if ($confirm -ne "YES") {
    Write-Host ""
    Write-Host "❌ Import cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting import to Railway..." -ForegroundColor Cyan
Write-Host ""

# Import the database
try {
    Get-Content $SqlFile | & $psql $env:DATABASE_URL
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Import completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🎉 Database has been updated!" -ForegroundColor White
        Write-Host "🕒 Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Import failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error during import: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Import process completed!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

