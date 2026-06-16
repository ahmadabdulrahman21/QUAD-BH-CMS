import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.quad-bh.com'),

  title: {
    default: 'QUAD Business House',
    template: '%s | QUAD Business House',
  },

  description:
    'QUAD Business House provides business consulting, digital transformation, strategic planning, innovation, and growth solutions for organizations and entrepreneurs.',

  keywords: [
    'QUAD Business House',
    'Business Consulting',
    'Digital Transformation',
    'Business Strategy',
    'Innovation',
    'Entrepreneurship',
    'Business Development',
    'Corporate Consulting',
    'Growth Solutions',
  ],

  authors: [{ name: 'QUAD Business House' }],
  creator: 'QUAD Business House',
  publisher: 'QUAD Business House',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: 'https://quad-bh.com',
  },

  openGraph: {
    title: 'QUAD Business House',
    description:
      'Business consulting, strategic planning, digital transformation, and innovation solutions.',
    url: 'https://www.quad-bh.com',
    siteName: 'QUAD Business House',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'QUAD Business House',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'QUAD Business House',
    description:
      'Business consulting, strategic planning, digital transformation, and innovation solutions.',
    images: ['/og-image.jpg'],
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-gray-900 bg-white">
        {children}
      </body>
    </html>
  );
}