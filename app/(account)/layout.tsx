import type { ReactNode } from 'react';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="space-y-8 py-8 sm:py-12">{children}</div>;
}
