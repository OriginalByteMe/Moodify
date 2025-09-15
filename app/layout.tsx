import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { PreviewPlayerProvider } from "@/app/components/PreviewPlayer";
import FullscreenPlayer from "@/app/components/FullscreenPlayer";
import Header from "@/app/components/Header";
import { Inter } from 'next/font/google'

import "./styles/globals.css";

const inter = Inter({ subsets: ['latin'] })


interface Props {
  readonly children: ReactNode;
}
export const metadata = {
  title: 'Moodify',
  description: 'Pick a song, paint the mood.',
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Moodify',
    description: 'Pick a song, paint the mood.',
    images: [
      {
        url: '/moodify.gif', 
        width: 800,
        height: 600,
        alt: 'Moodify site preview',
      },
    ],
  },
}
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
          />
        <meta property="og:image" content={metadata.openGraph.images[0].url} />
        <meta
          property="og:image:width"
          content={metadata.openGraph.images[0].width.toString()}
          />
        <meta
          property="og:image:height"
          content={metadata.openGraph.images[0].height.toString()}
          />
        <meta
          property="og:image:alt"
          content={metadata.openGraph.images[0].alt}
          />
      </head>
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
      </body>
    </html>
  );
}
