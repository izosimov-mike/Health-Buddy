const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');

require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function updateActions() {
  try {
    console.log('🚀 Обновляем действия в базе данных...');

    // Удаляем все существующие действия
    await db.execute(sql`DELETE FROM "actions";`);
    console.log('✅ Старые действия удалены');

    // Вставляем новые действия согласно требованиям
    await db.execute(sql`
      INSERT INTO "actions" ("id", "category_id", "name", "description", "points") 
      VALUES 
        -- Physical Health
        ('morning-exercise', 'physical', 'Morning exercise (5–10 minutes)', 'boosts energy, improves circulation, and wakes up muscles.', 15),
        ('mini-workout', 'physical', 'Mini workout (push-ups, squats, plank)', 'builds strength and supports joint health.', 20),
        ('outdoor-walk', 'physical', 'Outdoor walk (7,000–10,000 steps)', 'improves mood, supports cardiovascular health.', 25),
        ('stretching-yoga', 'physical', 'Stretching or yoga', 'increases flexibility, reduces stiffness, and lowers stress.', 15),
        ('posture-breaks', 'physical', 'Short posture/desk breaks', 'prevents back pain and eye strain during long sitting periods.', 10),
        
        -- Nutrition & Hydration
        ('morning-water', 'nutrition', 'Drink 1–2 glasses of water in the morning', 'rehydrates the body after sleep.', 10),
        ('daily-water-goal', 'nutrition', 'Meet daily water intake goal', 'maintains focus, energy, and organ function.', 20),
        ('fruits-vegetables', 'nutrition', 'Eat vegetables and fruits daily', 'provides vitamins, minerals, and fiber.', 20),
        ('limit-sweets', 'nutrition', 'Limit sweets and fast food', 'prevents energy crashes and supports long-term health.', 15),
        ('light-dinner', 'nutrition', 'Have a light dinner 2–3 hours before bed', 'improves digestion and sleep quality.', 15),
        ('regular-meals', 'nutrition', 'Keep regular meal times', 'stabilizes energy levels and metabolism.', 10),
        
        -- Mental Health
        ('meditation', 'mental', 'Meditation (5–10 minutes)', 'reduces stress and improves focus.', 20),
        ('journaling', 'mental', 'Journaling (3 thoughts of gratitude or events)', 'enhances mood and self-reflection.', 15),
        ('breathing-exercises', 'mental', 'Breathing exercises (2–5 minutes)', 'calms the nervous system and lowers anxiety.', 15),
        ('limit-screen-time', 'mental', 'Limit social media/screen time before bed', 'supports better sleep and reduces overstimulation.', 15),
        ('reading', 'mental', 'Read a book for at least 10 minutes', 'improves focus, relaxation, and learning.', 15),
        ('social-connections', 'mental', 'Nurture social connections', 'talking to friends/family reduces loneliness and boosts happiness.', 20),
        
        -- Hygiene & Self-Care
        ('brush-teeth', 'hygiene', 'Brush teeth (morning and evening)', 'prevents cavities and gum disease.', 10),
        ('dental-care', 'hygiene', 'Use dental floss or mouthwash', 'floss removes plaque between teeth, mouthwash helps freshness.', 10),
        ('skincare', 'hygiene', 'Wash face / skincare routine', 'keeps skin clean, fresh, and healthy.', 10),
        ('shower', 'hygiene', 'Refreshing shower', 'supports hygiene and helps body feel energized or relaxed.', 10),
        
        -- Sleep & Routine
        ('early-bedtime', 'sleep', 'Go to bed before 11:00 PM', 'aligns with natural circadian rhythm for better rest.', 20),
        ('sleep-duration', 'sleep', 'Sleep at least 7–8 hours', 'supports memory, immunity, and recovery.', 25),
        ('wake-without-phone', 'sleep', 'Wake up without phone scrolling', 'reduces stress and helps start the day with focus.', 15),
        ('no-snooze', 'sleep', 'Avoid snoozing the alarm', 'prevents sleep inertia and morning fatigue.', 10),
        ('sleep-environment', 'sleep', 'Prepare a calm sleep environment', 'cool, dark, and quiet rooms promote deep sleep.', 15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        points = EXCLUDED.points;
    `);
    console.log('✅ Новые действия добавлены');

    console.log('🎉 Действия успешно обновлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении действий:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Запуск обновления
if (require.main === module) {
  updateActions()
    .then(() => {
      console.log('✅ Обновление действий завершено успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка обновления:', error);
      process.exit(1);
    });
}

module.exports = { updateActions };