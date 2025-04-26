import type { Metadata } from "next";

import { SearchForm } from "@/app/components/search-form"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      <LavaLampBackground />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          
          <h1 className="text-4xl font-bold mb-6 text-center dark:text-white">Moodify</h1>
          <p className="text-zinc-400 mb-8 text-center max-w-2xl dark:text-zinc-300">
            Search for your favorite songs, artists, and albums. Results update in real-time as you type.
          </p>
          <SearchForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Moodify",
};
