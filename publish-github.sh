#!/bin/bash

# =============================================================================
# GITHUB PUBLICATION SCRIPT FOR MONASTYR PROJECT
# =============================================================================

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

header() {
    echo -e "${CYAN}$1${NC}"
}

clear

header "🐙 MONASTYR PROJECT - ПУБЛИКАЦИЯ НА GITHUB"
header "============================================"
echo ""

# Проверка текущего состояния
info "Проверка текущего состояния Git..."

if [ -n "$(git status --porcelain)" ]; then
    warning "Есть незафиксированные изменения. Хотите их зафиксировать? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        echo "Введите сообщение коммита:"
        read -r commit_message
        git commit -m "$commit_message"
        success "Изменения зафиксированы"
    else
        warning "Продолжаем с незафиксированными изменениями..."
    fi
fi

# Запрос информации о GitHub репозитории
echo ""
info "Настройка GitHub репозитория..."

# Проверка, есть ли уже GitHub remote
if git remote get-url github >/dev/null 2>&1; then
    current_github_url=$(git remote get-url github)
    info "GitHub remote уже настроен: $current_github_url"
    
    warning "Хотите изменить URL GitHub репозитория? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Введите новый URL GitHub репозитория (https://github.com/username/repo.git): " github_url
        git remote set-url github "$github_url"
        success "GitHub remote обновлен"
    fi
else
    read -p "Введите URL GitHub репозитория (https://github.com/username/repo.git): " github_url
    
    if [ -z "$github_url" ]; then
        error "URL не может быть пустым"
        exit 1
    fi
    
    git remote add github "$github_url"
    success "GitHub remote добавлен"
fi

# Выбор ветки для публикации
echo ""
info "Выбор ветки для публикации..."

echo "Доступные ветки:"
git branch -a

echo ""
current_branch=$(git branch --show-current)
info "Текущая ветка: $current_branch"

echo ""
echo "Какую ветку хотите опубликовать на GitHub?"
echo "1) Текущую ветку ($current_branch)"
echo "2) Создать новую ветку main"
echo "3) Указать другую ветку"

read -p "Выберите опцию (1-3): " branch_choice

case $branch_choice in
    1)
        target_branch="$current_branch"
        ;;
    2)
        info "Создание новой ветки main..."
        git checkout -b main 2>/dev/null || git checkout main
        target_branch="main"
        ;;
    3)
        read -p "Введите название ветки: " target_branch
        if ! git rev-parse --verify "$target_branch" >/dev/null 2>&1; then
            warning "Ветка $target_branch не существует. Создать её? (y/n)"
            read -p "" -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git checkout -b "$target_branch"
            else
                error "Ветка не найдена"
                exit 1
            fi
        fi
        git checkout "$target_branch"
        ;;
    *)
        error "Неверный выбор"
        exit 1
        ;;
esac

success "Выбрана ветка: $target_branch"

# Проверка и подготовка файлов
echo ""
info "Проверка важных файлов..."

# Проверка README.md
if [ ! -f README.md ]; then
    warning "README.md не найден. Создать базовый README? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "# Monastyr Project" > README.md
        echo "" >> README.md
        echo "Веб-приложение для управления сайтом монастыря." >> README.md
        git add README.md
    fi
fi

# Проверка LICENSE
if [ ! -f LICENSE ]; then
    warning "LICENSE не найден. Создать MIT лицензию? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2025 Monastyr Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
        git add LICENSE
    fi
fi

# Публикация на GitHub
echo ""
info "Публикация на GitHub..."

echo "Готовы опубликовать проект на GitHub? (y/n)"
read -p "" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Публикация отменена"
    exit 0
fi

# Проверка наличия изменений для коммита
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "📝 Подготовка файлов для GitHub публикации"
fi

# Push на GitHub
info "Отправка кода на GitHub..."

if git push github "$target_branch" 2>&1; then
    success "🎉 Код успешно отправлен на GitHub!"
else
    warning "Возможно, нужна принудительная отправка (если история отличается)"
    echo "Хотите выполнить принудительную отправку? (y/n)"
    read -p "" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push --force github "$target_branch"
        success "🎉 Код успешно отправлен на GitHub (принудительно)!"
    else
        error "Публикация прервана"
        exit 1
    fi
fi

# Установка GitHub как основной remote (опционально)
echo ""
warning "Хотите сделать GitHub основным репозиторием? (y/n)"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git remote rename origin sourcecraft
    git remote rename github origin
    success "GitHub теперь основной репозиторий (origin)"
    info "Sourcecraft доступен как 'sourcecraft'"
fi

# Создание теггов
echo ""
info "Создание тегга версии..."
echo "Хотите создать тег релиза? (y/n)"
read -p "" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Введите версию (например, v1.0.0): " version
    if [ -n "$version" ]; then
        git tag -a "$version" -m "Release $version"
        git push github "$version"
        success "Тег $version создан и отправлен"
    fi
fi

echo ""
header "🎉 ПУБЛИКАЦИЯ ЗАВЕРШЕНА!"
header "======================="
echo ""

github_url=$(git remote get-url github)
repo_name=$(basename -s .git "$github_url")
username=$(basename $(dirname "$github_url"))

echo "🔗 Ваш репозиторий: $github_url"
echo "👤 Пользователь: $username"
echo "📦 Репозиторий: $repo_name"
echo "🌿 Ветка: $target_branch"
echo ""

echo "📋 Следующие шаги:"
echo "1. Перейдите на GitHub и проверьте, что код загружен"
echo "2. Настройте описание репозитория"
echo "3. Добавьте темы (topics) для лучшего поиска"
echo "4. Настройте GitHub Actions для CI/CD (опционально)"
echo "5. Создайте Release на GitHub (опционально)"
echo ""

echo "🛠️ Полезные команды для работы с GitHub:"
echo "git push github main              # Отправка в GitHub"
echo "git pull github main              # Получение изменений"
echo "git push --all github             # Отправка всех веток"
echo "git push --tags github            # Отправка всех тегов"
echo ""

success "Проект успешно опубликован на GitHub! 🐙"
