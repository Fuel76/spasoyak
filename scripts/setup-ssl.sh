#!/bin/bash

# =============================================================================
# SSL SETUP SCRIPT FOR MONASTYR PROJECT
# =============================================================================

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Создание директории для SSL
mkdir -p ssl

info "Настройка SSL сертификатов для HTTPS..."

# Проверка, есть ли уже сертификаты
if [ -f ssl/cert.pem ] && [ -f ssl/key.pem ]; then
    warning "SSL сертификаты уже существуют. Хотите перегенерировать? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Использую существующие сертификаты"
        exit 0
    fi
fi

echo "Выберите тип SSL сертификата:"
echo "1) Самоподписанный сертификат (для разработки/тестирования)"
echo "2) Let's Encrypt сертификат (для продакшна)"
echo "3) Использовать существующие сертификаты"
read -p "Выберите опцию (1-3): " choice

case $choice in
    1)
        info "Создание самоподписанного SSL сертификата..."
        
        # Запрос информации для сертификата
        read -p "Введите домен (например, localhost или example.com): " domain
        domain=${domain:-localhost}
        
        # Создание самоподписанного сертификата
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=RU/ST=Moscow/L=Moscow/O=Monastery/OU=IT/CN=$domain" \
            -addext "subjectAltName=DNS:$domain,DNS:www.$domain,DNS:localhost,IP:127.0.0.1"
        
        success "Самоподписанный SSL сертификат создан"
        warning "⚠️  Браузер будет показывать предупреждение о безопасности"
        warning "⚠️  Для продакшна используйте Let's Encrypt"
        ;;
    
    2)
        info "Настройка Let's Encrypt сертификата..."
        
        # Проверка установки certbot
        if ! command -v certbot &> /dev/null; then
            info "Установка certbot..."
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        read -p "Введите ваш домен: " domain
        read -p "Введите ваш email: " email
        
        if [ -z "$domain" ] || [ -z "$email" ]; then
            error "Домен и email обязательны для Let's Encrypt"
            exit 1
        fi
        
        # Получение сертификата
        sudo certbot certonly --standalone -d "$domain" --email "$email" --agree-tos --non-interactive
        
        # Копирование сертификатов
        sudo cp /etc/letsencrypt/live/$domain/fullchain.pem ssl/cert.pem
        sudo cp /etc/letsencrypt/live/$domain/privkey.pem ssl/key.pem
        
        # Настройка прав доступа
        sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
        
        success "Let's Encrypt сертификат настроен"
        info "Не забудьте настроить автоматическое обновление сертификатов"
        ;;
    
    3)
        info "Использование существующих сертификатов..."
        
        read -p "Путь к файлу сертификата (.crt или .pem): " cert_path
        read -p "Путь к приватному ключу (.key или .pem): " key_path
        
        if [ ! -f "$cert_path" ] || [ ! -f "$key_path" ]; then
            error "Файлы сертификата не найдены"
            exit 1
        fi
        
        cp "$cert_path" ssl/cert.pem
        cp "$key_path" ssl/key.pem
        
        success "Существующие сертификаты скопированы"
        ;;
    
    *)
        error "Неверный выбор"
        exit 1
        ;;
esac

# Проверка сертификатов
info "Проверка SSL сертификатов..."

if openssl x509 -in ssl/cert.pem -text -noout > /dev/null 2>&1; then
    success "Сертификат валиден"
    
    # Показать информацию о сертификате
    echo ""
    echo "=== ИНФОРМАЦИЯ О СЕРТИФИКАТЕ ==="
    openssl x509 -in ssl/cert.pem -noout -subject -dates -issuer
    echo ""
else
    error "Сертификат невалиден"
    exit 1
fi

# Обновление docker-compose.yml для HTTPS
if [ ! -f docker-compose.https.yml ]; then
    info "Создание конфигурации для HTTPS..."
    
    cat > docker-compose.https.yml << 'EOF'
# HTTPS конфигурация для docker-compose
# Используйте: docker-compose -f docker-compose.yml -f docker-compose.https.yml up -d

version: '3.8'

services:
  frontend:
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl:ro
      - ./nginx/nginx-https.conf:/etc/nginx/nginx.conf:ro
EOF
    
    success "Файл docker-compose.https.yml создан"
fi

# Создание конфигурации Nginx для HTTPS
if [ ! -f nginx/nginx-https.conf ]; then
    info "Создание конфигурации Nginx для HTTPS..."
    
    mkdir -p nginx
    
    cat > nginx/nginx-https.conf << 'EOF'
user nginxuser;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # SSL protocols and ciphers
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;

        # API proxying
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }

        # Auth API with stricter rate limiting
        location /api/auth {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files with caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-XSS-Protection "1; mode=block" always;
            add_header X-Content-Type-Options "nosniff" always;
        }

        # React Router (SPA)
        location / {
            try_files $uri $uri/ /index.html;
            add_header X-Frame-Options "SAMEORIGIN" always;
            add_header X-XSS-Protection "1; mode=block" always;
            add_header X-Content-Type-Options "nosniff" always;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Block hidden files
        location ~ /\. {
            deny all;
        }
    }
}
EOF
    
    success "Конфигурация Nginx для HTTPS создана"
fi

echo ""
echo "=================================="
echo "🔒 SSL НАСТРОЙКА ЗАВЕРШЕНА"
echo "=================================="
echo ""
echo "📄 Файлы созданы:"
echo "  ssl/cert.pem                 # SSL сертификат"
echo "  ssl/key.pem                  # Приватный ключ"
echo "  docker-compose.https.yml     # HTTPS конфигурация"
echo "  nginx/nginx-https.conf       # Nginx HTTPS конфигурация"
echo ""
echo "🚀 Запуск с HTTPS:"
echo "  docker-compose -f docker-compose.yml -f docker-compose.https.yml up -d"
echo ""
echo "🌐 Доступ:"
echo "  HTTP:  http://localhost"
echo "  HTTPS: https://localhost"
echo ""
success "SSL настройка завершена успешно!"
