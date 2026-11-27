import 'server-only';
import { Pool } from 'pg';

export type Row = Record<string, unknown>;

export interface Queryable {
  query<R extends Row = Row>(text: string, params?: unknown[]): Promise<{ rows: R[] }>;
}

export interface Database extends Queryable {
  transaction<T>(work: (tx: Queryable) => Promise<T>): Promise<T>;
}

export function createPgDatabase(pool: Pool): Database {
  return {
    async query<R extends Row = Row>(text: string, params: unknown[] = []) {
      const result = await pool.query(text, params);
      return { rows: result.rows as R[] };
    },
    async transaction<T>(work: (tx: Queryable) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work({
          async query<R extends Row = Row>(text: string, params: unknown[] = []) {
            const response = await client.query(text, params);
            return { rows: response.rows as R[] };
          },
        });
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

const globalDatabase = globalThis as typeof globalThis & { goalBuddyDatabase?: Database };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabase(): Database {
  if (!globalDatabase.goalBuddyDatabase) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured.');
    }
    globalDatabase.goalBuddyDatabase = createPgDatabase(
      new Pool({ connectionString, max: Number(process.env.DATABASE_POOL_MAX) || 5 }),
    );
  }
  return globalDatabase.goalBuddyDatabase;
}
