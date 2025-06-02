#!/bin/bash

# Скрипт для развертывания проекта в Docker

echo "🚀 Запуск развертывания проекта Monastyr в Docker..."

# Проверяем наличие Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Пожалуйста, установите Docker."
    exit 1
fi

# Останавливаем существующие контейнеры
echo "🛑 Остановка существующих контейнеров..."
docker compose down

# Копируем переменные окружения
if [ ! -f .env ]; then
    echo "📋 Создание файла .env из .env.docker..."
    cp .env.docker .env
    echo "⚠️  Пожалуйста, отредактируйте файл .env для настройки ваших секретных ключей!"
fi

# Собираем и запускаем контейнеры
echo "🏗️  Сборка и запуск контейнеров..."
docker compose up --build -d

# Ждем запуска базы данных
echo "⏳ Ожидание запуска базы данных..."
sleep 30

# Проверяем статус контейнеров
echo "📊 Статус контейнеров:"
docker compose ps

echo ""
echo "✅ Развертывание завершено!"
echo ""
echo "🌐 Ваш сайт доступен по адресам:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:3001"
echo "   - Nginx (если включен): http://localhost"
echo ""
echo "📝 Полезные команды:"
echo "   - Просмотр логов: docker compose logs -f"
echo "   - Остановка: docker compose down"
echo "   - Перезапуск: docker compose restart"
echo "   - Обновление: docker compose up --build -d"
echo ""
