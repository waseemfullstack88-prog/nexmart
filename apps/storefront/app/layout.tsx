import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Providers } from './providers';
import { resolveStoreSlug, fetchSettings, fetchAppearance } from '@/lib/api';
import { StoreAppearance, StoreSettings } from '@/lib/types';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    const slug = resolveStoreSlug(hostname);
    const settings: StoreSettings = await fetchSettings(slug);
    const uploadsUrl = process.env.NEXT_PUBLIC_UPLOADS_URL || 'http://localhost:4000';

    return {
      title: {
        default: settings?.storeName || 'Online Store',
        template: `%s | ${settings?.storeName || 'Online Store'}`,
      },
      description: settings?.description || 'Welcome to our online store.',
      icons: settings?.faviconUrl
        ? [{ url: `${uploadsUrl}${settings.faviconUrl}`, rel: 'icon' }]
        : undefined,
    };
  } catch {
    return {
      title: 'Online Store',
      description: 'Welcome to our store.',
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let appearance: StoreAppearance | null = null;
  let settings: StoreSettings | null = null;
  let storeSlug = 'demo-store';

  try {
    const headersList = await headers();
    const hostname = headersList.get('host') || '';
    storeSlug = resolveStoreSlug(hostname);
    [appearance, settings] = await Promise.all([
      fetchAppearance(storeSlug),
      fetchSettings(storeSlug),
    ]);
  } catch {
    // Use defaults if store not found
  }

  const ap = appearance;
  const cssVars = ap
    ? `
      :root {
        --color-primary: ${ap.primaryColor || '#6366f1'};
        --color-secondary: ${ap.secondaryColor || '#8b5cf6'};
        --color-accent: ${ap.accentColor || '#f59e0b'};
        --color-bg: ${ap.bgColor || '#ffffff'};
        --color-text: ${ap.textColor || '#1f2937'};
        --color-btn: ${ap.buttonColor || '#6366f1'};
        --color-btn-text: ${ap.buttonTextColor || '#ffffff'};
        --font-family: '${ap.fontFamily || 'Inter'}', sans-serif;
        --radius: ${ap.borderRadius || '8px'};
      }
    `
    : '';

  const fontFamily = ap?.fontFamily || 'Inter';
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap`;

  return (
    <html lang={settings?.language || 'en'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={googleFontUrl} rel="stylesheet" />
        {cssVars && <style dangerouslySetInnerHTML={{ __html: cssVars }} />}
        {ap?.customCss && (
          <style dangerouslySetInnerHTML={{ __html: ap.customCss }} />
        )}
      </head>
      <body style={{ fontFamily: 'var(--font-family, Inter, sans-serif)' }}>
        <Providers storeSlug={storeSlug} appearance={appearance} settings={settings}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
