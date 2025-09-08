const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');

// Подключение к Neon PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_N70WAuJGPxEz@ep-solitary-thunder-adeni4wp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';

const client = postgres(connectionString);
const db = drizzle(client);

async function initializeDatabase() {
  try {
    console.log('🚀 Начинаем инициализацию базы данных Neon...');

    // Удаление существующих таблиц для пересоздания с правильной схемой
    console.log('🗑️ Удаляем существующие таблицы...');
    await db.execute(sql`DROP TABLE IF EXISTS "action_completions" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "daily_progress" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "actions" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "categories" CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS "levels" CASCADE;`);
    console.log('✅ Существующие таблицы удалены');

    // Создание таблицы levels
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "levels" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "min_points" integer NOT NULL,
        "max_points" integer,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица levels создана');

    // Создание таблицы categories
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "icon" text NOT NULL,
        "color" text NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица categories создана');

    // Создание таблицы users с полями fid и farcasterFid
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "farcaster_fid" text UNIQUE,
        "fid" integer UNIQUE,
        "farcaster_username" text,
        "farcaster_display_name" text,
        "farcaster_pfp_url" text,
        "name" text NOT NULL,
        "email" text UNIQUE,
        "global_score" integer DEFAULT 0,
        "current_streak" integer DEFAULT 0,
        "longest_streak" integer DEFAULT 0,
        "level" integer DEFAULT 1,
        "last_checkin_date" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица users создана с полями fid и farcasterFid');

    // Создание таблицы actions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "actions" (
        "id" text PRIMARY KEY NOT NULL,
        "category_id" text REFERENCES "categories"("id"),
        "name" text NOT NULL,
        "description" text NOT NULL,
        "points" integer DEFAULT 1,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица actions создана');

    // Создание таблицы dailyProgress
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "daily_progress" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "date" text NOT NULL,
        "total_score" integer DEFAULT 0,
        "completed_actions" integer DEFAULT 0,
        "checked_in" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица dailyProgress создана');

    // Создание таблицы actionCompletions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "action_completions" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text REFERENCES "users"("id"),
        "action_id" text REFERENCES "actions"("id"),
        "date" text NOT NULL,
        "completed" boolean DEFAULT true,
        "completed_at" timestamp DEFAULT now()
      );
    `);
    console.log('✅ Таблица actionCompletions создана');

    // Создание индексов для оптимизации
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "users_fid_idx" ON "users" ("fid");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "users_farcaster_fid_idx" ON "users" ("farcaster_fid");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "daily_progress_user_id_date_idx" ON "daily_progress" ("user_id", "date");
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "action_completions_user_id_action_id_idx" ON "action_completions" ("user_id", "action_id");
    `);
    console.log('✅ Индексы созданы');

    // Вставка базовых уровней
    await db.execute(sql`
      INSERT INTO "levels" ("name", "min_points", "max_points") 
      VALUES 
        ('Beginner', 0, 99),
        ('Apprentice', 100, 299),
        ('Explorer', 300, 599),
        ('Performer', 600, 999),
        ('Master', 1000, NULL)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Базовые уровни добавлены');

    // Вставка категорий
    await db.execute(sql`
      INSERT INTO "categories" ("id", "name", "icon", "color") 
      VALUES 
        ('physical', 'Physical Health', 'dumbbell', '#8B5CF6'),
        ('nutrition', 'Nutrition & Hydration', 'apple', '#10B981'),
        ('mental', 'Mental Health', 'brain', '#F59E0B'),
        ('hygiene', 'Hygiene & Self-Care', 'sparkles', '#EF4444'),
        ('sleep', 'Sleep & Routine', 'moon', '#3B82F6')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Категории добавлены');

    // Вставка действий
    await db.execute(sql`
      INSERT INTO "actions" ("id", "category_id", "name", "description", "points") 
      VALUES 
        ('morning-workout', 'physical', 'Morning Workout', 'Complete a 30-minute morning exercise routine', 25),
        ('evening-walk', 'physical', 'Evening Walk', 'Take a 20-minute walk in the evening', 15),
        ('stretching', 'physical', 'Stretching Session', 'Do 15 minutes of stretching exercises', 10),
        ('drink-water', 'nutrition', 'Drink 8 Glasses of Water', 'Stay hydrated throughout the day', 20),
        ('healthy-breakfast', 'nutrition', 'Eat Healthy Breakfast', 'Have a nutritious breakfast with fruits and proteins', 15),
        ('avoid-processed', 'nutrition', 'Avoid Processed Foods', 'Choose whole foods over processed alternatives', 20),
        ('meditation', 'mental', 'Meditation Practice', 'Spend 10 minutes in mindfulness meditation', 20),
        ('gratitude-journal', 'mental', 'Gratitude Journal', 'Write down 3 things you are grateful for', 15),
        ('digital-detox', 'mental', 'Digital Detox Hour', 'Spend 1 hour without screens or social media', 25),
        ('brush-teeth', 'hygiene', 'Brush Teeth Twice', 'Maintain oral hygiene by brushing twice daily', 10),
        ('skincare', 'hygiene', 'Skincare Routine', 'Follow your morning and evening skincare routine', 15),
        ('shower', 'hygiene', 'Take a Shower', 'Maintain personal hygiene with daily shower', 10),
        ('sleep-8-hours', 'sleep', 'Sleep 8 Hours', 'Get a full night of quality sleep', 30),
         ('wake-early', 'sleep', 'Wake Up Early', 'Wake up before 7 AM to start the day right', 20),
         ('evening-routine', 'sleep', 'Evening Routine', 'Follow a consistent evening wind-down routine', 15)
       ON CONFLICT DO NOTHING;
     `);
    console.log('✅ Действия добавлены');

    console.log('🎉 База данных Neon успешно инициализирована!');
    
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Запуск инициализации
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Инициализация завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка инициализации:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };