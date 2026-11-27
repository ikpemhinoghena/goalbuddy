import 'server-only';
import type { Database } from '../database';

export type ApiContext = { readonly db: Database; readonly userId: string | null };
