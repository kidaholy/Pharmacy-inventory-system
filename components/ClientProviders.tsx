'use client';

import { LanguageProvider } from '../lib/contexts/LanguageContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
    </LanguageProvider>
  );
}