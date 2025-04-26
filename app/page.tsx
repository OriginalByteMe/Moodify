import type { Metadata } from "next";
import { Counter } from "./components/counter/Counter";

import { SearchForm } from "@/app/components/search-form"
// import { SpotifyLogo } from "@/app/components/spotify-logo"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          
          <h1 className="text-4xl font-bold mb-6 text-center">Spotify Song Search</h1>
          <p className="text-zinc-400 mb-8 text-center max-w-2xl">
            Search for your favorite songs, artists, and albums. Results update in real-time as you type.
          </p>
          <SearchForm />
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  title: "Redux Toolkit",
};
