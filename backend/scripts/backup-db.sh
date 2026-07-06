#!/bin/bash
# Database backup script for Linux/macOS

DB_URL=${DB_URL:-"jdbc:mysql://localhost:3306/placementai"}
DB_USERNAME=${DB_USERNAME:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"root"}
BACKUP_DIR=${BACKUP_DIR:-"./backups"}
BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Parse JDBC URL
if [[ $DB_URL =~ jdbc:mysql://([^:/]+)(:([0-9]+))?/([^?]+) ]]; then
    DB_HOST="${BASH_REMATCH[1]}"
    DB_PORT="${BASH_REMATCH[3]:-3306}"
    DB_NAME="${BASH_REMATCH[4]}"
else
    DB_HOST="localhost"
    DB_PORT="3306"
    DB_NAME="placementai"
fi

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/placementai_backup_$TIMESTAMP.sql"
ZIP_FILE="$BACKUP_FILE.gz"

echo "Starting database backup for $DB_NAME on $DB_HOST..."

export MYSQL_PWD="$DB_PASSWORD"

mysqldump --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Database dump complete. Compressing backup..."
    gzip "$BACKUP_FILE"
    echo "Backup saved as: $ZIP_FILE"
    
    # Retention cleanup
    find "$BACKUP_DIR" -name "placementai_backup_*.sql.gz" -mtime +"$BACKUP_RETENTION_DAYS" -exec rm {} \;
    echo "Old backups cleaned up."
else
    echo "Database dump failed. Verify credentials and mysql-client installation."
    exit 1
fi

unset MYSQL_PWD
