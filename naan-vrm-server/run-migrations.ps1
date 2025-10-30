# ============================================
# Run Database Migrations Script
# ============================================
# This script applies all pending migrations to a database
#
# Usage:
#   # For LOCAL:
#   .\run-migrations.ps1 -Environment "local"
#
#   # For PRODUCTION:
#   $env:DATABASE_URL="postgresql://..."
#   .\run-migrations.ps1 -Environment "production"
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("local", "production")]
    [string]$Environment
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Database Migration Runner" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get all migration files
$migrationsPath = "migrations"
$migrationFiles = Get-ChildItem -Path $migrationsPath -Filter "*.sql" | Sort-Object Name

if ($migrationFiles.Count -eq 0) {
    Write-Host "⚠️  No migration files found in $migrationsPath" -ForegroundColor Yellow
    exit 0
}

Write-Host "📁 Found $($migrationFiles.Count) migration file(s)" -ForegroundColor Green
Write-Host ""

# Determine connection string
if ($Environment -eq "production") {
    if (-not $env:DATABASE_URL) {
        Write-Host "❌ ERROR: DATABASE_URL not set for production environment" -ForegroundColor Red
        exit 1
    }
    $connectionString = $env:DATABASE_URL
    Write-Host "🌐 Connecting to PRODUCTION database..." -ForegroundColor Yellow
} else {
    # Local environment
    if (-not $env:DB_USER -or -not $env:DB_PASSWORD -or -not $env:DB_NAME) {
        Write-Host "❌ ERROR: Local DB environment variables not set" -ForegroundColor Red
        Write-Host "Required: DB_USER, DB_PASSWORD, DB_NAME, DB_HOST (optional), DB_PORT (optional)" -ForegroundColor Yellow
        exit 1
    }
    
    $host = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
    $port = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
    
    $connectionString = "postgresql://$($env:DB_USER):$($env:DB_PASSWORD)@$($host):$($port)/$($env:DB_NAME)"
    Write-Host "🏠 Connecting to LOCAL database..." -ForegroundColor Yellow
}

# Find psql
$psql = $null
$possiblePaths = @(
    "psql",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $psql = $path
        break
    }
}

if (-not $psql) {
    Write-Host "❌ ERROR: psql not found" -ForegroundColor Red
    exit 1
}

# Apply migrations
$successCount = 0
$failCount = 0

foreach ($file in $migrationFiles) {
    Write-Host "▶️  Applying: $($file.Name)" -ForegroundColor Cyan
    
    try {
        & $psql $connectionString -f $file.FullName 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Success" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "   ❌ Failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "   ❌ Error: $_" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
}

# Summary
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Migration Summary" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host "============================================" -ForegroundColor Cyan

if ($failCount -gt 0) {
    exit 1
} else {
    exit 0
}

