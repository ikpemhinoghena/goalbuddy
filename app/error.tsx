'use client';

import { ErrorState } from '@/components/ui/error-state';

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return <ErrorState retry={retry} />;
}
