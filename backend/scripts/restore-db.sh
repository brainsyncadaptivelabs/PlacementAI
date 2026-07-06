#!/bin/bash
# Database restore script for Linux/macOS

if [ -z "$1" ]; then
    echo "Usage: $0 <path-to-gzipped-backup-file>"
    exit 1
fi

BACKUP_FILE="$1"
DB_URL=${DB_URL:-"jdbc:mysql://localhost:3306/placementai"}
DB_USERNAME=${DB_USERNAME:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"root"}

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

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

TEMP_SQL="/tmp/placementai_restore_$RANDOM.sql"

echo "Extracting backup..."
gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"

echo "Restoring database from $TEMP_SQL..."
export MYSQL_PWD="$DB_PASSWORD"

mysql --host="$DB_HOST" --port="$DB_PORT" --user="$DB_USERNAME" "$DB_NAME" < "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo "Database restore completed successfully!"
else
    echo "Database restore failed. Verify credentials and mysql-client installation."
    rm -f "$TEMP_SQL"
    exit 1
fi

rm -f "$TEMP_SQL"
unset MYSQL_PWD
