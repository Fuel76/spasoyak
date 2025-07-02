#!/bin/bash

# =============================================================================
# MONITORING SCRIPT FOR MONASTYR PROJECT
# =============================================================================

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Функции для вывода
info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка сервисов
check_services() {
    echo "=== СТАТУС КОНТЕЙНЕРОВ ==="
    docker-compose ps
    echo ""
}

# Проверка доступности
check_health() {
    echo "=== ПРОВЕРКА ДОСТУПНОСТИ ==="
    
    # Frontend
    if curl -f -s http://localhost:80 > /dev/null; then
        success "Frontend доступен (http://localhost:80)"
    else
        error "Frontend недоступен"
    fi
    
    # Backend API
    if curl -f -s http://localhost:3000/health > /dev/null; then
        success "Backend API доступен (http://localhost:3000)"
    else
        error "Backend API недоступен"
    fi
    
    # Database
    if docker-compose exec -T db mysqladmin ping -h localhost --silent; then
        success "База данных доступна"
    else
        error "База данных недоступна"
    fi
    
    # Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis доступен"
    else
        warning "Redis недоступен"
    fi
    
    echo ""
}

# Проверка ресурсов
check_resources() {
    echo "=== ИСПОЛЬЗОВАНИЕ РЕСУРСОВ ==="
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    echo ""
}

# Проверка логов
check_logs() {
    echo "=== ПОСЛЕДНИЕ ОШИБКИ В ЛОГАХ ==="
    
    # Backend logs
    echo "Backend:"
    docker-compose logs --tail=10 backend | grep -i error || echo "Ошибок не найдено"
    
    # Frontend logs
    echo "Frontend:"
    docker-compose logs --tail=10 frontend | grep -i error || echo "Ошибок не найдено"
    
    # Database logs
    echo "Database:"
    docker-compose logs --tail=10 db | grep -i error || echo "Ошибок не найдено"
    
    echo ""
}

# Проверка дискового пространства
check_disk() {
    echo "=== ИСПОЛЬЗОВАНИЕ ДИСКА ==="
    df -h | grep -E "(Filesystem|/dev/)"
    echo ""
    
    echo "=== РАЗМЕР DOCKER VOLUMES ==="
    docker system df
    echo ""
}

# Полная проверка
full_check() {
    echo "🏛️  MONASTYR PROJECT - МОНИТОРИНГ"
    echo "=================================="
    echo "Время: $(date)"
    echo ""
    
    check_services
    check_health
    check_resources
    check_disk
    check_logs
    
    echo "=================================="
    echo "✅ Мониторинг завершен"
}

# Непрерывный мониторинг
continuous_monitor() {
    while true; do
        clear
        full_check
        echo ""
        echo "Следующая проверка через 30 секунд... (Ctrl+C для выхода)"
        sleep 30
    done
}

# Обработка аргументов
case "${1:-full}" in
    "full")
        full_check
        ;;
    "watch")
        continuous_monitor
        ;;
    "services")
        check_services
        ;;
    "health")
        check_health
        ;;
    "resources")
        check_resources
        ;;
    "logs")
        check_logs
        ;;
    "disk")
        check_disk
        ;;
    *)
        echo "Использование: $0 [full|watch|services|health|resources|logs|disk]"
        echo ""
        echo "  full       - Полная проверка (по умолчанию)"
        echo "  watch      - Непрерывный мониторинг"
        echo "  services   - Статус контейнеров"
        echo "  health     - Проверка доступности"
        echo "  resources  - Использование ресурсов"
        echo "  logs       - Последние ошибки"
        echo "  disk       - Использование диска"
        exit 1
        ;;
esac
