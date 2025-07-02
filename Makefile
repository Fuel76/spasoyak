# Makefile для упрощения управления проектом

.PHONY: help build up down restart logs status clean backup restore monitor dev prod ssl

# Переменные
COMPOSE_FILE_PROD = docker-compose.yml
COMPOSE_FILE_DEV = docker-compose.dev.yml
COMPOSE_FILE_HTTPS = docker-compose.https.yml

# По умолчанию показываем справку
help: ## Показать справку
	@echo "🏛️  MONASTYR PROJECT - УПРАВЛЕНИЕ DOCKER COMPOSE"
	@echo "=================================================="
	@echo ""
	@echo "Доступные команды:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Примеры использования:"
	@echo "  make prod          # Запуск в продакшне"
	@echo "  make dev           # Запуск в разработке"
	@echo "  make ssl           # Настройка SSL"
	@echo "  make backup        # Создание бэкапа"
	@echo "  make logs          # Просмотр логов"

build: ## Сборка всех образов
	@echo "🔨 Сборка Docker образов..."
	docker-compose -f $(COMPOSE_FILE_PROD) build

build-dev: ## Сборка образов для разработки
	@echo "🔨 Сборка Docker образов для разработки..."
	docker-compose -f $(COMPOSE_FILE_DEV) build

up: ## Запуск в продакшне
	@echo "🚀 Запуск в продакшне..."
	docker-compose -f $(COMPOSE_FILE_PROD) up -d

up-dev: ## Запуск в разработке
	@echo "🚀 Запуск в разработке..."
	docker-compose -f $(COMPOSE_FILE_DEV) up -d

up-https: ## Запуск с HTTPS
	@echo "🔒 Запуск с HTTPS..."
	docker-compose -f $(COMPOSE_FILE_PROD) -f $(COMPOSE_FILE_HTTPS) up -d

down: ## Остановка всех сервисов
	@echo "⏹️  Остановка сервисов..."
	docker-compose -f $(COMPOSE_FILE_PROD) down
	docker-compose -f $(COMPOSE_FILE_DEV) down

restart: ## Перезапуск сервисов
	@echo "🔄 Перезапуск сервисов..."
	$(MAKE) down
	$(MAKE) up

restart-dev: ## Перезапуск в разработке
	@echo "🔄 Перезапуск в разработке..."
	docker-compose -f $(COMPOSE_FILE_DEV) down
	docker-compose -f $(COMPOSE_FILE_DEV) up -d

logs: ## Просмотр логов
	@echo "📋 Просмотр логов..."
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f

logs-dev: ## Просмотр логов разработки
	@echo "📋 Просмотр логов разработки..."
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f

status: ## Проверка статуса
	@echo "📊 Проверка статуса..."
	./scripts/monitor.sh

ps: ## Список контейнеров
	@echo "📋 Список контейнеров..."
	docker-compose -f $(COMPOSE_FILE_PROD) ps

clean: ## Полная очистка (УДАЛЯЕТ ВСЕ ДАННЫЕ!)
	@echo "🧹 ВНИМАНИЕ: Это удалит ВСЕ данные!"
	@read -p "Продолжить? (yes/no): " confirm && [ "$$confirm" = "yes" ]
	docker-compose -f $(COMPOSE_FILE_PROD) down -v --remove-orphans
	docker-compose -f $(COMPOSE_FILE_DEV) down -v --remove-orphans
	docker system prune -a -f
	@echo "✅ Очистка завершена"

backup: ## Создание резервной копии
	@echo "💾 Создание резервной копии..."
	./scripts/backup.sh

restore: ## Восстановление из резервной копии
	@echo "📁 Доступные резервные копии:"
	@ls -la backups/backup_*.sql.gz 2>/dev/null || echo "Резервные копии не найдены"
	@read -p "Введите путь к файлу резервной копии: " backup_file; \
	./scripts/restore.sh "$$backup_file"

monitor: ## Мониторинг системы
	@echo "📊 Запуск мониторинга..."
	./scripts/monitor.sh

monitor-watch: ## Непрерывный мониторинг
	@echo "👀 Непрерывный мониторинг..."
	./scripts/monitor.sh watch

ssl: ## Настройка SSL сертификатов
	@echo "🔒 Настройка SSL..."
	./scripts/setup-ssl.sh

migrate: ## Выполнение миграций БД
	@echo "🗄️  Выполнение миграций..."
	docker-compose -f $(COMPOSE_FILE_PROD) exec backend pnpm prisma migrate deploy

migrate-dev: ## Выполнение миграций БД в разработке
	@echo "🗄️  Выполнение миграций в разработке..."
	docker-compose -f $(COMPOSE_FILE_DEV) exec backend pnpm prisma migrate deploy

seed: ## Заполнение БД тестовыми данными
	@echo "🌱 Заполнение БД..."
	docker-compose -f $(COMPOSE_FILE_PROD) exec backend pnpm seed

seed-dev: ## Заполнение БД тестовыми данными в разработке
	@echo "🌱 Заполнение БД в разработке..."
	docker-compose -f $(COMPOSE_FILE_DEV) exec backend pnpm seed

shell-backend: ## Подключение к backend контейнеру
	@echo "🐚 Подключение к backend..."
	docker-compose -f $(COMPOSE_FILE_PROD) exec backend sh

shell-frontend: ## Подключение к frontend контейнеру
	@echo "🐚 Подключение к frontend..."
	docker-compose -f $(COMPOSE_FILE_PROD) exec frontend sh

shell-db: ## Подключение к БД
	@echo "🗄️  Подключение к БД..."
	docker-compose -f $(COMPOSE_FILE_PROD) exec db mysql -u $${MYSQL_USER:-monastyr_user} -p$${MYSQL_PASSWORD} $${MYSQL_DATABASE:-monastyr}

# Алиасы для удобства
prod: up ## Алиас для up (запуск в продакшне)
dev: up-dev ## Алиас для up-dev (запуск в разработке)
stop: down ## Алиас для down (остановка)

# Быстрое развертывание
deploy: ## Полное развертывание (сборка + запуск + миграции)
	@echo "🚀 Полное развертывание..."
	$(MAKE) build
	$(MAKE) up
	@echo "⏳ Ожидание запуска сервисов..."
	@sleep 20
	$(MAKE) migrate
	@echo "📊 Проверка статуса..."
	$(MAKE) status
	@echo "✅ Развертывание завершено!"

deploy-dev: ## Полное развертывание для разработки
	@echo "🚀 Полное развертывание для разработки..."
	$(MAKE) build-dev
	$(MAKE) up-dev
	@echo "⏳ Ожидание запуска сервисов..."
	@sleep 20
	$(MAKE) migrate-dev
	@echo "📊 Проверка статуса..."
	$(MAKE) status
	@echo "✅ Развертывание для разработки завершено!"

# Обновление
update: ## Обновление проекта (git pull + rebuild + restart)
	@echo "🔄 Обновление проекта..."
	git pull
	$(MAKE) build
	$(MAKE) restart
	$(MAKE) migrate
	@echo "✅ Обновление завершено!"

# Информация о проекте
info: ## Информация о проекте
	@echo "🏛️  MONASTYR PROJECT"
	@echo "==================="
	@echo ""
	@echo "📂 Структура:"
	@echo "  Frontend:  React + TypeScript + Vite"
	@echo "  Backend:   Express + TypeScript + Prisma"
	@echo "  Database:  MySQL 8.0"
	@echo "  Cache:     Redis"
	@echo "  Proxy:     Nginx"
	@echo ""
	@echo "🌐 Порты:"
	@echo "  Frontend:  http://localhost:80"
	@echo "  Backend:   http://localhost:3000"
	@echo "  Database:  localhost:3306"
	@echo "  Redis:     localhost:6379"
	@echo ""
	@echo "📁 Volumes:"
	@docker volume ls | grep monastyr || echo "  Volumes не созданы"
