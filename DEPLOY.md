# Инструкция по деплою проекта

## 1. Создание репозитория на GitHub

### Вариант A: Создать новый репозиторий через веб-интерфейс

1. Перейдите на https://github.com/new
2. Название репозитория: `aeronest-admin` (или другое)
3. Выберите **Private** или **Public**
4. **НЕ** добавляйте README, .gitignore или лицензию (они уже есть)
5. Нажмите **Create repository**

### Вариант B: Использовать существующий репозиторий

Если репозиторий уже существует, обновите URL:

```bash
git remote set-url origin https://github.com/IvanLovt/aeronest-admin.git
```

## 2. Отправка кода на GitHub

```bash
# Проверьте текущий remote
git remote -v

# Если нужно изменить URL
git remote set-url origin https://github.com/ivanlovt/aeronest-admin.git

# Добавьте все файлы
git add .

# Создайте коммит
git commit -m "feat: готовый проект для деплоя"

# Отправьте на GitHub
git push -u origin main
```

## 3. Деплой на Vercel

### Шаг 1: Подключите репозиторий

1. Перейдите на https://vercel.com
2. Нажмите **Add New Project**
3. Импортируйте репозиторий с GitHub
4. Выберите репозиторий `aeronest-admin`

### Шаг 2: Настройте переменные окружения

В настройках проекта Vercel добавьте следующие переменные:

```
DATABASE_URL=postgresql://neondb_owner:npg_z13Ed5LsGmFw@ep-late-bar-a42869ub-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
AUTH_SECRET=Pd0GycbWCQLlc64jfhwCrhYj9++BYIXEMADUDEVL/OQ=
```

**Важно:** Используйте те же значения, что и в `.env.local`

### Шаг 3: Настройки билда

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (по умолчанию)
- **Output Directory:** `.next` (по умолчанию)
- **Install Command:** `npm install` (по умолчанию)

### Шаг 4: Деплой

Нажмите **Deploy** и дождитесь завершения билда.

## 4. Альтернатива: Деплой на другие платформы

### Netlify

1. Подключите репозиторий на https://netlify.com
2. Добавьте переменные окружения в настройках проекта
3. Build command: `npm run build`
4. Publish directory: `.next`

### Railway

1. Подключите репозиторий на https://railway.app
2. Добавьте переменные окружения в настройках проекта
3. Railway автоматически определит Next.js

## 5. Проверка после деплоя

После успешного деплоя проверьте:

1. ✅ Главная страница открывается
2. ✅ Регистрация работает
3. ✅ Вход работает
4. ✅ Админ-панель доступна для admin@example.com
5. ✅ Каталог загружается из БД

## Решение проблем

### Ошибка "DATABASE_URL not found"

Убедитесь, что переменная `DATABASE_URL` добавлена в настройках платформы деплоя.

### Ошибка "Repository not found"

1. Проверьте, что репозиторий существует на GitHub
2. Проверьте права доступа к репозиторию
3. Убедитесь, что используете правильный URL

### Ошибка билда

Проверьте логи билда на платформе деплоя для деталей ошибки.
