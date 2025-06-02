# Frontend Dockerfile
FROM node:18-alpine AS base

# Установка pnpm
RUN npm install -g pnpm

WORKDIR /app

# Копируем файлы workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Копируем frontend и backend package.json для типов
COPY webapp/package.json webapp/
COPY webapp/tsconfig*.json webapp/
COPY webapp/vite.config.ts webapp/
COPY backend/package.json backend/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем весь код frontend
COPY webapp/ webapp/

# Копируем backend src для типов (если нужно)
COPY backend/src/ backend/src/

WORKDIR /app/webapp

# Собираем приложение
RUN pnpm build

# Production stage - используем nginx для раздачи статики
FROM nginx:alpine AS production

# Копируем собранное приложение
COPY --from=base /app/webapp/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
