#!/bin/bash

# Скрипт подготовки проекта Monastyr для развертывания на Amvera Cloud
# Использование: ./prepare-amvera.sh

set -e

echo "🚀 Подготовка проекта Monastyr для развертывания на Amvera Cloud"

# Проверка наличия необходимых файлов
echo "📋 Проверка конфигурационных файлов..."

# Проверка backend конфигурации
if [ ! -f "backend/Dockerfile.amvera" ]; then
    echo "❌ Отсутствует backend/Dockerfile.amvera"
    exit 1
fi

if [ ! -f "backend/amvera.yaml" ]; then
    echo "❌ Отсутствует backend/amvera.yaml"
    exit 1
fi

# Проверка frontend конфигурации
if [ ! -f "webapp/Dockerfile.amvera" ]; then
    echo "❌ Отсутствует webapp/Dockerfile.amvera"
    exit 1
fi

if [ ! -f "webapp/amvera.yaml" ]; then
    echo "❌ Отсутствует webapp/amvera.yaml"
    exit 1
fi

echo "✅ Все конфигурационные файлы найдены"

# Проверка package.json файлов
echo "📦 Проверка зависимостей..."

if [ ! -f "backend/package.json" ]; then
    echo "❌ Отсутствует backend/package.json"
    exit 1
fi

if [ ! -f "webapp/package.json" ]; then
    echo "❌ Отсутствует webapp/package.json"
    exit 1
fi

echo "✅ Файлы зависимостей найдены"

# Проверка Prisma схемы
echo "🗄️  Проверка конфигурации базы данных..."

if [ ! -f "backend/prisma/schema.prisma" ]; then
    echo "❌ Отсутствует backend/prisma/schema.prisma"
    exit 1
fi

echo "✅ Prisma схема найдена"

# Создание файлов переменных окружения для Amvera (если не существуют)
echo "🔧 Создание шаблонов переменных окружения..."

if [ ! -f ".env.amvera.backend" ]; then
    echo "📝 Создание .env.amvera.backend"
    cat > .env.amvera.backend << 'EOF'
# Environment variables for Amvera Cloud Backend deployment
# Copy this file and set actual values

# Database Configuration
DATABASE_URL="mysql://username:password@hostname:3306/database_name"

# Server Configuration
NODE_ENV=production
PORT=80

# CORS Configuration
FRONTEND_URL="https://your-frontend-app.amvera.io"

# Session Secret (generate a secure random string)
SESSION_SECRET="your-very-secure-random-string-here"

# Optional: Database Pool Configuration
DB_POOL_MIN=2
DB_POOL_MAX=10

# Prisma Configuration
PRISMA_CLIENT_ENGINE_TYPE=library
EOF
fi

if [ ! -f ".env.amvera.frontend" ]; then
    echo "📝 Создание .env.amvera.frontend"
    cat > .env.amvera.frontend << 'EOF'
# Environment variables for Amvera Cloud Frontend deployment
# Copy this file and set actual values

# API Configuration
VITE_API_URL="https://your-backend-app.amvera.io"

# Build Configuration
NODE_ENV=production
EOF
fi

# Проверка Git репозитория
echo "📚 Проверка Git репозитория..."

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Проект не является Git репозиторием"
    echo "   Инициализируйте Git репозиторий: git init"
    exit 1
fi

# Проверка незакоммиченных изменений
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Обнаружены незакоммиченные изменения"
    echo "   Рекомендуется закоммитить все изменения перед развертыванием"
fi

# Вывод инструкций
echo ""
echo "✅ Подготовка завершена!"
echo ""
echo "📋 Следующие шаги для развертывания на Amvera Cloud:"
echo ""
echo "1. 🗄️  Настройте базу данных MySQL:"
echo "   - Создайте базу данных MySQL (облачную или локальную)"
echo "   - Получите строку подключения DATABASE_URL"
echo ""
echo "2. 🔧 Настройте переменные окружения:"
echo "   - Скопируйте .env.amvera.backend и установите значения"
echo "   - Скопируйте .env.amvera.frontend и установите значения"
echo ""
echo "3. 📚 Подготовьте Git репозиторий:"
echo "   - Закоммитьте все изменения: git add . && git commit -m 'Prepare for Amvera deployment'"
echo "   - Отправьте код в удаленный репозиторий: git push"
echo ""
echo "4. 🚀 Создайте проекты в Amvera Cloud:"
echo "   - Backend: Путь '/backend', используйте переменные из .env.amvera.backend"
echo "   - Frontend: Путь '/webapp', используйте переменные из .env.amvera.frontend"
echo ""
echo "5. 📖 Подробные инструкции читайте в AMVERA_DEPLOY.md"
echo ""
echo "🎉 Проект готов к развертыванию на Amvera Cloud!"
