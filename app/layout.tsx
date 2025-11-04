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
  title: 'Moodify',
  description: 'Pick a song, paint the mood.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Moodify',
    description: 'Pick a song, paint the mood.',
    siteName: 'Moodify',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moodify',
    description: 'Pick a song, paint the mood.',
  },
}
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <StoreProvider>
            <PreviewPlayerProvider>
            <div className="min-h-screen text-black bg-white dark:bg-black dark:text-white">
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
