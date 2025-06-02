# Backend Dockerfile
FROM node:18-alpine AS base

# Включаем corepack для использования pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Установка рабочей директории
WORKDIR /app

# Копируем файлы workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Копируем backend package.json
COPY backend/package.json backend/
COPY backend/tsconfig.json backend/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем весь backend код
COPY backend/ backend/

# Генерируем Prisma клиент
WORKDIR /app/backend
RUN pnpm prisma generate

# Собираем приложение
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Включаем corepack для использования pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate
# Устанавливаем wget для health check
RUN apk add --no-cache wget

WORKDIR /app

# Копируем файлы package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/

# Устанавливаем только production зависимости
RUN pnpm install --prod --frozen-lockfile

# Копируем собранное приложение и Prisma файлы
COPY --from=base /app/backend/dist backend/dist
COPY --from=base /app/backend/prisma backend/prisma
COPY --from=base /app/backend/node_modules/.pnpm backend/node_modules/.pnpm
COPY --from=base /app/backend/node_modules/@prisma backend/node_modules/@prisma

# Создаем директорию для uploads
RUN mkdir -p /app/uploads

# Устанавливаем права
RUN chown -R node:node /app
USER node

WORKDIR /app/backend

EXPOSE 3001

# Запускаем миграции и сервер
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/index.js"]
