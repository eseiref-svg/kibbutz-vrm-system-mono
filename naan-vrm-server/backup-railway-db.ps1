# ============================================
# Railway Database Backup Script
# ============================================
# This script creates a backup of the Railway PostgreSQL database
#
# Usage:
#   .\backup-railway-db.ps1
#
# Requirements:
#   - pg_dump must be installed and in PATH
#   - DATABASE_URL environment variable must be set (from Railway)
#
# Output:
#   - backup_YYYY-MM-DD_HH-MM-SS.sql
# ============================================

param(
    [string]$OutputPath = "backups"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Railway Database Backup Script" -ForegroundColor Cyan
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
    exit 1
}

# Create backup directory if it doesn't exist
if (-not (Test-Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath | Out-Null
    Write-Host "📁 Created backup directory: $OutputPath" -ForegroundColor Green
}

# Generate filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$filename = "backup_$timestamp.sql"
$fullPath = Join-Path $OutputPath $filename

Write-Host "🔍 Connecting to Railway database..." -ForegroundColor Yellow

# Find pg_dump executable
$pgDump = $null
$possiblePaths = @(
    "pg_dump",
    "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\14\bin\pg_dump.exe",
    "C:\Program Files\PostgreSQL\13\bin\pg_dump.exe"
)

foreach ($path in $possiblePaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $pgDump = $path
        break
    }
}

if (-not $pgDump) {
    Write-Host "❌ ERROR: pg_dump not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL or add pg_dump to your PATH" -ForegroundColor Yellow
    Write-Host "Download from: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found pg_dump: $pgDump" -ForegroundColor Green

# Perform backup
Write-Host "💾 Creating backup..." -ForegroundColor Yellow

try {
    & $pgDump $env:DATABASE_URL --no-owner --no-acl --clean --if-exists > $fullPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📁 File: $fullPath" -ForegroundColor White
        Write-Host "📊 Size: $((Get-Item $fullPath).Length / 1KB) KB" -ForegroundColor White
        Write-Host "🕒 Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 To restore this backup:" -ForegroundColor Yellow
        Write-Host "   psql `$env:DATABASE_URL < $fullPath" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Backup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error during backup: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Backup process completed!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

