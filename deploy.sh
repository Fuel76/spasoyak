#!/bin/bash

# =============================================================================
# MONASTYR PROJECT - DOCKER COMPOSE DEPLOYMENT SCRIPT
# =============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для вывода
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    info "Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен. Установите Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен. Установите Docker Compose: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    success "Все зависимости установлены"
}

# Проверка .env файла
check_env() {
    info "Проверка файла окружения..."
    
    if [ ! -f .env ]; then
        warning ".env файл не найден. Создаю из шаблона..."
        cp .env.production .env
        warning "⚠️  ВАЖНО: Отредактируйте .env файл с вашими настройками перед запуском!"
        warning "Особенно обратите внимание на:"
        warning "- MYSQL_ROOT_PASSWORD"
        warning "- MYSQL_PASSWORD"
        warning "- JWT_SECRET"
        warning "- ADMIN_REGISTRATION_KEY"
        warning "- FRONTEND_URL и VITE_API_URL"
        echo ""
        read -p "Нажмите Enter после редактирования .env файла..."
    fi
    
    success ".env файл готов"
}

# Создание необходимых директорий
create_directories() {
    info "Создание необходимых директорий..."
    
    mkdir -p mysql
    mkdir -p nginx
    mkdir -p ssl
    mkdir -p backups
    
    success "Директории созданы"
}

# Генерация SSL сертификатов (самоподписанные для разработки)
generate_ssl() {
    info "Проверка SSL сертификатов..."
    
    if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
        warning "SSL сертификаты не найдены. Генерирую самоподписанные..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=RU/ST=Moscow/L=Moscow/O=Monastery/OU=IT/CN=localhost"
        
        success "SSL сертификаты созданы"
        warning "⚠️  Для продакшена используйте реальные SSL сертификаты (Let's Encrypt)"
    else
        success "SSL сертификаты найдены"
    fi
}

# Сборка и запуск контейнеров
deploy() {
    info "Запуск развертывания..."
    
    # Остановка существующих контейнеров
    info "Остановка существующих контейнеров..."
    docker-compose down --remove-orphans
    
    # Сборка образов
    info "Сборка Docker образов..."
    docker-compose build --no-cache
    
    # Запуск контейнеров
    info "Запуск контейнеров..."
    docker-compose up -d
    
    # Ожидание запуска базы данных
    info "Ожидание запуска базы данных..."
    sleep 20
    
    # Выполнение миграций
    info "Выполнение миграций базы данных..."
    docker-compose exec backend pnpm prisma migrate deploy
    
    # Seeding базы данных (опционально)
    read -p "Хотите заполнить базу данных тестовыми данными? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "Заполнение базы данных..."
        docker-compose exec backend pnpm seed
    fi
    
    success "Развертывание завершено!"
}

# Проверка статуса сервисов
check_status() {
    info "Проверка статуса сервисов..."
    
    echo ""
    echo "=== СТАТУС КОНТЕЙНЕРОВ ==="
    docker-compose ps
    
    echo ""
    echo "=== ЛОГИ ==="
    docker-compose logs --tail=50
    
    echo ""
    echo "=== ПРОВЕРКА ДОСТУПНОСТИ ==="
    
    # Проверка backend
    if curl -f http://localhost:3000/health &> /dev/null; then
        success "Backend доступен на http://localhost:3000"
    else
        error "Backend недоступен"
    fi
    
    # Проверка frontend
    if curl -f http://localhost:80 &> /dev/null; then
        success "Frontend доступен на http://localhost:80"
    else
        error "Frontend недоступен"
    fi
}

# Показать полезную информацию
show_info() {
    echo ""
    echo "=================================="
    echo "🏛️  MONASTYR PROJECT DEPLOYED"
    echo "=================================="
    echo ""
    echo "📱 Frontend: http://localhost:80"
    echo "🔌 Backend API: http://localhost:3000"
    echo "🗄️  Database: localhost:3306"
    echo "🔴 Redis: localhost:6379"
    echo ""
    echo "🔧 Полезные команды:"
    echo "  docker-compose ps              # Статус контейнеров"
    echo "  docker-compose logs -f         # Просмотр логов"
    echo "  docker-compose exec backend sh # Подключение к backend"
    echo "  docker-compose down            # Остановка"
    echo "  docker-compose up -d           # Запуск"
    echo ""
    echo "📁 Volumes:"
    echo "  mysql_data    # Данные MySQL"
    echo "  uploads_data  # Загруженные файлы"
    echo "  backups_data  # Резервные копии"
    echo "  redis_data    # Данные Redis"
    echo ""
}

# Главная функция
main() {
    echo "=================================="
    echo "🏛️  MONASTYR PROJECT DEPLOYMENT"
    echo "=================================="
    echo ""
    
    check_dependencies
    check_env
    create_directories
    generate_ssl
    deploy
    
    echo ""
    info "Проверка статуса через 30 секунд..."
    sleep 30
    
    check_status
    show_info
    
    success "🎉 Развертывание успешно завершено!"
}

# Обработка аргументов
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        check_status
        ;;
    "stop")
        info "Остановка всех сервисов..."
        docker-compose down
        success "Сервисы остановлены"
        ;;
    "restart")
        info "Перезапуск всех сервисов..."
        docker-compose restart
        success "Сервисы перезапущены"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        warning "Это удалит ВСЕ данные! Вы уверены? (y/n)"
        read -p "" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v --remove-orphans
            docker system prune -a -f
            success "Очистка завершена"
        fi
        ;;
    *)
        echo "Использование: $0 [deploy|status|stop|restart|logs|clean]"
        echo ""
        echo "  deploy   - Полное развертывание (по умолчанию)"
        echo "  status   - Проверка статуса сервисов"
        echo "  stop     - Остановка всех сервисов"
        echo "  restart  - Перезапуск всех сервисов"
        echo "  logs     - Просмотр логов"
        echo "  clean    - Полная очистка (УДАЛЯЕТ ВСЕ ДАННЫЕ!)"
        exit 1
        ;;
esac
