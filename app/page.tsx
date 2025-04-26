import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchForm } from "@/app/components/search-form"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen text-black overflow-hidden">
      <LavaLampBackground />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          
          <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">Moodify</h1>
          <p className="text-zinc-900 mb-8 text-center max-w-2xl dark:text-zinc-300">
            Search for your favorite songs, artists, and albums. Results update in real-time as you type.
          </p>
          <Suspense fallback={<div className="w-full max-w-3xl mx-auto h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Moodify",
};
