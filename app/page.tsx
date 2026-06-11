"use client"

import { Suspense } from "react";

import { SearchForm } from "@/app/components/search-form"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground";
import Logo from "@/app/components/Logo";
import { useTheme } from "@/app/components/ThemeProvider";

const MOOD_CHIPS = [
  { label: 'euphoric', className: 'from-fuchsia-500/80 to-orange-400/80' },
  { label: 'groovy', className: 'from-amber-400/80 to-rose-500/80' },
  { label: 'serene', className: 'from-cyan-400/80 to-emerald-400/80' },
  { label: 'brooding', className: 'from-indigo-500/80 to-slate-600/80' },
  { label: 'aggressive', className: 'from-red-500/80 to-zinc-800/80' },
]

export default function Home() {
  const { theme } = useTheme();
  return (
    <div className="relative min-h-screen text-black overflow-hidden">
      <LavaLampBackground />
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-8 animate-fadeIn">
            <Logo size={96} />
          </div>
          <h1 className="moodify-gradient-text text-6xl sm:text-7xl font-extrabold tracking-tight text-center animate-fadeIn drop-shadow-sm">
            Moodify
          </h1>
          <p className={`mt-4 mb-3 text-lg sm:text-xl font-medium text-center animate-fadeIn ${
            theme === 'dark' ? 'text-white/90 text-enhanced-contrast' : 'text-gray-900'
          }`}>
            Pick a song, paint the mood.
          </p>
          <p className={`mb-6 max-w-xl text-center text-sm sm:text-base animate-fadeIn ${
            theme === 'dark' ? 'text-gray-300 text-enhanced-contrast' : 'text-gray-700'
          }`}>
            Every track gets its own living 3D scene — colours pulled from the album art,
            motion shaped by its genre, tempo and mood.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-2 animate-fadeIn" aria-hidden="true">
            {MOOD_CHIPS.map(({ label, className }) => (
              <span
                key={label}
                className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${className} backdrop-blur-sm shadow-md`}
              >
                {label}
              </span>
            ))}
          </div>
          <Suspense fallback={<div className="w-full max-w-3xl mx-auto h-12 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>}>
            <SearchForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
