"use client"

import { Suspense } from "react";
import Image from "next/image";

import { SearchForm } from "@/app/components/search-form"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground";
import { useTheme } from "@/app/components/ThemeProvider";

export default function Home() {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-screen text-black overflow-hidden">
      <LavaLampBackground />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-6">
            <Image src="/logo.svg" alt="Moodify Logo" width={120} height={120} priority className="animate-fadeIn" />
          </div>
          <div className={`inline-block px-6 py-3 rounded-xl mb-6 ${
            theme === 'dark' ? 'text-backdrop-dark' : 'text-backdrop-light'
          }`}>
            <h1 className={`text-4xl font-bold text-center ${
              theme === 'dark' ? 'text-white text-enhanced-contrast' : 'text-gray-900'
            }`}>Moodify</h1>
          </div>
          <div className={`inline-block px-6 py-3 rounded-xl mb-8 max-w-2xl ${
            theme === 'dark' ? 'text-backdrop-dark' : 'text-backdrop-light'
          }`}>
            <p className={`text-center ${
              theme === 'dark' ? 'text-gray-200 text-enhanced-contrast' : 'text-gray-800'
            }`}>
              Search for your favorite songs, artists, and albums. Results update in real-time as you type.
            </p>
          </div>
          <Suspense fallback={<div className="w-full max-w-3xl mx-auto h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

