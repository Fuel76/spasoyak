#!/bin/bash

# =============================================================================
# ПОДГОТОВКА ПРОЕКТА ДЛЯ РАЗВЕРТЫВАНИЯ НА AMVERA
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

header "🚀 ПОДГОТОВКА SPASOYAK ДЛЯ AMVERA"
header "================================="
echo ""

info "Начинаю подготовку проекта для развертывания на Amvera..."

# 1. Копирование Amvera-специфичных файлов
info "1. Настройка конфигурации для Amvera..."

# Создаем резервную копию оригинального docker-compose.yml
if [ -f docker-compose.yml ] && [ ! -f docker-compose.original.yml ]; then
    cp docker-compose.yml docker-compose.original.yml
    info "Создана резервная копия docker-compose.yml"
fi

# Копируем docker-compose для Amvera (без volumes)
if [ -f docker-compose.amvera.yml ]; then
    cp docker-compose.amvera.yml docker-compose.yml
    success "Скопирован docker-compose.yml для Amvera (без volumes)"
else
    error "Файл docker-compose.amvera.yml не найден!"
    exit 1
fi

# 2. Настройка переменных окружения
info "2. Настройка переменных окружения..."

if [ ! -f .env ]; then
    if [ -f .env.amvera ]; then
        cp .env.amvera .env
        warning "Создан .env файл из шаблона Amvera"
        warning "⚠️  ВАЖНО: Обновите FRONTEND_URL и VITE_API_URL с вашим доменом Amvera!"
    else
        error "Шаблон .env.amvera не найден!"
        exit 1
    fi
else
    warning ".env файл уже существует"
    warning "Проверьте, что настройки подходят для Amvera"
fi

# 3. Проверка Dockerfile для Amvera
info "3. Проверка Dockerfile для Amvera..."

if [ ! -f backend/Dockerfile.amvera ]; then
    error "Файл backend/Dockerfile.amvera не найден!"
    exit 1
fi

if [ ! -f webapp/Dockerfile.amvera ]; then
    error "Файл webapp/Dockerfile.amvera не найден!"
    exit 1
fi

success "Dockerfile для Amvera найдены"

# 4. Создание .amveraignore
info "4. Создание .amveraignore..."

cat > .amveraignore << 'EOF'
# Игнорируем файлы, не нужные для Amvera
node_modules/
.git/
.env.local
.env.development
.env.production
.env.original
docker-compose.original.yml
*.log
backups/
uploads/
mysql_data/
redis_data/
ssl/
scripts/
.github/
*.md
docker-compose.dev.yml
deploy.sh
quick-start.sh
install-docker.sh
dev-setup.sh
Makefile
prepare-amvera.sh
publish-github.sh
EOF

success ".amveraignore создан"

# 5. Валидация конфигурации
info "5. Валидация конфигурации..."

# Проверяем синтаксис docker-compose
if command -v docker-compose &> /dev/null; then
    if docker-compose config > /dev/null 2>&1; then
        success "docker-compose.yml валиден"
    else
        error "Ошибка в docker-compose.yml"
        docker-compose config
        exit 1
    fi
else
    warning "docker-compose не установлен, пропускаем валидацию"
fi

# 6. Создание README для Amvera
info "6. Создание инструкций для Amvera..."

cat > AMVERA_DEPLOY.md << 'EOF'
# 🚀 Развертывание Spasoyak на Amvera

## Подготовка завершена!

Проект готов к развертыванию на платформе Amvera.

### 📋 Что было настроено:

1. ✅ **docker-compose.yml** - без volumes (требование Amvera)
2. ✅ **.env** - переменные окружения для продакшна
3. ✅ **Dockerfile.amvera** - оптимизированные образы
4. ✅ **.amveraignore** - исключения для деплоя

### 🔧 Следующие шаги:

1. **Обновите домен в .env**:
   ```bash
   FRONTEND_URL=https://ваш-домен.amvera.io
   VITE_API_URL=https://ваш-домен.amvera.io
   ```

2. **Загрузите проект на Amvera**:
   - Подключите ваш Git репозиторий
   - Или загрузите архив проекта

3. **Запустите развертывание**:
   - Amvera автоматически использует docker-compose.yml
   - Процесс займет 5-10 минут

### 🌐 После развертывания:

- **Frontend**: https://ваш-домен.amvera.io
- **Backend API**: https://ваш-домен.amvera.io/api
- **Админ панель**: https://ваш-домен.amvera.io/admin

### ⚠️ Важные особенности Amvera:

- **Эфемерное хранилище**: файлы загружаются в /tmp/uploads
- **Без volumes**: данные не сохраняются между перезапусками
- **Автоматические бэкапы**: используйте API для резервных копий

### 🔐 Доступ администратора:

- **Ключ регистрации**: указан в переменной ADMIN_REGISTRATION_KEY
- **Первый вход**: /admin/register с ключом

### 📞 Поддержка:

Если возникли проблемы:
1. Проверьте логи в панели Amvera
2. Убедитесь, что все переменные окружения настроены
3. Проверьте статус сервисов в docker-compose

---

**Проект готов к развертыванию! 🎉**
EOF

success "AMVERA_DEPLOY.md создан"

echo ""
header "🎉 ПОДГОТОВКА ЗАВЕРШЕНА!"
header "======================="
echo ""

success "Проект Spasoyak готов к развертыванию на Amvera!"
echo ""

echo "📋 Что готово:"
echo "  ✅ docker-compose.yml (без volumes)"
echo "  ✅ .env (настройте домен)"
echo "  ✅ Dockerfile.amvera"
echo "  ✅ .amveraignore"
echo "  ✅ Документация"
echo ""

echo "🔧 Следующие шаги:"
echo "  1. Обновите FRONTEND_URL и VITE_API_URL в .env"
echo "  2. Загрузите проект на Amvera"
echo "  3. Запустите развертывание"
echo ""

warning "⚠️  ВАЖНО: Обновите домен в .env файле перед развертыванием!"
echo ""

echo "📖 Подробные инструкции: AMVERA_DEPLOY.md"
echo ""

success "Готово! 🚀"
