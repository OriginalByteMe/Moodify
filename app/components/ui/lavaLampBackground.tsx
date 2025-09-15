'use client'

import { RootState } from '@/lib/store'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/app/components/ThemeProvider'
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

function bpmToSpeed(bpm?: number): number {
  if (!bpm || Number.isNaN(bpm)) return 0.4
  const clamped = Math.max(60, Math.min(180, bpm))
  // Map 60–180 BPM -> 0.2–1.0
  return 0.2 + ((clamped - 60) / 120) * 0.8
}

type Props = {
  palette?: number[][]
  tempo?: number
  trackId?: string
}

export default function LavaLampBackground({ palette, tempo, trackId }: Props = {}) {
  const selectedTrack = useSelector((s: RootState) => s.spotify.selectedTrack)
  const { theme } = useTheme()

  // Brand-inspired default palettes derived from the logo hues.
  // Dark: deeper, saturated tones that sit well on black.
  // Light: brighter, softer tones that play nicely on white.
  const brandDefaults = useMemo(() => (
    theme === 'dark'
      ? ['#6D28D9', '#EA580C', '#0891B2'] // violet-700, orange-600, cyan-600
      : ['#A78BFA', '#FBBF24', '#38BDF8'] // violet-300/400, amber-400, sky-400
  ), [theme])

  const effectivePalette = palette ?? selectedTrack?.colourPalette
  const color1 = effectivePalette?.[0] ? rgbToHex(effectivePalette[0]) : brandDefaults[0]
  const color2 = effectivePalette?.[1] ? rgbToHex(effectivePalette[1]) : brandDefaults[1]
  const color3 = effectivePalette?.[2] ? rgbToHex(effectivePalette[2]) : brandDefaults[2]

  const speed = useMemo(() => bpmToSpeed(tempo ?? selectedTrack?.tempo), [tempo, selectedTrack?.tempo])

  const type = useMemo<'plane' | 'sphere' | 'waterPlane'>(() => {
    const id = (trackId ?? selectedTrack?.id) ?? 'default'
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
    const types: Array<'plane' | 'waterPlane'> = ['plane', 'waterPlane']
    const idx = Math.abs(hash) % types.length
    return types[idx]
  }, [trackId, selectedTrack?.id])

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none select-none z-0'>
      <ShaderGradientCanvas
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <ShaderGradient
          // Always animated
          animate='on'
          // Randomized among 3 types, stable per track
          type={type}
          // Colors from track palette
          color1={color1}
          color2={color2}
          color3={color3}
          // Drive speed from BPM
          uSpeed={speed}
          // Subtle defaults that work for all types
          uStrength={4}
          uDensity={1.3}
          uFrequency={5.5}
          reflection={0.1}
          grain='on'
          lightType='3d'
        />
      </ShaderGradientCanvas>
      {/* Readability overlay - only apply in dark mode */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent dark:via-black/20 dark:to-black/40' />
    </div>
  )
}
