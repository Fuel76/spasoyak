# Руководство по развертыванию в production

## 📋 Предпродакшн аудит завершен

### ✅ Проверенные аспекты

#### 1. Безопасность зависимостей

- **Статус**: ✅ ИСПРАВЛЕНО
- Удалена уязвимая зависимость `react-quill` с XSS уязвимостью
- Все остальные зависимости безопасны
- Используется безопасный редактор `suneditor-react`

#### 2. Структура проекта

- **Backend**: Express.js + TypeScript + Prisma + MySQL
- **Frontend**: React + TypeScript + Vite + tRPC
- **Размер production build**: 3.8MB (оптимизирован)
- **Общий размер проекта**: 677MB (включая node_modules)

#### 3. Система аутентификации и авторизации

- **JWT токены**: ✅ Корректно настроены
- **Хеширование паролей**: ✅ bcrypt с солью
- **Middleware авторизации**: ✅ Полная защита
- **Роли пользователей**: admin/user с правильной проверкой
- **CORS**: ✅ Настроен для production

#### 4. Конфигурация безопасности

- **Helmet.js**: Установлен для базовой защиты headers
- **Rate limiting**: ⚠️ НЕ НАСТРОЕН (рекомендуется добавить)
- **Environment variables**: ✅ Правильно настроены
- **Admin registration key**: ✅ Защищен секретным ключом

#### 5. Production Build

- **Status**: ✅ УСПЕШНО
- Сборка проходит без ошибок
- Все модули корректно трансформированы
- Предупреждение о размере chunks (решается code-splitting)

---

## 🚀 Инструкции по развертыванию

### 1. Подготовка сервера

#### Минимальные требования:

- **Node.js**: 16+ (рекомендуется 18+)
- **RAM**: 2GB минимум, 4GB рекомендуется
- **HDD**: 10GB свободного места
- **MySQL**: 8.0+

#### Установка зависимостей:

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Node.js & npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL Server
sudo apt install mysql-server -y
sudo mysql_secure_installation

# PM2 для управления процессами
sudo npm install -g pm2 pnpm

# Nginx (веб-сервер)
sudo apt install nginx -y
```

### 2. Настройка базы данных

```sql
-- Подключение к MySQL
sudo mysql -u root -p

-- Создание базы данных
CREATE DATABASE monastyr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создание пользователя (ЗАМЕНИТЕ на реальные данные)
CREATE USER 'monastyr_user'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON monastyr.* TO 'monastyr_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Настройка backend

```bash
# Клонирование проекта
cd /var/www/
sudo git clone [URL_ВАШЕГО_РЕПОЗИТОРИЯ] monastyr
sudo chown -R $USER:$USER /var/www/monastyr
cd /var/www/monastyr

# Установка зависимостей
pnpm install

# Настройка production .env
cp backend/.env.example backend/.env
```

#### Обязательно обновить backend/.env:

```bash
# Production конфигурация
NODE_ENV=production
PORT=3000

# База данных (ЗАМЕНИТЕ на реальные данные)
DATABASE_URL="mysql://monastyr_user:SECURE_PASSWORD_HERE@localhost:3306/monastyr"

# JWT секреты (ГЕНЕРИРУЙТЕ НОВЫЕ!)
JWT_SECRET="[СГЕНЕРИРОВАТЬ_СЛУЧАЙНУЮ_СТРОКУ_64_СИМВОЛА]"
JWT_EXPIRES_IN="7d"

# Административный ключ (ГЕНЕРИРУЙТЕ НОВЫЙ!)
ADMIN_REGISTRATION_KEY="[СГЕНЕРИРОВАТЬ_СЛУЧАЙНУЮ_СТРОКУ]"

# Uploads
UPLOAD_DIR="/var/www/monastyr/uploads"
MAX_FILE_SIZE=10485760

# Frontend URL для CORS
FRONTEND_URL="https://yourdomain.com"
```

#### Генерация секретов:

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Admin Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Миграция базы данных:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 4. Сборка frontend

```bash
cd webapp

# Обновить конфигурацию API URL в коде для production
# В src/utils/apiClient.ts или аналогичном файле
# Изменить API_BASE_URL на ваш production URL

# Сборка для production
pnpm run build

# Проверка сборки
ls -la dist/
```

### 5. Настройка Nginx

```bash
sudo nano /etc/nginx/sites-available/monastyr
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend - статические файлы
    location / {
        root /var/www/monastyr/webapp/dist;
        try_files $uri $uri/ /index.html;

        # Кеширование статических ресурсов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # tRPC endpoint
    location /trpc/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        root /var/www/monastyr;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/monastyr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL сертификат (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автообновление сертификатов
sudo crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. Запуск с PM2

```bash
cd /var/www/monastyr/backend

# Создание ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'monastyr-backend',
    script: './dist/index.js',
    cwd: '/var/www/monastyr/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/monastyr-error.log',
    out_file: '/var/log/pm2/monastyr-out.log',
    log_file: '/var/log/pm2/monastyr-combined.log',
    time: true
  }]
};
EOF

# Сборка backend
pnpm run build

# Запуск
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Файрвол и безопасность

```bash
# UFW Firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw status

# Автоматические обновления безопасности
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 🔒 Рекомендации по безопасности

### 1. Rate Limiting (добавить в backend)

```bash
cd backend
pnpm add express-rate-limit
```

В `src/index.ts`:

```typescript
import rateLimit from 'express-rate-limit'

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с IP
  message: 'Слишком много запросов с этого IP',
})
app.use('/api/', limiter)

// Более строгий лимит для auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
})
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
```

### 2. Мониторинг логов

```bash
# Настройка logrotate
sudo nano /etc/logrotate.d/monastyr

# Содержимое:
/var/log/pm2/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Backup базы данных

```bash
# Создание скрипта backup
sudo nano /usr/local/bin/monastyr-backup.sh

#!/bin/bash
BACKUP_DIR="/var/backups/monastyr"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup базы данных
mysqldump -u monastyr_user -p monastyr > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /var/www/monastyr/uploads

# Удаление старых backup (>30 дней)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# Cron job (ежедневно в 2:00)
# 0 2 * * * /usr/local/bin/monastyr-backup.sh
```

---

## ✅ Чек-лист финального развертывания

- [ ] Сервер настроен и обновлен
- [ ] MySQL установлен и настроен
- [ ] База данных создана с правильными правами
- [ ] Backend .env настроен с production значениями
- [ ] Новые JWT_SECRET и ADMIN_REGISTRATION_KEY сгенерированы
- [ ] Prisma миграции выполнены
- [ ] Frontend собран для production
- [ ] API URLs обновлены в frontend коде
- [ ] Nginx настроен и протестирован
- [ ] SSL сертификат установлен
- [ ] PM2 запущен и настроен автозапуск
- [ ] Файрвол настроен
- [ ] Rate limiting добавлен
- [ ] Backup скрипт настроен
- [ ] Логи настроены и ротируются
- [ ] DNS записи настроены на ваш домен

---

## 🎯 Послеразвертывание

### 1. Тестирование

- Проверить доступность сайта по HTTPS
- Проверить работу API через браузер
- Протестировать аутентификацию
- Проверить загрузку файлов
- Тестировать админ-панель

### 2. Мониторинг

```bash
# Статус сервисов
pm2 status
sudo systemctl status nginx
sudo systemctl status mysql

# Логи
pm2 logs monastyr-backend
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 3. Регулярное обслуживание

- Еженедельная проверка логов
- Ежемесячное обновление зависимостей
- Проверка backup'ов
- Мониторинг использования диска/памяти

---

## 📞 Поддержка

После развертывания рекомендуется:

1. Настроить систему мониторинга (например, Uptime Robot)
2. Создать документацию для администраторов
3. Обучить ответственных лиц работе с админ-панелью
4. Настроить систему уведомлений об ошибках

**Проект готов к production развертыванию! ✨**
