#!/bin/bash

# =============================================================================
# QUICK START SCRIPT FOR MONASTYR PROJECT
# =============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

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

header() {
    echo -e "${CYAN}$1${NC}"
}

clear

header "🏛️  MONASTYR PROJECT - QUICK START"
header "=================================="
echo ""

info "Добро пожаловать в систему быстрого развертывания проекта Monastyr!"
echo ""

echo "Выберите режим запуска:"
echo ""
echo "1) 🚀 Продакшн (полная настройка с оптимизацией)"
echo "2) 🛠️  Разработка (с hot reload и отладкой)"
echo "3) 🔒 Продакшн с HTTPS (требует настройки SSL)"
echo "4) 📊 Только мониторинг (проверка существующих сервисов)"
echo "5) 🧹 Очистка системы (удаление всех данных)"
echo ""

read -p "Введите номер опции (1-5): " choice

case $choice in
    1)
        header "🚀 ЗАПУСК В РЕЖИМЕ ПРОДАКШН"
        echo "============================="
        echo ""
        
        # Проверка .env файла
        if [ ! -f .env ]; then
            warning "Файл .env не найден. Создаю из шаблона..."
            cp .env.production .env
            warning "⚠️  ВАЖНО: Отредактируйте .env файл перед продолжением!"
            echo ""
            echo "Откройте .env файл и настройте:"
            echo "- MYSQL_ROOT_PASSWORD (пароль root для MySQL)"
            echo "- MYSQL_PASSWORD (пароль пользователя базы данных)"
            echo "- JWT_SECRET (секретный ключ для JWT)"
            echo "- ADMIN_REGISTRATION_KEY (ключ регистрации администратора)"
            echo "- FRONTEND_URL и VITE_API_URL (ваш домен)"
            echo ""
            read -p "Нажмите Enter после редактирования .env файла..."
        fi
        
        info "Запуск полного развертывания..."
        make deploy
        
        echo ""
        success "🎉 Продакшн развертывание завершено!"
        echo ""
        echo "📱 Доступ к приложению:"
        echo "  Frontend: http://localhost:80"
        echo "  Backend:  http://localhost:3000"
        echo ""
        echo "🔧 Полезные команды:"
        echo "  make status    # Проверка статуса"
        echo "  make logs      # Просмотр логов"
        echo "  make monitor   # Мониторинг системы"
        echo "  make backup    # Создание резервной копии"
        ;;
    
    2)
        header "🛠️  ЗАПУСК В РЕЖИМЕ РАЗРАБОТКИ"
        echo "=============================="
        echo ""
        
        if [ ! -f .env ]; then
            info "Создание .env файла для разработки..."
            cp .env.development .env
        fi
        
        info "Запуск в режиме разработки..."
        make deploy-dev
        
        echo ""
        success "🎉 Разработческое окружение готово!"
        echo ""
        echo "📱 Доступ к приложению:"
        echo "  Frontend: http://localhost:5173 (с hot reload)"
        echo "  Backend:  http://localhost:3000 (с автоперезагрузкой)"
        echo ""
        echo "🔧 Полезные команды:"
        echo "  make logs-dev     # Просмотр логов"
        echo "  make restart-dev  # Перезапуск"
        echo "  make shell-backend # Подключение к backend"
        ;;
    
    3)
        header "🔒 ЗАПУСК С HTTPS"
        echo "================="
        echo ""
        
        info "Настройка SSL сертификатов..."
        ./scripts/setup-ssl.sh
        
        info "Запуск с HTTPS..."
        make up-https
        make migrate
        
        echo ""
        success "🎉 HTTPS развертывание завершено!"
        echo ""
        echo "📱 Доступ к приложению:"
        echo "  HTTP:  http://localhost:80 (автоматический редирект)"
        echo "  HTTPS: https://localhost:443"
        ;;
    
    4)
        header "📊 МОНИТОРИНГ СИСТЕМЫ"
        echo "====================="
        echo ""
        
        info "Запуск мониторинга..."
        make status
        
        echo ""
        echo "Хотите запустить непрерывный мониторинг? (y/n)"
        read -p "" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            make monitor-watch
        fi
        ;;
    
    5)
        header "🧹 ОЧИСТКА СИСТЕМЫ"
        echo "=================="
        echo ""
        
        error "⚠️  ВНИМАНИЕ: Это действие удалит ВСЕ данные проекта!"
        error "Включая базу данных, загруженные файлы и резервные копии!"
        echo ""
        warning "Хотите создать резервную копию перед очисткой? (y/n)"
        read -p "" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            info "Создание резервной копии..."
            make backup
        fi
        
        echo ""
        error "Вы уверены, что хотите удалить ВСЕ данные? (yes/no)"
        read -p "Введите 'yes' для подтверждения: " confirm
        
        if [ "$confirm" = "yes" ]; then
            make clean
            success "Система очищена"
        else
            info "Очистка отменена"
        fi
        ;;
    
    *)
        error "Неверный выбор. Используйте номера от 1 до 5."
        exit 1
        ;;
esac

echo ""
header "🏛️  ПОЛЕЗНАЯ ИНФОРМАЦИЯ"
header "======================="
echo ""
echo "📖 Документация:"
echo "  README.md                    # Общая информация"
echo "  DOCKER_PRODUCTION_GUIDE.md  # Подробное руководство"
echo ""
echo "🔧 Основные команды (через Makefile):"
echo "  make help        # Показать все доступные команды"
echo "  make prod        # Запуск в продакшне"
echo "  make dev         # Запуск в разработке"
echo "  make status      # Проверка статуса"
echo "  make logs        # Просмотр логов"
echo "  make backup      # Создание резервной копии"
echo "  make clean       # Полная очистка"
echo ""
echo "🛠️  Прямые команды:"
echo "  ./deploy.sh              # Автоматическое развертывание"
echo "  ./scripts/monitor.sh     # Мониторинг"
echo "  ./scripts/backup.sh      # Резервное копирование"
echo "  ./scripts/setup-ssl.sh   # Настройка SSL"
echo ""
echo "🆘 Поддержка:"
echo "  Если возникли проблемы, проверьте логи:"
echo "  make logs или docker-compose logs"
echo ""
success "Готово! Приложение успешно настроено и запущено! 🎉"
