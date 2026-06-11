"use client"

/**
 * Visual QA lab: renders the full play-screen experience (3D background +
 * pixel dancers) with demo data, no Spotify/back-end required.
 *
 * Query params: ?renderer=bars&genre=edm&bpm=140
 */

import { useEffect, useState } from "react"
import LavaLampBackground from "@/app/components/ui/lavaLampBackground"
import PixelDancers from "@/app/components/PixelDancers"
import type { SceneRenderer } from "@/lib/mood-visuals"

const DEMO_PALETTE = [
  [124, 58, 237],
  [234, 88, 12],
  [34, 211, 238],
  [251, 191, 36],
  [16, 185, 129],
]

const RENDERERS: Array<SceneRenderer | 'auto'> = ['auto', 'gradient', 'particles', 'blob', 'bars', 'tunnel', 'ribbons']
const GENRES: Record<string, string[]> = {
  rock: ['hard rock'], metal: ['thrash metal'], edm: ['edm', 'house'],
  hiphop: ['hip hop', 'trap'], pop: ['pop'], rnb: ['r&b', 'soul'],
  jazz: ['jazz'], acoustic: ['folk', 'acoustic'], classical: ['classical'],
  ambient: ['ambient', 'lo-fi'], latin: ['reggaeton'], none: [],
}

export default function DemoPage() {
  const [params, setParams] = useState<{ renderer: string; genre: string; bpm: number } | null>(null)

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)
    setParams({
      renderer: search.get('renderer') ?? 'auto',
      genre: search.get('genre') ?? 'edm',
      bpm: Number(search.get('bpm')) || 124,
    })
  }, [])

  if (!params) return null
  const genres = GENRES[params.genre] ?? GENRES.edm
  const forceRenderer = params.renderer !== 'auto' ? (params.renderer as SceneRenderer) : undefined

  return (
    <div className="relative min-h-screen overflow-hidden">
      <LavaLampBackground
        palette={DEMO_PALETTE}
        tempo={params.bpm}
        trackId={`demo-${params.genre}-${params.renderer}`}
        genres={genres}
        mood="euphoric"
        energy={0.7}
        valence={0.7}
        forceRenderer={forceRenderer}
      />
      <PixelDancers genres={genres} tempo={params.bpm} trackId={`demo-${params.genre}`} />

      <div className="relative z-10 p-6 text-white">
        <h1 className="text-2xl font-bold drop-shadow">Moodify visual lab</h1>
        <p className="text-sm opacity-80 drop-shadow">renderer={params.renderer} · genre={params.genre} · {params.bpm} BPM</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RENDERERS.map((r) => (
            <a key={r} href={`/demo?renderer=${r}&genre=${params.genre}&bpm=${params.bpm}`}
               className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${params.renderer === r ? 'bg-white text-black' : 'bg-black/40 text-white'}`}>
              {r}
            </a>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.keys(GENRES).map((g) => (
            <a key={g} href={`/demo?renderer=${params.renderer}&genre=${g}&bpm=${params.bpm}`}
               className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur ${params.genre === g ? 'bg-white text-black' : 'bg-black/40 text-white'}`}>
              {g}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
