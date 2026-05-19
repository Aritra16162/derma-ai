'use client';

import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'next-themes';
import i18n from '@/i18n/config';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </ThemeProvider>
  );
}
