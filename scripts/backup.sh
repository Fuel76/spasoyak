#!/bin/bash

# =============================================================================
# BACKUP SCRIPT FOR MONASTYR PROJECT
# =============================================================================

set -e

# Настройки
BACKUP_DIR="/app/backups"
MYSQL_CONTAINER="monastyr_db"
DB_NAME="${MYSQL_DATABASE:-monastyr}"
DB_USER="${MYSQL_USER:-monastyr_user}"
DB_PASSWORD="${MYSQL_PASSWORD}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Создание директории для бэкапов
mkdir -p "$BACKUP_DIR"

# Имя файла с текущей датой
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql"

echo "Начинаю создание резервной копии..."

# Создание дампа базы данных
docker exec "$MYSQL_CONTAINER" mysqldump \
    -u "$DB_USER" \
    -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "$DB_NAME" > "$BACKUP_FILE"

# Сжатие бэкапа
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "Резервная копия создана: $BACKUP_FILE"

# Удаление старых бэкапов
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "Старые бэкапы (старше $RETENTION_DAYS дней) удалены"

# Проверка размера бэкапа
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Размер бэкапа: $BACKUP_SIZE"

echo "Резервное копирование завершено успешно!"
