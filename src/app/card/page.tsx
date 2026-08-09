// src/app/card/page.tsx
// Dynamic OG card page: /card?img=<encoded-url>
// Serves server-side meta tags so link-preview crawlers pick up the right image.
import type { Metadata } from 'next';

interface Props {
  searchParams: { img?: string };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const imgUrl = searchParams?.img ?? '/og-default.png';
  return {
    title: 'HH Goa 2026 Builder ID Card',
    description: 'Check out this Builder ID card from Hacker House Goa 2026! #FrameInGoa',
    openGraph: {
      title: 'HH Goa 2026 Builder ID Card',
      description: 'Building at Hacker House Goa 2026. #FrameInGoa',
      images: [{ url: imgUrl, width: 1080, height: 1350, alt: 'HH Goa 2026 Builder ID Card' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HH Goa 2026 Builder ID Card',
      description: 'Building at Hacker House Goa 2026. #FrameInGoa',
      images: [imgUrl]
    }
  };
}

export default function CardPage({ searchParams }: Props) {
  const imgUrl = searchParams?.img ?? '/og-default.png';
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(160deg,#0d0220,#2c0e3e,#5c1a3a,#0a2a4a)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '32px 20px',
      fontFamily: "'Space Grotesk', sans-serif",
      color: '#fff'
    }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,200,100,0.7)', letterSpacing: '0.06em' }}>
        HH GOA 2026
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgUrl}
        alt="HH Goa 2026 Builder ID Card"
        style={{ maxWidth: '320px', width: '100%', borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
      />
      <a
        href="/"
        style={{
          padding: '14px 32px',
          background: 'linear-gradient(100deg,#ff6b6b,#ffa040)',
          color: '#fff',
          fontWeight: 700,
          borderRadius: '50px',
          textDecoration: 'none',
          fontSize: '1rem'
        }}
      >
        Make My Builder ID →
      </a>
    </div>
  );
}
