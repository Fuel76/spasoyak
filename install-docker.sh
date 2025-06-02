#!/bin/bash

# Скрипт установки Docker для Ubuntu/Debian

echo "🐳 Установка Docker..."

# Обновляем пакеты
sudo apt update

# Устанавливаем необходимые пакеты
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавляем GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновляем пакеты снова
sudo apt update

# Устанавливаем Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Запускаем Docker
sudo systemctl start docker
sudo systemctl enable docker

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

echo "✅ Docker установлен!"
echo ""
echo "⚠️  ВАЖНО: Перезагрузите терминал или выполните:"
echo "   newgrp docker"
echo ""
echo "🚀 После этого запустите:"
echo "   ./deploy.sh"
echo ""
