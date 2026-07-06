# mysql backup script
# Configurable via environment variables: DB_URL, DB_USERNAME, DB_PASSWORD, BACKUP_DIR, BACKUP_RETENTION_DAYS

$dbUrl = $env:DB_URL
$username = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "root" }
$password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }
$backupDir = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { ".\backups" }
$retentionDays = if ($env:BACKUP_RETENTION_DAYS) { [int]$env:BACKUP_RETENTION_DAYS } else { 7 }

# Parse DB Host and Database name from jdbc URL if possible
$hostName = "localhost"
$port = "3306"
$dbName = "placementai"

if ($dbUrl -match "jdbc:mysql://([^:/]+)(:(\d+))?/([^?]+)") {
    $hostName = $Matches[1]
    if ($Matches[3]) { $port = $Matches[3] }
    $dbName = $Matches[4]
}

if (! (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $backupDir "placementai_backup_$timestamp.sql"
$zipFile = "$backupFile.zip"

Write-Host "Starting database backup for database: $dbName on $hostName..." -ForegroundColor Cyan

# Set environment variable for password to avoid prompting
$env:MYSQL_PWD = $password

try {
    # Run mysqldump
    & mysqldump --host=$hostName --port=$port --user=$username $dbName --result-file=$backupFile 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database backup successful: $backupFile" -ForegroundColor Green
        
        # Compress the backup
        Compress-Archive -Path $backupFile -DestinationPath $zipFile -Force
        Remove-Item $backupFile -Force
        Write-Host "Backup compressed to: $zipFile" -ForegroundColor Green
        
        # Retention cleanup
        $limitDate = (Get-Date).AddDays(-$retentionDays)
        Get-ChildItem -Path $backupDir -Filter "placementai_backup_*.sql.zip" | Where-Object { $_.LastWriteTime -lt $limitDate } | Remove-Item -Force
        Write-Host "Cleanup of backups older than $limitDate completed." -ForegroundColor Cyan
    } else {
        Write-Error "mysqldump failed with exit code $LASTEXITCODE. Verify credentials and mysql-client installation."
    }
} catch {
    Write-Error "An error occurred during database backup: $_"
} finally {
    $env:MYSQL_PWD = $null
}
