# Dockerfile для Frontend
FROM node:18-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копирование файлов зависимостей
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Build аргументы
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Сборка приложения
RUN pnpm build

# Production стадия с Nginx
FROM nginx:alpine AS production

# Установка curl для health checks
RUN apk add --no-cache curl

# Копирование собранного приложения
COPY --from=base /app/dist /usr/share/nginx/html

# Копирование конфигурации nginx (будет создана отдельно)
COPY nginx.conf /etc/nginx/nginx.conf

# Создание пользователя без root прав
RUN adduser -D -s /bin/sh nginxuser

# Настройка прав доступа
RUN chown -R nginxuser:nginxuser /usr/share/nginx/html && \
    chown -R nginxuser:nginxuser /var/cache/nginx && \
    chown -R nginxuser:nginxuser /var/log/nginx && \
    chown -R nginxuser:nginxuser /etc/nginx/conf.d

# Создание директорий для PID файлов
RUN touch /var/run/nginx.pid && \
    chown -R nginxuser:nginxuser /var/run/nginx.pid

USER nginxuser

# Expose порты
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80 || exit 1

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
