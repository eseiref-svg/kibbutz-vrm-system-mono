# ============================================
# Export Local Database Script
# ============================================
# This script exports the local PostgreSQL database
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Local Database Export Script" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Load .env file
$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ ERROR: .env file not found" -ForegroundColor Red
    exit 1
}

# Parse .env file
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
        $name = $matches[1]
        $value = $matches[2]
        Set-Item -Path "env:$name" -Value $value
    }
}

Write-Host "✅ Loaded environment variables from .env" -ForegroundColor Green

# Check required variables
$required = @("DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT")
$missing = @()
foreach ($var in $required) {
    if (-not (Test-Path "env:$var")) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ ERROR: Missing environment variables: $($missing -join ', ')" -ForegroundColor Red
    exit 1
}

# Create backups directory if it doesn't exist
$backupDir = Join-Path $PSScriptRoot "backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
    Write-Host "📁 Created backup directory: $backupDir" -ForegroundColor Green
}

# Generate filename with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$filename = "local_db_export_$timestamp.sql"
$fullPath = Join-Path $backupDir $filename

Write-Host "🔍 Connecting to local database..." -ForegroundColor Yellow
Write-Host "   Host: $env:DB_HOST" -ForegroundColor Gray
Write-Host "   Database: $env:DB_NAME" -ForegroundColor Gray
Write-Host "   User: $env:DB_USER" -ForegroundColor Gray
Write-Host ""

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
    exit 1
}

Write-Host "✅ Found pg_dump: $pgDump" -ForegroundColor Green

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $env:DB_PASSWORD

# Perform export
Write-Host "💾 Exporting database..." -ForegroundColor Yellow

try {
    & $pgDump `
        --host=$env:DB_HOST `
        --port=$env:DB_PORT `
        --username=$env:DB_USER `
        --dbname=$env:DB_NAME `
        --no-owner `
        --no-acl `
        --clean `
        --if-exists `
        --inserts `
        --column-inserts > $fullPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Export completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "📁 File: $fullPath" -ForegroundColor White
        Write-Host "📊 Size: $([math]::Round((Get-Item $fullPath).Length / 1KB, 2)) KB" -ForegroundColor White
        Write-Host "🕒 Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        
        # Return the file path for use in other scripts
        return $fullPath
    } else {
        Write-Host ""
        Write-Host "❌ Export failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error during export: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "🎉 Export process completed!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

