# Upload Database Backup to Railway
# Run this script manually from PowerShell

$dbUrl = "postgresql://postgres:mwJrDDZGzrbFkz3LXYVqzJsctogqMZUU@trolley.proxy.rlwy.net:38716/railway"
$backupFile = "naan_vrm_backup.sql"
$psqlPath = "C:\Program Files\PostgreSQL\13\bin\psql.exe"

Write-Host "🚀 Uploading backup to Railway..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Yellow

try {
    & $psqlPath $dbUrl -f $backupFile 2>&1 | Out-String
    Write-Host "✅ Backup uploaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error uploading backup: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Copy the content of naan_vrm_backup.sql and paste it in Railway's Query editor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


