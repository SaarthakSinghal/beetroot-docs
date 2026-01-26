import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Beetroot',
  icons: [
    {
      rel: 'icon',
      url: '/logo.svg',
      media: '(prefers-color-scheme: light)',
    },
    {
      rel: 'icon',
      url: '/logo-dark.svg',
      media: '(prefers-color-scheme: dark)',
    },
  ],
};

export default function Layout({ children }: LayoutProps<'/'>) {
  const basePath = process.env.NODE_ENV === 'production' ? '/beetroot' : '';

  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          search={{
            options: {
              api: `${basePath}/api/search`,
            },
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
