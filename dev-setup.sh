#!/bin/bash

# Скрипт для развертывания в режиме разработки

echo "🛠️  Запуск проекта в режиме разработки..."

# Создаем docker-compose для разработки
cat > docker-compose.dev.yml << 'EOF'
version: '3.8'

services:
  # База данных MySQL для разработки
  database:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: monastyr_db
      MYSQL_USER: monastyr_user
      MYSQL_PASSWORD: monastyr_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_dev_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - monastyr_network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p$$MYSQL_ROOT_PASSWORD"]
      timeout: 20s
      retries: 10

volumes:
  mysql_dev_data:

networks:
  monastyr_network:
    driver: bridge
EOF

echo "🗄️  Запуск только базы данных для разработки..."
docker compose -f docker-compose.dev.yml up -d

echo "⏳ Ожидание запуска базы данных..."
sleep 20

echo ""
echo "✅ База данных готова для разработки!"
echo ""
echo "🔧 Теперь вы можете запустить приложения локально:"
echo "   - Backend: cd backend && pnpm dev"
echo "   - Frontend: cd webapp && pnpm dev"
echo ""
echo "🌐 Подключение к базе данных:"
echo "   DATABASE_URL=\"mysql://monastyr_user:monastyr_password@localhost:3306/monastyr_db\""
echo ""
echo "📝 Полезные команды:"
echo "   - Остановка БД: docker compose -f docker-compose.dev.yml down"
echo "   - Логи БД: docker compose -f docker-compose.dev.yml logs -f database"
echo ""
