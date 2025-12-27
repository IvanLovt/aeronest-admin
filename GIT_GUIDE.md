# Руководство по работе с Git

Этот документ содержит основные команды и инструкции для работы с Git в проекте.

## Основные команды Git

### Инициализация и настройка

```bash
# Проверить версию Git
git --version

# Настроить имя пользователя (глобально)
git config --global user.name "Ваше Имя"

# Настроить email (глобально)
git config --global user.email "your.email@example.com"

# Просмотреть текущие настройки
git config --list
```

### Работа с репозиторием

```bash
# Инициализировать новый репозиторий
git init

# Клонировать существующий репозиторий
git clone <url-репозитория>

# Проверить статус файлов
git status

# Просмотреть изменения в файлах
git diff

# Просмотреть изменения в конкретном файле
git diff <имя-файла>
```

### Добавление и коммиты

```bash
# Добавить все измененные файлы
git add .

# Добавить конкретный файл
git add <имя-файла>

# Добавить несколько файлов
git add <файл1> <файл2> <файл3>

# Создать коммит с сообщением
git commit -m "Описание изменений"

# Добавить и закоммитить одной командой (только для отслеживаемых файлов)
git commit -am "Описание изменений"

# Изменить последний коммит (если еще не запушен)
git commit --amend -m "Новое сообщение"
```

### Работа с ветками

```bash
# Просмотреть все ветки
git branch

# Просмотреть все ветки (включая удаленные)
git branch -a

# Создать новую ветку
git branch <имя-ветки>

# Переключиться на ветку
git checkout <имя-ветки>

# Создать и переключиться на новую ветку
git checkout -b <имя-ветки>

# Удалить ветку (локально)
git branch -d <имя-ветки>

# Удалить ветку (принудительно)
git branch -D <имя-ветки>

# Переименовать текущую ветку
git branch -m <новое-имя>
```

### Работа с удаленным репозиторием

```bash
# Просмотреть удаленные репозитории
git remote -v

# Добавить удаленный репозиторий
git remote add origin <url-репозитория>

# Изменить URL удаленного репозитория
git remote set-url origin <новый-url>

# Получить изменения из удаленного репозитория
git fetch origin

# Получить и объединить изменения
git pull origin <ветка>

# Отправить изменения в удаленный репозиторий
git push origin <ветка>

# Отправить все ветки
git push --all origin

# Удалить ветку в удаленном репозитории
git push origin --delete <имя-ветки>
```

### История коммитов

```bash
# Просмотреть историю коммитов
git log

# Краткая история (одна строка на коммит)
git log --oneline

# История с графиком веток
git log --oneline --graph --all

# История конкретного файла
git log <имя-файла>

# Просмотреть изменения в коммите
git show <hash-коммита>
```

### Отмена изменений

```bash
# Отменить изменения в рабочей директории (незакоммиченные)
git checkout -- <имя-файла>

# Отменить все незакоммиченные изменения
git checkout -- .

# Убрать файл из staging area (но сохранить изменения)
git reset HEAD <имя-файла>

# Убрать все файлы из staging area
git reset HEAD

# Отменить последний коммит (сохранить изменения)
git reset --soft HEAD~1

# Отменить последний коммит (удалить изменения)
git reset --hard HEAD~1

# Вернуться к конкретному коммиту
git reset --hard <hash-коммита>
```

### Слияние и конфликты

```bash
# Слить ветку в текущую
git merge <имя-ветки>

# Слить с сообщением о коммите
git merge <имя-ветки> -m "Сообщение"

# Отменить слияние
git merge --abort

# Просмотреть конфликтующие файлы
git diff --name-only --diff-filter=U

# После разрешения конфликтов
git add <разрешенные-файлы>
git commit -m "Разрешение конфликтов"
```

### Stash (временное сохранение)

```bash
# Сохранить текущие изменения во временное хранилище
git stash

# Сохранить с сообщением
git stash save "Описание"

# Просмотреть список stash
git stash list

# Применить последний stash
git stash apply

# Применить конкретный stash
git stash apply stash@{0}

# Применить и удалить stash
git stash pop

# Удалить stash
git stash drop stash@{0}

# Удалить все stash
git stash clear
```

## Типичные рабочие процессы

### Первая настройка проекта

```bash
# 1. Клонировать репозиторий
git clone <url-репозитория>
cd <название-проекта>

# 2. Установить зависимости
npm install

# 3. Создать файл .env.local с переменными окружения
cp .env.example .env.local

# 4. Проверить статус
git status
```

### Ежедневная работа

```bash
# 1. Получить последние изменения
git pull origin main

# 2. Создать новую ветку для задачи
git checkout -b feature/название-задачи

# 3. Внести изменения в файлы
# ... редактирование файлов ...

# 4. Проверить изменения
git status
git diff

# 5. Добавить изменения
git add .

# 6. Создать коммит
git commit -m "Описание изменений"

# 7. Отправить изменения
git push origin feature/название-задачи
```

### Создание Pull Request (GitHub/GitLab)

```bash
# 1. Создать ветку для новой функции
git checkout -b feature/новая-функция

# 2. Внести изменения и закоммитить
git add .
git commit -m "Добавлена новая функция"

# 3. Отправить ветку в удаленный репозиторий
git push origin feature/новая-функция

# 4. На GitHub/GitLab создать Pull Request через веб-интерфейс
```

### Обновление основной ветки

```bash
# 1. Переключиться на основную ветку
git checkout main

# 2. Получить последние изменения
git pull origin main

# 3. Вернуться к своей ветке
git checkout feature/ваша-ветка

# 4. Слить изменения из main
git merge main

# Или использовать rebase (более чистая история)
git rebase main
```

## Полезные алиасы

Добавьте в `~/.gitconfig` для удобства:

```ini
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

## Игнорирование файлов

Убедитесь, что `.gitignore` содержит:

```
# Зависимости
node_modules/
.pnp
.pnp.js

# Тестирование
coverage/

# Production
build/
dist/
.next/
out/

# Переменные окружения
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Логи
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# База данных
*.db
*.sqlite
```

## Безопасность

⚠️ **Важно:**

- Никогда не коммитьте секретные ключи, пароли, токены
- Используйте `.env.local` для локальных переменных окружения
- Проверяйте `git status` перед коммитом
- Не коммитьте большие файлы (используйте Git LFS)
- Регулярно делайте `git pull` перед началом работы

## Решение проблем

### Отменить последний коммит (если еще не запушен)

```bash
git reset --soft HEAD~1
```

### Изменить последний коммит

```bash
git commit --amend -m "Новое сообщение"
```

### Удалить файл из Git, но оставить локально

```bash
git rm --cached <имя-файла>
```

### Восстановить удаленный файл

```bash
git checkout HEAD -- <имя-файла>
```

### Очистить неотслеживаемые файлы

```bash
git clean -fd
```

### Просмотреть, кто изменил файл

```bash
git blame <имя-файла>
```

## Дополнительные ресурсы

- [Официальная документация Git](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
