import 'server-only';
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { getDatabase, isDatabaseConfigured } from './database';
import { createSession, deleteSession, sessionPolicy, touchSession } from './sessions';
import { initialDisplayName, upsertUserByIdentity } from './users';

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET &&
    process.env.AUTH_GITHUB_ID &&
    process.env.AUTH_GITHUB_SECRET &&
    isDatabaseConfigured(),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: sessionPolicy.absoluteMs / 1000 },
  callbacks: {
    async jwt({ token, account, profile }) {
      const db = getDatabase();
      if (account) {
        const user = await upsertUserByIdentity(
          db,
          `${account.provider}:${account.providerAccountId}`,
          initialDisplayName(profile?.name, profile?.login),
        );
        return { sid: await createSession(db, user.id), uid: user.id };
      }
      if (typeof token.sid !== 'string' || typeof token.uid !== 'string') {
        return null;
      }
      const userId = await touchSession(db, token.sid);
      return userId === token.uid ? token : null;
    },
    session({ session, token }) {
      return { expires: session.expires, user: { id: token.uid ?? '' } };
    },
  },
  events: {
    async signOut(message) {
      if ('token' in message && typeof message.token?.sid === 'string') {
        await deleteSession(getDatabase(), message.token.sid);
      }
    },
  },
});
