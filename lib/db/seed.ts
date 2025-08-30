import { db, categories, actions, users, levels } from './index';

const healthCategories = [
  {
    id: "physical",
    name: "Physical Health",
    icon: "Dumbbell",
    color: "bg-blue-500",
  },
  {
    id: "nutrition",
    name: "Nutrition & Hydration",
    icon: "Apple",
    color: "bg-green-500",
  },
  {
    id: "mental",
    name: "Mental Health",
    icon: "Brain",
    color: "bg-purple-500",
  },
  {
    id: "hygiene",
    name: "Hygiene & Self-Care",
    icon: "Sparkles",
    color: "bg-pink-500",
  },
  {
    id: "sleep",
    name: "Sleep & Routine",
    icon: "Moon",
    color: "bg-indigo-500",
  },
];

const healthActions = [
  // Physical Health
  { id: "h1", categoryId: "physical", name: "Morning exercise (5–10 minutes)", description: "boosts energy, improves circulation, and wakes up muscles.", points: 1 },
  { id: "h2", categoryId: "physical", name: "Mini workout (push-ups, squats, plank)", description: "builds strength and supports joint health.", points: 1 },
  { id: "h3", categoryId: "physical", name: "Outdoor walk (7,000–10,000 steps)", description: "improves mood, supports cardiovascular health.", points: 1 },
  { id: "h4", categoryId: "physical", name: "Stretching or yoga", description: "increases flexibility, reduces stiffness, and lowers stress.", points: 1 },
  { id: "h5", categoryId: "physical", name: "Short posture/desk breaks", description: "prevents back pain and eye strain during long sitting periods.", points: 1 },
  
  // Nutrition & Hydration
  { id: "h6", categoryId: "nutrition", name: "Drink 1–2 glasses of water in the morning", description: "rehydrates the body after sleep.", points: 1 },
  { id: "h7", categoryId: "nutrition", name: "Meet daily water intake goal", description: "maintains focus, energy, and organ function.", points: 1 },
  { id: "h8", categoryId: "nutrition", name: "Eat vegetables and fruits daily", description: "provides vitamins, minerals, and fiber.", points: 1 },
  { id: "h9", categoryId: "nutrition", name: "Limit sweets and fast food", description: "prevents energy crashes and supports long-term health.", points: 1 },
  { id: "h10", categoryId: "nutrition", name: "Have a light dinner 2–3 hours before bed", description: "improves digestion and sleep quality.", points: 1 },
  { id: "h11", categoryId: "nutrition", name: "Keep regular meal times", description: "stabilizes energy levels and metabolism.", points: 1 },
  
  // Mental Health
  { id: "h12", categoryId: "mental", name: "Meditation (5–10 minutes)", description: "reduces stress and improves focus.", points: 1 },
  { id: "h13", categoryId: "mental", name: "Journaling (3 thoughts of gratitude or events)", description: "enhances mood and self-reflection.", points: 1 },
  { id: "h14", categoryId: "mental", name: "Breathing exercises (2–5 minutes)", description: "calms the nervous system and lowers anxiety.", points: 1 },
  { id: "h15", categoryId: "mental", name: "Limit social media/screen time before bed", description: "supports better sleep and reduces overstimulation.", points: 1 },
  { id: "h16", categoryId: "mental", name: "Read a book for at least 10 minutes", description: "improves focus, relaxation, and learning.", points: 1 },
  { id: "h17", categoryId: "mental", name: "Nurture social connections", description: "talking to friends/family reduces loneliness and boosts happiness.", points: 1 },
  
  // Hygiene & Self-Care
  { id: "h18", categoryId: "hygiene", name: "Brush teeth (morning and evening)", description: "prevents cavities and gum disease.", points: 1 },
  { id: "h19", categoryId: "hygiene", name: "Use dental floss or mouthwash", description: "floss removes plaque between teeth, mouthwash helps freshness.", points: 1 },
  { id: "h20", categoryId: "hygiene", name: "Wash face / skincare routine", description: "keeps skin clean, fresh, and healthy.", points: 1 },
  { id: "h21", categoryId: "hygiene", name: "Refreshing shower", description: "supports hygiene and helps body feel energized or relaxed.", points: 1 },
  
  // Sleep & Routine
  { id: "h22", categoryId: "sleep", name: "Go to bed before 11:00 PM", description: "aligns with natural circadian rhythm for better rest.", points: 1 },
  { id: "h23", categoryId: "sleep", name: "Sleep at least 7–8 hours", description: "supports memory, immunity, and recovery.", points: 1 },
  { id: "h24", categoryId: "sleep", name: "Wake up without phone scrolling", description: "reduces stress and helps start the day with focus.", points: 1 },
  { id: "h25", categoryId: "sleep", name: "Avoid snoozing the alarm", description: "prevents sleep inertia and morning fatigue.", points: 1 },
  { id: "h26", categoryId: "sleep", name: "Prepare a calm sleep environment", description: "cool, dark, and quiet rooms promote deep sleep.", points: 1 },
];

const gameLevels = [
  { id: 1, name: "Beginner", minPoints: 0, maxPoints: 149 },
  { id: 2, name: "Apprentice", minPoints: 150, maxPoints: 299 },
  { id: 3, name: "Explorer", minPoints: 300, maxPoints: 449 },
  { id: 4, name: "Performer", minPoints: 450, maxPoints: 599 },
  { id: 5, name: "Champion", minPoints: 600, maxPoints: 749 },
  { id: 6, name: "Master", minPoints: 750, maxPoints: 899 },
  { id: 7, name: "Legend", minPoints: 900, maxPoints: 1049 },
  { id: 8, name: "Mythic", minPoints: 1050, maxPoints: null },
];

export async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Insert categories
    await db.insert(categories).values(healthCategories).onConflictDoNothing();
    console.log('✅ Categories seeded');
    
    // Insert actions
    await db.insert(actions).values(healthActions).onConflictDoNothing();
    console.log('✅ Actions seeded');
    
    // Insert levels
    await db.insert(levels).values(gameLevels.map(level => ({
      ...level,
      createdAt: Math.floor(Date.now() / 1000)
    }))).onConflictDoNothing();
    console.log('✅ Levels seeded');
    
    // Insert test user
    await db.insert(users).values({
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      globalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      level: 1,
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
    }).onConflictDoNothing();
    console.log('✅ Test user created');
    
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}