-- Инициализация базы данных
CREATE DATABASE IF NOT EXISTS monastyr_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE monastyr_db;

-- Создание пользователя (если не существует)
-- CREATE USER IF NOT EXISTS 'monastyr_user'@'%' IDENTIFIED BY 'monastyr_password';
-- GRANT ALL PRIVILEGES ON monastyr_db.* TO 'monastyr_user'@'%';
-- FLUSH PRIVILEGES;
