# 🚀 Инструкция по развертыванию проекта Monastyr через Docker

## Что было создано

Я создал полную Docker-конфигурацию для вашего проекта:

### 📁 Основные файлы:
- `docker-compose.yml` - Основная конфигурация всех сервисов
- `backend/Dockerfile` - Образ для Node.js backend
- `webapp/Dockerfile` - Образ для React frontend
- `nginx.conf` - Конфигурация прокси-сервера
- `init.sql` - Инициализация MySQL базы данных
- `.env.docker` - Переменные окружения для Docker

### 🛠️ Вспомогательные скрипты:
- `deploy.sh` - Автоматическое развертывание в продакшн
- `dev-setup.sh` - Настройка для разработки (только БД в Docker)
- `install-docker.sh` - Установка Docker в Ubuntu/Debian

### 📚 Документация:
- `DOCKER.md` - Подробная инструкция по использованию

## 🎯 Как запустить проект

### Шаг 1: Установите Docker (если не установлен)

```bash
# Автоматическая установка для Ubuntu/Debian
./install-docker.sh

# После установки перезагрузите терминал или выполните:
newgrp docker
```

### Шаг 2: Запустите проект

```bash
# Полное развертывание в продакшн
./deploy.sh
```

### Шаг 3: Откройте в браузере

После успешного запуска ваш сайт будет доступен по адресам:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Nginx**: http://localhost (если включен)

## 🔧 Режимы работы

### Продакшн (полное развертывание)
```bash
./deploy.sh
```
Запускает все сервисы в Docker: база данных, backend, frontend, nginx.

### Разработка (hybrid режим)
```bash
./dev-setup.sh
```
Запускает только базу данных в Docker, backend и frontend запускаются локально.

Затем в отдельных терминалах:
```bash
# Backend
cd backend && pnpm dev

# Frontend  
cd webapp && pnpm dev
```

## 🛡️ Настройка безопасности

**ВАЖНО**: Перед продакшн развертыванием:

1. Скопируйте `.env.docker` в `.env` и измените:
   ```bash
   cp .env.docker .env
   nano .env
   ```

2. Обязательно смените:
   - `JWT_SECRET` - секретный ключ для JWT токенов
   - `MYSQL_ROOT_PASSWORD` - пароль root MySQL
   - `MYSQL_PASSWORD` - пароль пользователя MySQL
   - `ADMIN_REGISTRATION_KEY` - ключ для регистрации админа

## 📊 Управление проектом

```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Обновление (пересборка)
docker-compose up --build -d
```

## 🗄️ Работа с базой данных

```bash
# Подключение к MySQL
docker-compose exec database mysql -u monastyr_user -p

# Выполнение миграций
docker-compose exec backend pnpm prisma migrate deploy

# Заполнение тестовыми данными
docker-compose exec backend pnpm run seed
```

## 🚨 Решение проблем

Если что-то не работает:

1. **Проверьте Docker**:
   ```bash
   docker --version
   docker-compose --version
   ```

2. **Проверьте логи**:
   ```bash
   docker-compose logs -f
   ```

3. **Проверьте порты** (не должны быть заняты):
   - 3306 (MySQL)
   - 3001 (Backend)
   - 3000 (Frontend)
   - 80 (Nginx)

4. **Полная перезагрузка**:
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## 🌐 Развертывание на сервере

Для развертывания на удаленном сервере:

1. Установите Docker на сервере
2. Клонируйте репозиторий
3. Настройте домен в `nginx.conf`
4. Получите SSL сертификаты
5. Запустите `./deploy.sh`

Подробная инструкция в файле `DOCKER.md`.

---

**Готово!** Ваш проект теперь полностью готов к развертыванию через Docker! 🎉
