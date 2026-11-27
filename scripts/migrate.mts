import { Pool } from 'pg';
import { schemaSql } from '../lib/server/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set. Add it to .env.local or the environment.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

try {
  await pool.query(schemaSql);
  console.log('GoalBuddy database schema is up to date.');
} finally {
  await pool.end();
}
