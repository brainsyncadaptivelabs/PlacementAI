# Database Backup & Restore Guide

This guide details the backup, restore, and recovery strategies for the PlacementAI database.

## Backup Scripts

The project includes utility scripts to automate the database backup under [backend/scripts/](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/scripts/).

- **Windows (PowerShell)**: [backup-db.ps1](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/scripts/backup-db.ps1)
- **Linux/macOS (Bash)**: [backup-db.sh](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/scripts/backup-db.sh)

### Running Backups

Configure your target settings using environment variables:
- `DB_URL`: The JDBC connection URL (e.g. `jdbc:mysql://localhost:3306/placementai`).
- `DB_USERNAME`: Database username (default: `root`).
- `DB_PASSWORD`: Database password (default: `root`).
- `BACKUP_DIR`: Directory where backup archives will be stored.
- `BACKUP_RETENTION_DAYS`: The number of days to keep backups (default: `7`).

#### Example (PowerShell)
```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/placementai"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="root"
$env:BACKUP_DIR="C:\backups"
$env:BACKUP_RETENTION_DAYS=14
.\backend\scripts\backup-db.ps1
```

#### Example (Bash)
```bash
export DB_URL="jdbc:mysql://localhost:3306/placementai"
export DB_USERNAME="root"
export DB_PASSWORD="root"
export BACKUP_DIR="/var/backups"
export BACKUP_RETENTION_DAYS=14
./backend/scripts/backup-db.sh
```

---

## Restore Scripts

In the event of a recovery, use the restore scripts:

- **Windows (PowerShell)**: [restore-db.ps1](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/scripts/restore-db.ps1)
- **Linux/macOS (Bash)**: [restore-db.sh](file:///c:/BrainSync%20Company/Applications/PlacementAI/backend/scripts/restore-db.sh)

### Restoring a Backup

#### Example (PowerShell)
```powershell
.\backend\scripts\restore-db.ps1 -BackupZipPath C:\backups\placementai_backup_20260706_120000.sql.zip
```

#### Example (Bash)
```bash
./backend/scripts/restore-db.sh /var/backups/placementai_backup_20260706_120000.sql.gz
```

---

## Scheduling Backups

To perform automated backups daily, configure a cron job or scheduled task.

### Windows Task Scheduler
Create a new Task running:
- **Program/script**: `powershell.exe`
- **Arguments**: `-File "C:\BrainSync Company\Applications\PlacementAI\backend\scripts\backup-db.ps1"`

### Linux Crontab (Daily at 2:00 AM)
```cron
0 2 * * * /bin/bash /path/to/PlacementAI/backend/scripts/backup-db.sh > /dev/null 2>&1
```
