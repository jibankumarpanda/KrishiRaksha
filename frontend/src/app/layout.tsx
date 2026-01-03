// ===================================================================
// FILE: src/app/layout.tsx
// Root Layout with Providers
// ===================================================================

import React from 'react';
import type { Metadata } from 'next';
import '@/styles/tailwind.css';
import { Providers } from '@/providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Krishi Raksha - Crop Insurance Platform',
  description: 'Blockchain-based crop insurance platform on Celo',
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          rel="preconnect" 
          href="https://fonts.gstatic.com" 
          crossOrigin="anonymous" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@400;500&family=Source+Sans+Pro:wght@400&family=JetBrains+Mono:wght@400&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}