# 🏛️ Спасо-Як - Веб-сайт для монастыря

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![React](https://img.shields.io/badge/React-19+-61DAFB.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Современное веб-приложение для управления сайтом монастыря с полным функционалом управления контентом, системой треб и православным календарем**

[Документация](./DOCKER_PRODUCTION_GUIDE.md) • [Установка](#-быстрая-установка)

</div>

## 📋 Обзор проекта

Веб-приложение предназначено для управления сайтом монастыря и включает в себя:

- 📰 **Система новостей** - создание, редактирование и публикация новостей с богатым текстовым редактором
- 📄 **Управление страницами** - создание статических страниц с настраиваемым содержимым
- 🙏 **Система треб** - прием и обработка заказов на церковные требы с гибким ценообразованием
- 📅 **Православный календарь** - календарь с праздниками, постами и расписанием богослужений
- 🖼️ **Галерея изображений** - управление медиа-контентом и каруселью изображений
- 👥 **Административная панель** - полнофункциональная система управления контентом
- 🔐 **Система аутентификации** - безопасная авторизация с JWT токенами

## 🛠️ Технический стек

### Backend
- **Node.js** + **Express.js** - серверная часть
- **TypeScript** - строгая типизация
- **Prisma ORM** - работа с базой данных
- **MySQL** - реляционная база данных
- **JWT** - аутентификация и авторизация
- **tRPC** - типобезопасные API

### Frontend
- **React 19** - пользовательский интерфейс
- **TypeScript** - типизация фронтенда
- **Vite** - быстрая сборка и разработка
- **React Router** - маршрутизация
- **TanStack Query** - управление состоянием и кешированием

### DevOps & Production
- **Docker** + **Docker Compose** - контейнеризация
- **Nginx** - веб-сервер и обратный прокси
- **Redis** - кеширование
- **SSL/HTTPS** - безопасное соединение

## 🚀 Быстрая установка

### Предварительные требования

- **Node.js** 18+ 
- **Docker** и **Docker Compose**
- **Git**

### 🐳 Запуск с Docker (рекомендуется)

```bash
# 1. Клонирование репозитория
git clone https://github.com/Fuel76/spasoyak.git
cd spasoyak

# 2. Быстрый интерактивный запуск
./quick-start.sh

# Или автоматический запуск в продакшне
./deploy.sh
```

### 🛠️ Ручная установка

```bash
# 1. Установка зависимостей
pnpm install

# 2. Настройка переменных окружения
cp .env.production .env
# Отредактируйте .env файл

# 3. Настройка базы данных
cd backend
pnpm prisma migrate deploy
pnpm seed

# 4. Запуск в разработке
pnpm dev
```

## 📖 Использование

### 🔧 Основные команды

```bash
# Управление через Makefile
make help           # Показать все команды
make prod           # Запуск в продакшне
make dev            # Запуск в разработке
make status         # Проверка статуса
make logs           # Просмотр логов
make backup         # Создание резервной копии
make ssl            # Настройка HTTPS

# Прямые команды
./deploy.sh         # Автоматическое развертывание
./scripts/monitor.sh # Мониторинг системы
./scripts/backup.sh  # Резервное копирование
```

### 🌐 Доступ к приложению

После запуска приложение доступно по адресам:

- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:3000
- **Админ панель**: http://localhost:80/admin

### 📊 Мониторинг

```bash
# Проверка статуса всех сервисов
make status

# Непрерывный мониторинг
./scripts/monitor.sh watch

# Просмотр логов
make logs
```

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React +      │◄──►│   (Express +    │◄──►│    (MySQL)      │
│   Nginx)        │    │   TypeScript)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                     ┌─────────────────┐
                     │     Redis       │
                     │   (Кеширование) │
                     └─────────────────┘
```

## 🔒 Безопасность

- ✅ **JWT аутентификация** с безопасными токенами
- ✅ **Хеширование паролей** через bcrypt
- ✅ **Rate limiting** для защиты от DDoS
- ✅ **CORS** правильно настроен
- ✅ **Helmet.js** для защиты HTTP заголовков
- ✅ **Валидация данных** на всех уровнях
- ✅ **HTTPS/SSL** поддержка
- ✅ **Контейнеры без root прав**

## 📈 Возможности

### Административная панель
- Управление новостями и статьями
- Редактирование страниц сайта
- Управление пользователями
- Настройка меню и навигации
- Управление галереей изображений

### Система треб
- Прием заявок на церковные требы
- Гибкое ценообразование
- Уведомления пользователей
- Календарь выполнения треб
- Статистика и отчеты

### Православный календарь
- Церковные праздники и посты
- Расписание богослужений
- Святцы и житии святых
- Евангельские и апостольские чтения

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Документация

- [Руководство по продакшну](./DOCKER_PRODUCTION_GUIDE.md)
- [Руководство по развертыванию](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [API документация](./backend/README.md)

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас возникли проблемы:

1. Проверьте [Issues](https://github.com/Fuel76/spasoyak/issues)
2. Изучите документацию
3. Создайте новый Issue с подробным описанием проблемы

## 📞 Контакты

- **Автор**: [Fuel76](https://github.com/Fuel76)
- **Email**: your.email@example.com
- **Telegram**: [@yourtelegram](https://t.me/yourtelegram)

---

<div align="center">

**Сделано с ❤️ для православных общин**

</div>
