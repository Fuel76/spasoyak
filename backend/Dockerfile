# Dockerfile для Backend
FROM node:18-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копирование файлов зависимостей
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Генерация Prisma Client
RUN pnpm prisma generate

# Сборка приложения
RUN pnpm build

# Production стадия
FROM node:18-alpine AS production

# Установка pnpm и необходимых утилит
RUN npm install -g pnpm && \
    apk add --no-cache curl

WORKDIR /app

# Копирование файлов зависимостей
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Установка только production зависимостей
RUN pnpm install --frozen-lockfile --prod

# Копирование собранного приложения
COPY --from=base /app/dist ./dist

# Генерация Prisma Client
RUN pnpm prisma generate

# Создание пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Создание директорий для uploads и backups
RUN mkdir -p /app/uploads /app/backups && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose порт
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Запуск приложения
CMD ["node", "dist/index.js"]
