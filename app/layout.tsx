import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { PreviewPlayerProvider } from "@/app/components/PreviewPlayer";
import FullscreenPlayer from "@/app/components/FullscreenPlayer";
import Header from "@/app/components/Header";
import { Inter } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"

import "./styles/globals.css";

const inter = Inter({ subsets: ['latin'] })


interface Props {
  readonly children: ReactNode;
}
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: {
    default: 'Moodify - Music Visualization with Color Palettes',
    template: '%s | Moodify',
  },
  description: 'Transform your music experience with Moodify. Extract color palettes from Spotify album artwork and enjoy dynamic 3D visualizations synchronized to your favorite tracks.',
  keywords: [
    'music visualization',
    'spotify',
    'color palette',
    'music colors',
    '3D music experience',
    'album art',
    'visual music',
    'music player',
    'spotify visualizer',
    'color from music',
    'dynamic backgrounds',
    'WebGL music',
  ],
  authors: [{ name: 'Moodify' }],
  creator: 'Moodify',
  publisher: 'Moodify',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Moodify',
    title: 'Moodify - Music Visualization with Color Palettes',
    description: 'Transform your music experience with dynamic color palettes and 3D visualizations extracted from Spotify album artwork.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Moodify - Music Visualization Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moodify - Music Visualization with Color Palettes',
    description: 'Transform your music experience with dynamic color palettes and 3D visualizations.',
    creator: '@moodify', // Update with your actual Twitter handle
    images: ['/og-image.png'],
  },
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
  verification: {
    // Add your verification IDs when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
}
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <StoreProvider>
            <PreviewPlayerProvider>
            <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
              <Header />
              {children}
            </div>
            <FullscreenPlayer />
            </PreviewPlayerProvider>
          </StoreProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
