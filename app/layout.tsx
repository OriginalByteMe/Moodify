import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { ThemeSwitch } from "@/app/components/ui/ThemeSwitch";
import { Inter } from 'next/font/google'

import "./styles/globals.css";
import Link from "next/link";
import { Github } from "lucide-react";

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
            <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <header className="fixed top-0 right-0 m-4 z-50 flex items-center space-x-4">
                <Link
                  href="https://github.com/OriginalByteMe"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-6 h-6 text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                </Link>
                <Link
                  href="https://blog.noahrijkaard.com"
                  target="_blank"
                  rel="noopener noreferer"
                >
                  <div className="text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 hover:underline transition-colors">
                    Blog
                  </div>
                </Link>
                <ThemeSwitch />
              </header>
              {children}
            </div>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
