#!/bin/bash

# =============================================================================
# RESTORE SCRIPT FOR MONASTYR PROJECT
# =============================================================================

set -e

BACKUP_DIR="/app/backups"
MYSQL_CONTAINER="monastyr_db"
DB_NAME="${MYSQL_DATABASE:-monastyr}"
DB_USER="${MYSQL_USER:-monastyr_user}"
DB_PASSWORD="${MYSQL_PASSWORD}"

# Проверка аргументов
if [ $# -eq 0 ]; then
    echo "Использование: $0 <путь_к_бэкапу>"
    echo ""
    echo "Доступные бэкапы:"
    ls -la "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "Бэкапы не найдены"
    exit 1
fi

BACKUP_FILE="$1"

# Проверка существования файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Ошибка: Файл $BACKUP_FILE не найден"
    exit 1
fi

echo "Начинаю восстановление из бэкапа: $BACKUP_FILE"

# Предупреждение
echo "⚠️  ВНИМАНИЕ: Это действие полностью заменит текущую базу данных!"
read -p "Продолжить? (yes/no): " -r
if [[ ! $REPLY =~ ^yes$ ]]; then
    echo "Операция отменена"
    exit 1
fi

# Остановка backend для безопасности
echo "Остановка backend сервиса..."
docker-compose stop backend

# Восстановление базы данных
echo "Восстановление базы данных..."

if [[ "$BACKUP_FILE" == *.gz ]]; then
    # Если файл сжат
    gunzip -c "$BACKUP_FILE" | docker exec -i "$MYSQL_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME"
else
    # Если файл не сжат
    docker exec -i "$MYSQL_CONTAINER" mysql \
        -u "$DB_USER" \
        -p"$DB_PASSWORD" \
        "$DB_NAME" < "$BACKUP_FILE"
fi

echo "Запуск миграций..."
docker-compose run --rm backend pnpm prisma migrate deploy

echo "Запуск backend сервиса..."
docker-compose start backend

echo "✅ Восстановление завершено успешно!"
