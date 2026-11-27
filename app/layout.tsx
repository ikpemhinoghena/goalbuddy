import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'GoalBuddy | Small steps, steady progress', template: '%s | GoalBuddy' },
  description:
    'Turn meaningful goals into manageable milestones and tasks. Explore the GoalBuddy workspace design preview.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-lg bg-primary px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8"
        >
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
