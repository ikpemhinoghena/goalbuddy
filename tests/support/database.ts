import { PGlite, type Transaction } from '@electric-sql/pglite';
import type { Database, Queryable, Row } from '@/lib/server/database';
import { schemaSql } from '@/lib/server/schema';

export type TestDatabase = Database & { close(): Promise<void> };

function wrap(target: PGlite | Transaction): Queryable {
  return {
    async query<R extends Row = Row>(text: string, params: unknown[] = []) {
      const result = await target.query<R>(text, params);
      return { rows: result.rows };
    },
  };
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const pglite = new PGlite();
  await pglite.exec(schemaSql);
  return {
    ...wrap(pglite),
    transaction: (work) => pglite.transaction((tx) => work(wrap(tx))),
    close: () => pglite.close(),
  };
}

export async function createUser(db: Queryable, name: string): Promise<string> {
  const { rows } = await db.query<{ id: string }>(
    'INSERT INTO users (identity_reference, display_name) VALUES ($1, $2) RETURNING id',
    [`test:${name}`, name],
  );
  return rows[0].id;
}

export function jsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request(`http://localhost:3000${url}`, {
    method,
    headers: {
      origin: 'http://localhost:3000',
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
