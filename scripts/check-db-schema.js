const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql } = require('drizzle-orm');

async function checkDatabaseSchema() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('🔍 Checking database schema...');
    console.log('📊 Database URL:', connectionString.replace(/\/\/.*@/, '//***:***@'));
    
    // Get all tables
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in database:');
    for (const table of tables) {
      console.log(`  - ${table.table_name}`);
    }
    
    // Get detailed schema for each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\n🔧 Schema for table '${tableName}':`);
      
      const columns = await db.execute(sql`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        ORDER BY ordinal_position;
      `);
      
      for (const column of columns) {
        const nullable = column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = column.column_default ? ` DEFAULT ${column.column_default}` : '';
        const maxLength = column.character_maximum_length ? `(${column.character_maximum_length})` : '';
        console.log(`    ${column.column_name}: ${column.data_type}${maxLength} ${nullable}${defaultVal}`);
      }
      
      // Get constraints
      const constraints = await db.execute(sql`
        SELECT 
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name = ${tableName}
        ORDER BY tc.constraint_type, kcu.column_name;
      `);
      
      if (constraints.length > 0) {
        console.log(`    Constraints:`);
        for (const constraint of constraints) {
          console.log(`      ${constraint.constraint_type}: ${constraint.column_name} (${constraint.constraint_name})`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  } finally {
    await client.end();
  }
}

checkDatabaseSchema();