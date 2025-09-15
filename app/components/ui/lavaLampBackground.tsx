'use client'

import { RootState } from '@/lib/store'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
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

export default function LavaLampBackground() {
  const selectedTrack = useSelector((s: RootState) => s.spotify.selectedTrack)

  const palette = selectedTrack?.colourPalette
  const color1 = rgbToHex(palette?.[0] ?? [255, 255, 255])
  const color2 = rgbToHex(palette?.[1] ?? [0, 128, 255])
  const color3 = rgbToHex(palette?.[2] ?? [0, 0, 0])

  const speed = useMemo(() => bpmToSpeed(selectedTrack?.tempo), [selectedTrack?.tempo])

  const type = useMemo<'plane' | 'sphere' | 'waterPlane'>(() => {
    const id = selectedTrack?.id ?? 'default'
    let hash = 0
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
    const types: Array<'plane' | 'waterPlane'> = ['plane', 'waterPlane']
    const idx = Math.abs(hash) % types.length
    return types[idx]
  }, [selectedTrack?.id])

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none select-none'>
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
      {/* Readability overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40' />
    </div>
  )
}
