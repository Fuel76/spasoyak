# =============================================================================
# MONASTYR PROJECT - PRODUCTION DOCKER COMPOSE SETUP
# =============================================================================

## 📋 Обзор

Этот проект теперь полностью настроен для развертывания через Docker Compose в продакшене. 

### 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (Nginx +      │◄──►│   (Express +    │◄──►│    (MySQL)      │
│   React)        │    │   TypeScript)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                     ┌─────────────────┐
                     │     Redis       │
                     │   (Кеширование) │
                     └─────────────────┘
```

### 📁 Структура файлов

```
├── docker-compose.yml          # Продакшн конфигурация
├── docker-compose.dev.yml      # Конфигурация для разработки
├── .env.production             # Шаблон переменных окружения для продакшна
├── .env.development            # Переменные окружения для разработки
├── deploy.sh                   # Скрипт автоматического развертывания
├── backend/
│   ├── Dockerfile              # Продакшн образ backend
│   └── Dockerfile.dev          # Образ backend для разработки
├── webapp/
│   ├── Dockerfile              # Продакшн образ frontend
│   ├── Dockerfile.dev          # Образ frontend для разработки
│   └── nginx.conf              # Конфигурация Nginx
├── mysql/
│   └── my.cnf                  # Конфигурация MySQL
└── scripts/
    ├── backup.sh               # Автоматическое резервное копирование
    ├── restore.sh              # Восстановление из бэкапа
    └── monitor.sh              # Мониторинг системы
```

## 🚀 Быстрый старт

### 1. Подготовка к продакшну

```bash
# Копирование шаблона переменных окружения
cp .env.production .env

# Редактирование настроек (ОБЯЗАТЕЛЬНО!)
nano .env
```

### 2. Запуск в продакшне

```bash
# Автоматическое развертывание
./deploy.sh

# Или вручную
docker-compose up -d
```

### 3. Запуск в разработке

```bash
# Копирование переменных для разработки
cp .env.development .env

# Запуск в режиме разработки
docker-compose -f docker-compose.dev.yml up -d
```

## 🔧 Управление

### Основные команды

```bash
# Статус сервисов
./deploy.sh status

# Мониторинг системы
./scripts/monitor.sh

# Непрерывный мониторинг
./scripts/monitor.sh watch

# Просмотр логов
docker-compose logs -f

# Перезапуск
./deploy.sh restart

# Остановка
./deploy.sh stop
```

### Резервное копирование

```bash
# Создание бэкапа
./scripts/backup.sh

# Восстановление
./scripts/restore.sh /app/backups/backup_20250702_120000.sql.gz
```

## 🌐 Доступ к сервисам

- **Frontend**: http://localhost:80 (https://localhost:443 с SSL)
- **Backend API**: http://localhost:3000
- **База данных**: localhost:3306
- **Redis**: localhost:6379

## 🔒 Безопасность

### Настроенные меры безопасности:

- ✅ Helmet.js для защиты HTTP заголовков
- ✅ CORS настроен правильно
- ✅ Rate limiting для API
- ✅ JWT аутентификация
- ✅ Хеширование паролей через bcrypt
- ✅ Валидация всех входных данных
- ✅ Запуск контейнеров без root прав
- ✅ SSL сертификаты (самоподписанные для разработки)

### Рекомендации для продакшна:

1. **Используйте реальные SSL сертификаты** (Let's Encrypt)
2. **Настройте фаервол** на сервере
3. **Регулярно обновляйте** зависимости
4. **Настройте мониторинг** и алерты
5. **Делайте регулярные бэкапы**

## 📊 Мониторинг

### Встроенные health checks:

- ✅ Backend API health endpoint
- ✅ Database connectivity check
- ✅ Frontend availability check
- ✅ Redis availability check

### Логирование:

- Все логи доступны через `docker-compose logs`
- Nginx логи с подробной информацией о запросах
- MySQL slow query log включен
- Автоматическая ротация логов

## 🔄 CI/CD

Для автоматического развертывания можно настроить:

```yaml
# Пример GitHub Actions
- name: Deploy to production
  run: |
    ./deploy.sh
    ./scripts/monitor.sh health
```

## 📈 Производительность

### Оптимизации:

- ✅ Gzip сжатие в Nginx
- ✅ Кеширование статических файлов
- ✅ Redis для кеширования данных
- ✅ Оптимизированные Docker образы
- ✅ MySQL настройки для производительности
- ✅ Соединение pooling

### Масштабирование:

Для горизонтального масштабирования:

```bash
# Запуск нескольких экземпляров backend
docker-compose up -d --scale backend=3
```

## 🛠️ Обслуживание

### Обновление:

```bash
# Обновление кода
git pull
./deploy.sh

# Обновление только backend
docker-compose build backend
docker-compose up -d backend

# Обновление только frontend
docker-compose build frontend
docker-compose up -d frontend
```

### Очистка:

```bash
# Полная очистка (УДАЛЯЕТ ВСЕ ДАННЫЕ!)
./deploy.sh clean
```

## 🆘 Устранение неполадок

### Частые проблемы:

1. **Контейнер не запускается**: Проверьте логи `docker-compose logs [service]`
2. **База данных недоступна**: Убедитесь, что MySQL контейнер запущен
3. **502 ошибка**: Backend недоступен, проверьте его статус
4. **Нет доступа к файлам**: Проверьте права доступа к volumes

### Отладка:

```bash
# Подключение к контейнеру
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db mysql -u root -p

# Проверка сетевого подключения
docker-compose exec backend ping db
docker-compose exec frontend ping backend
```

---

## 📞 Поддержка

Для получения помощи:

1. Проверьте логи: `docker-compose logs`
2. Запустите мониторинг: `./scripts/monitor.sh`
3. Проверьте конфигурацию в `.env` файле

**Проект готов к продакшну! 🎉**
