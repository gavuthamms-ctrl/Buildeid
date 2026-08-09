// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HH Goa 2026 — Builder ID Card Generator',
  description: 'Create your personal Builder ID card for Hacker House Goa 2026. Upload a photo, fill 3 fields, and share on X with #FrameInGoa.',
  openGraph: {
    title: 'HH Goa 2026 — Builder ID Card Generator',
    description: 'Make your Builder ID card for Hacker House Goa 2026 in 15 seconds.',
    type: 'website',
    images: ['/og-default.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HH Goa 2026 — Builder ID Card Generator',
    description: 'Make your Builder ID card for Hacker House Goa 2026 in 15 seconds.',
    images: ['/og-default.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#1a0533" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
