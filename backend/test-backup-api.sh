#!/bin/bash

echo "=== Тестирование API системы резервного копирования ==="

# Попробуем войти
echo "1. Вход в систему..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "i@ddurnov.ru", "password": "qazxsw21"}')

echo "Ответ авторизации: $TOKEN_RESPONSE"

# Извлекаем токен (если есть)
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "Ошибка: не удалось получить токен"
    exit 1
fi

echo "Полученный токен: $TOKEN"

# Тестируем получение списка резервных копий
echo ""
echo "2. Получение списка резервных копий..."
BACKUPS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/backup \
  -H "Authorization: Bearer $TOKEN")

echo "Список резервных копий: $BACKUPS_RESPONSE"

# Создаем резервную копию
echo ""
echo "3. Создание полной резервной копии..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/backup/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type": "full"}')

echo "Результат создания: $CREATE_RESPONSE"

# Снова получаем список для проверки
echo ""
echo "4. Проверка обновленного списка резервных копий..."
UPDATED_BACKUPS=$(curl -s -X GET http://localhost:3000/api/backup \
  -H "Authorization: Bearer $TOKEN")

echo "Обновленный список: $UPDATED_BACKUPS"

echo ""
echo "=== Тестирование завершено ==="
