/**
 * Database Migration Script
 * 
 * Run migrations to set up the database schema.
 * Usage: npx tsx src/database/migrate.ts
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Set it with: export DATABASE_URL="postgresql://user:pass@localhost:5432/ident_africa"');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🔄 Starting database migration...\n');

    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Execute the schema
    console.log('📦 Creating tables and indexes...');
    await pool.query(schema);

    console.log('\n✅ Migration completed successfully!');
    console.log('   Tables created:');
    console.log('   - destinations');
    console.log('   - destination_gallery');
    console.log('   - destination_park_info');
    console.log('   - destination_weather');
    console.log('   - destination_wildlife');
    console.log('   - destination_nearby_attractions');
    console.log('   - destination_travel_tips');
    console.log('   - saved_destinations');
    console.log('   - bookings');
    console.log('   - suppliers');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
migrate();
