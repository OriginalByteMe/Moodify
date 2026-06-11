'use client'

import { RootState } from '@/lib/store'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/app/components/ThemeProvider'
import { buildSceneConfig } from '@/lib/mood-visuals'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as reactSpring from '@react-spring/three'

function rgbToHex(rgb?: number[]): string {
  if (!rgb || rgb.length < 3) return '#000000'
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)))
    return clamped.toString(16).padStart(2, '0')
  }
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

type Props = {
  palette?: number[][]
  tempo?: number
  trackId?: string
  genres?: string[]
  mood?: string
  energy?: number
  valence?: number
}

/**
 * Mood-driven 3D background. The scene's motion language comes from the
 * track's genres and mood (see lib/mood-visuals.ts), its colours from the
 * album palette, and its pacing from tempo/energy. A per-mount variation
 * seed keeps repeat visits fresh.
 */
export default function LavaLampBackground({ palette, tempo, trackId, genres, mood, energy, valence }: Props = {}) {
  const selectedTrack = useSelector((s: RootState) => s.spotify.selectedTrack)
  const { theme } = useTheme()

  // New scene flavour on every mount, stable for the component's lifetime
  const [variationSeed] = useState(() => Math.floor(Math.random() * 0x7fffffff))

  // Brand-inspired default palettes derived from the logo hues.
  const brandDefaults = useMemo(() => (
    theme === 'dark'
      ? ['#6D28D9', '#EA580C', '#0891B2'] // violet-700, orange-600, cyan-600
      : ['#A78BFA', '#FBBF24', '#38BDF8'] // violet-300/400, amber-400, sky-400
  ), [theme])

  const effectiveId = trackId ?? selectedTrack?.id
  const effectivePalette = palette ?? selectedTrack?.colourPalette
  const effectiveTempo = tempo ?? selectedTrack?.tempo
  const effectiveGenres = genres ?? selectedTrack?.genres
  const effectiveMood = mood ?? selectedTrack?.mood
  const effectiveEnergy = energy ?? selectedTrack?.energy
  const effectiveValence = valence ?? selectedTrack?.valence

  const scene = useMemo(() => buildSceneConfig({
    trackId: effectiveId,
    genres: effectiveGenres,
    mood: effectiveMood,
    tempo: effectiveTempo,
    energy: effectiveEnergy,
    valence: effectiveValence,
    variationSeed,
  }), [effectiveId, effectiveGenres, effectiveMood, effectiveTempo, effectiveEnergy, effectiveValence, variationSeed])

  const orderedColors = useMemo(() => {
    const fromPalette = (index: number): string | undefined => {
      const rgb = effectivePalette?.[scene.colorOrder[index]] ?? effectivePalette?.[index]
      return rgb ? rgbToHex(rgb) : undefined
    }
    return [
      fromPalette(0) ?? brandDefaults[0],
      fromPalette(1) ?? brandDefaults[1],
      fromPalette(2) ?? brandDefaults[2],
    ]
  }, [effectivePalette, scene.colorOrder, brandDefaults])

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none select-none z-0'>
      <ShaderGradientCanvas
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <ShaderGradient
          animate='on'
          type={scene.type}
          color1={orderedColors[0]}
          color2={orderedColors[1]}
          color3={orderedColors[2]}
          uSpeed={scene.uSpeed}
          uStrength={scene.uStrength}
          uDensity={scene.uDensity}
          uFrequency={scene.uFrequency}
          uAmplitude={scene.uAmplitude}
          reflection={scene.reflection}
          brightness={scene.brightness}
          grain={scene.grain}
          lightType={scene.lightType}
          envPreset={scene.envPreset}
          wireframe={scene.wireframe}
          cAzimuthAngle={scene.cAzimuthAngle}
          cPolarAngle={scene.cPolarAngle}
          cDistance={scene.cDistance}
          cameraZoom={scene.cameraZoom}
          rotationX={scene.rotationX}
          rotationY={scene.rotationY}
          rotationZ={scene.rotationZ}
          positionY={scene.positionY}
        />
      </ShaderGradientCanvas>
      {/* Readability overlay - only apply in dark mode */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent dark:via-black/20 dark:to-black/40' />
    </div>
  )
}
