# mysql restore script
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupZipPath
)

$dbUrl = $env:DB_URL
$username = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "root" }
$password = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "root" }

# Parse DB Host and Database name from jdbc URL if possible
$hostName = "localhost"
$port = "3306"
$dbName = "placementai"

if ($dbUrl -match "jdbc:mysql://([^:/]+)(:(\d+))?/([^?]+)") {
    $hostName = $Matches[1]
    if ($Matches[3]) { $port = $Matches[3] }
    $dbName = $Matches[4]
}

if (! (Test-Path $BackupZipPath)) {
    Write-Error "Backup file not found at: $BackupZipPath"
    exit 1
}

$tempDir = Join-Path $env:TEMP "placementai_restore_temp"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force | Out-Null }
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Extracting backup zip..." -ForegroundColor Cyan
Expand-Archive -Path $BackupZipPath -DestinationPath $tempDir -Force

$sqlFiles = Get-ChildItem -Path $tempDir -Filter "*.sql"
if ($sqlFiles.Count -eq 0) {
    Write-Error "No SQL file found in the zip archive."
    Remove-Item $tempDir -Recurse -Force
    exit 1
}

$sqlFile = $sqlFiles[0].FullName
Write-Host "Restoring database from $sqlFile..." -ForegroundColor Cyan

# Set environment variable for password to avoid prompting
$env:MYSQL_PWD = $password

try {
    # Run mysql restore command
    & mysql --host=$hostName --port=$port --user=$username $dbName < $sqlFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database restore completed successfully!" -ForegroundColor Green
    } else {
        Write-Error "mysql command failed with exit code $LASTEXITCODE. Verify credentials and mysql-client installation."
    }
} catch {
    Write-Error "An error occurred during database restore: $_"
} finally {
    $env:MYSQL_PWD = $null
    Remove-Item $tempDir -Recurse -Force
}
