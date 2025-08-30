# Настройка переменных окружения в Vercel

Для корректной работы приложения на Vercel необходимо добавить следующие переменные окружения:

## Основные переменные базы данных

### DATABASE_URL (обязательная)
```
DATABASE_URL=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### DATABASE_URL_UNPOOLED (дополнительная)
```
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## PostgreSQL параметры подключения

```
PGHOST=ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech
PGHOST_UNPOOLED=ep-solitary-thunder-adeni4wp.c-2.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGDATABASE=neondb
PGPASSWORD=REDACTED
```

## Vercel Postgres Templates

```
POSTGRES_URL=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_USER=neondb_owner
POSTGRES_HOST=ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech
POSTGRES_PASSWORD=REDACTED
POSTGRES_DATABASE=neondb
POSTGRES_URL_NO_SSL=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech/neondb
POSTGRES_PRISMA_URL=postgresql://neondb_owner:REDACTED@ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

## Neon Auth переменные для Next.js

```
NEXT_PUBLIC_STACK_PROJECT_ID=1debe27c-b01e-4ab4-b0ab-7464b8e1f0d8
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_zaatpgjq3mnt74rpp75wqmwtnvr834w82tp499yf3ayxg
STACK_SECRET_SERVER_KEY=ssk_656vpdeapz6qy2bzya0mwdnbn38mkr2e435jtkzh2f2t8
```

## Как добавить переменные в Vercel:

1. Перейдите в панель управления Vercel
2. Выберите ваш проект Health Buddy
3. Перейдите в Settings → Environment Variables
4. Добавьте каждую переменную:
   - Name: название переменной (например, DATABASE_URL)
   - Value: значение переменной
   - Environment: выберите Production, Preview, и Development
5. Нажмите "Save"

## После добавления переменных:

1. Сделайте коммит и пуш изменений в Git
2. Vercel автоматически пересоберет приложение
3. Проверьте работу API эндпоинтов:
   - `/api/health` - проверка подключения к БД
   - `/api/seed` - инициализация данных
   - `/api/users` - список пользователей
   - `/api/categories` - категории здоровья
   - `/api/stats` - статистика пользователя

## Важные замечания:

- **DATABASE_URL** - самая важная переменная, без неё приложение не будет работать
- База данных уже создана и заполнена тестовыми данными
- Все API эндпоинты протестированы локально и работают корректно
- После деплоя все функции приложения должны заработать: Daily Check-in, Categories, Stats, Leaderboard