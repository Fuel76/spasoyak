# Инструкция по управлению проектом на сервере (Debian, RUVDS)

## 1. Сборка и деплой фронтенда (webapp)

1. Перейти в папку фронта:
   ```bash
   cd /home/danya/Документы/monastyr/webapp
   ```
2. Установить зависимости (один раз или после обновления):
   ```bash
   pnpm install
   # или
   npm install
   ```
3. Собрать фронтенд:
   ```bash
   pnpm build
   # или
   npm run build
   ```
4. Убедиться, что папка `dist` скопирована/доступна для nginx (обычно `/var/www/monastyr/webapp/dist` или аналогично).

## 2. Управление backend (Express + Prisma)

1. Перейти в папку backend:
   ```bash
   cd /home/danya/Документы/monastyr/backend
   ```
2. Установить зависимости (один раз или после обновления):
   ```bash
   pnpm install
   # или
   npm install
   ```
3. Собрать backend:
   ```bash
   pnpm build
   # или
   npm run build
   ```
4. Запустить backend через pm2:
   ```bash
   pm2 start dist/index.js --name monastyr-backend
   ```
5. Перезапустить backend (после изменений):
   ```bash
   pm2 restart monastyr-backend
   ```
6. Посмотреть логи backend:
   ```bash
   pm2 logs monastyr-backend
   ```
7. Остановить backend:
   ```bash
   pm2 stop monastyr-backend
   ```

## 3. Управление pm2

- Список процессов:
  ```bash
  pm2 list
  ```
- Удалить процесс:
  ```bash
  pm2 delete monastyr-backend
  ```
- Сделать автозапуск pm2 при перезагрузке сервера:
  ```bash
  pm2 startup
  pm2 save
  ```

## 4. Работа с базой данных (Prisma + MySQL/MariaDB)

- Применить миграции:
  ```bash
  pnpm prisma migrate deploy
  # или
  npx prisma migrate deploy
  ```
- Открыть Prisma Studio:
  ```bash
  pnpm prisma studio
  # или
  npx prisma studio
  ```

## 5. Переменные окружения

- Файл backend: `/home/danya/Документы/monastyr/backend/.env`
- Файл frontend: `/home/danya/Документы/monastyr/webapp/.env`

## 6. Перезапуск nginx (если меняли конфиг или dist)

```bash
sudo systemctl reload nginx
```

## 7. Проверка работы

- Проверить, что backend слушает порт 3000:
  ```bash
  curl -I http://127.0.0.1:3000/api/pages
  ```
- Проверить, что nginx отдаёт фронт и проксирует API:
  ```bash
  curl -I http://<ваш-домен>/api/pages
  curl -I http://<ваш-домен>/
  ```

---

**Внимание:**
- Все запросы с фронта должны идти на `/api/...` (относительный путь), чтобы работал nginx-прокси и не было CORS-ошибок.
- После изменения переменных окружения или кода — пересобирайте соответствующую часть (frontend/backend) и перезапускайте pm2/nginx.

---

Для вопросов и отладки используйте логи pm2 и nginx, а также консоль браузера для проверки запросов.
