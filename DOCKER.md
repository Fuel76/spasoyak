# Docker Развертывание Проекта Monastyr

Этот документ описывает, как развернуть проект Monastyr с помощью Docker.

## Предварительные требования

- Docker 20.10 или выше
- Docker Compose 2.0 или выше
- Минимум 4GB свободной памяти
- Минимум 10GB свободного места на диске

## Быстрый старт

### 1. Продакшн развертывание

```bash
# Клонируйте репозиторий
git clone <your-repo-url>
cd monastyr

# Запустите автоматическое развертывание
./deploy.sh
```

### 2. Развертывание для разработки

```bash
# Запустите только базу данных в Docker
./dev-setup.sh

# В отдельных терминалах запустите:
# Backend
cd backend && pnpm dev

# Frontend
cd webapp && pnpm dev
```

## Структура Docker

### Сервисы

1. **database** - MySQL 8.0 база данных
2. **backend** - Node.js API сервер
3. **frontend** - React приложение (статика в nginx)
4. **nginx** - Обратный прокси (опционально)

### Порты

- `80` - Nginx (главный вход)
- `3000` - Frontend (напрямую)
- `3001` - Backend API
- `3306` - MySQL база данных

## Конфигурация

### Переменные окружения

Основные переменные в `.env`:

```bash
# База данных
DATABASE_URL=mysql://monastyr_user:monastyr_password@database:3306/monastyr_db

# JWT безопасность
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Окружение
NODE_ENV=production

# API порт
PORT=3001
```

### Настройка безопасности

**ВАЖНО**: Перед продакшн развертыванием:

1. Измените пароли базы данных в `docker-compose.yml`
2. Установите надежный `JWT_SECRET` в `.env`
3. Смените `ADMIN_REGISTRATION_KEY`
4. Настройте SSL сертификаты в `nginx.conf`

## Управление

### Основные команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f

# Перезапуск конкретного сервиса
docker-compose restart backend

# Обновление образов
docker-compose up --build -d

# Просмотр статуса
docker-compose ps
```

### Работа с базой данных

```bash
# Подключение к MySQL
docker-compose exec database mysql -u monastyr_user -p monastyr_db

# Выполнение миграций вручную
docker-compose exec backend pnpm prisma migrate deploy

# Заполнение тестовыми данными
docker-compose exec backend pnpm run seed
```

### Бэкапы

```bash
# Создание бэкапа базы данных
docker-compose exec database mysqldump -u monastyr_user -p monastyr_db > backup.sql

# Восстановление из бэкапа
docker-compose exec -T database mysql -u monastyr_user -p monastyr_db < backup.sql
```

## Мониторинг

### Логи

```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

### Проверка здоровья

```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Проверка подключения к API
curl http://localhost:3001/api/pages
```

## Развертывание на сервере

### 1. Подготовка сервера

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io docker-compose-plugin

# Запуск Docker
sudo systemctl start docker
sudo systemctl enable docker

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### 2. Настройка SSL (рекомендуется)

```bash
# Создайте директорию для сертификатов
mkdir ssl

# Получите сертификаты Let's Encrypt или разместите свои
# cp /path/to/your/cert.pem ssl/
# cp /path/to/your/key.pem ssl/
```

### 3. Настройка доменного имени

Обновите `nginx.conf`:

```nginx
server_name your-domain.com www.your-domain.com;
```

## Траблшутинг

### Частые проблемы

1. **Ошибка подключения к базе данных**
   ```bash
   # Проверьте, запущена ли база данных
   docker-compose ps database
   
   # Проверьте логи
   docker-compose logs database
   ```

2. **Ошибки миграций Prisma**
   ```bash
   # Сброс и повторное выполнение миграций
   docker-compose exec backend pnpm prisma migrate reset
   ```

3. **Проблемы с правами файлов**
   ```bash
   # Исправление прав на uploads
   sudo chown -R 1000:1000 backend/uploads
   ```

4. **Нехватка памяти**
   ```bash
   # Увеличьте лимиты в docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 512M
   ```

### Очистка

```bash
# Остановка и удаление всех контейнеров
docker-compose down

# Удаление данных (ВНИМАНИЕ: удалит базу данных!)
docker-compose down -v

# Очистка неиспользуемых образов
docker system prune -a
```

## Обновление

```bash
# Получение обновлений
git pull origin main

# Пересборка и перезапуск
docker-compose up --build -d

# Выполнение новых миграций (если есть)
docker-compose exec backend pnpm prisma migrate deploy
```

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs -f`
2. Убедитесь, что все порты свободны
3. Проверьте переменные окружения в `.env`
4. Убедитесь, что Docker имеет достаточно ресурсов
