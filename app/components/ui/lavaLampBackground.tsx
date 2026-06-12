'use client'

import { RootState } from '@/lib/store'
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react'
import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTheme } from '@/app/components/ThemeProvider'
import { buildSceneConfig, hashString } from '@/lib/mood-visuals'
import dynamic from 'next/dynamic'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as reactSpring from '@react-spring/three'

// Custom renderers are loaded on demand so the gradient path stays light
const ParticleField = dynamic(() => import('@/app/components/ui/backgrounds/ParticleField'), { ssr: false })
const MorphBlob = dynamic(() => import('@/app/components/ui/backgrounds/MorphBlob'), { ssr: false })
const EqualizerBars = dynamic(() => import('@/app/components/ui/backgrounds/EqualizerBars'), { ssr: false })
const WireTunnel = dynamic(() => import('@/app/components/ui/backgrounds/WireTunnel'), { ssr: false })
const RibbonWaves = dynamic(() => import('@/app/components/ui/backgrounds/RibbonWaves'), { ssr: false })

function rgbToHex(rgb?: number[]): string {
  if (!rgb || rgb.length < 3) return '#000000'
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)))
    return clamped.toString(16).padStart(2, '0')
  }
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

/**
 * WebGL scenes can fail at runtime (ShaderGradient fetches HDR environment
 * maps from a CDN; GPUs/contexts can be lost). Each failure escalates to a
 * simpler render: full scene -> no-fetch '3d' lighting -> static backdrop.
 */
class SceneErrorBoundary extends React.Component<
  { render: (attempt: number) => React.ReactNode },
  { attempt: number }
> {
  state = { attempt: 0 }
  componentDidCatch() {
    this.setState((s) => ({ attempt: s.attempt + 1 }))
  }
  render() {
    return this.props.render(this.state.attempt)
  }
}

/** Dim a hex color towards black (factor 0 = black, 1 = unchanged) */
function dimHex(hex: string, factor: number): string {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor)
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor)
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor)
  return `rgb(${r}, ${g}, ${b})`
}

type Props = {
  palette?: number[][]
  tempo?: number
  trackId?: string
  genres?: string[]
  mood?: string
  energy?: number
  valence?: number
  /** QA/demo override: skip the seeded pick and force a renderer */
  forceRenderer?: import('@/lib/mood-visuals').SceneRenderer
}

/**
 * Mood-driven 3D background. The scene's motion language comes from the
 * track's genres and mood (see lib/mood-visuals.ts), its colours from the
 * album palette, and its pacing from tempo/energy. A per-mount variation
 * seed keeps repeat visits fresh.
 */
export default function LavaLampBackground({ palette, tempo, trackId, genres, mood, energy, valence, forceRenderer }: Props = {}) {
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

  const scene = useMemo(() => {
    const built = buildSceneConfig({
      trackId: effectiveId,
      genres: effectiveGenres,
      mood: effectiveMood,
      tempo: effectiveTempo,
      energy: effectiveEnergy,
      valence: effectiveValence,
      variationSeed,
    })
    return forceRenderer ? { ...built, renderer: forceRenderer } : built
  }, [effectiveId, effectiveGenres, effectiveMood, effectiveTempo, effectiveEnergy, effectiveValence, variationSeed, forceRenderer])

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

  // Custom renderers sit on a deep palette-tinted backdrop so the scene
  // keeps the song's colours even where geometry is sparse
  const canvasBackground = useMemo(() => {
    const base = theme === 'dark' ? 0.22 : 0.45
    return `radial-gradient(ellipse at 28% 18%, ${dimHex(orderedColors[1], base + 0.12)} 0%, ${dimHex(orderedColors[0], base)} 55%, ${theme === 'dark' ? '#050309' : dimHex(orderedColors[2], base + 0.2)} 100%)`
  }, [orderedColors, theme])

  const layoutSeed = useMemo(
    () => (hashString(effectiveId ?? 'moodify-default') ^ variationSeed) >>> 0,
    [effectiveId, variationSeed]
  )

  if (scene.renderer !== 'gradient') {
    const rendererProps = {
      colors: orderedColors,
      tempo: effectiveTempo,
      scene,
      backgroundColor: canvasBackground,
    }
    return (
      <div className='absolute inset-0 w-full h-full pointer-events-none select-none z-0'>
        <SceneErrorBoundary
          render={(attempt) =>
            attempt > 0 ? (
              <div className='absolute inset-0' style={{ background: canvasBackground }} />
            ) : (
              <>
                {scene.renderer === 'particles' && <ParticleField {...rendererProps} seed={layoutSeed} />}
                {scene.renderer === 'blob' && <MorphBlob {...rendererProps} />}
                {scene.renderer === 'bars' && <EqualizerBars {...rendererProps} />}
                {scene.renderer === 'tunnel' && <WireTunnel {...rendererProps} />}
                {scene.renderer === 'ribbons' && <RibbonWaves {...rendererProps} />}
              </>
            )
          }
        />
        {/* Readability overlay - only apply in dark mode */}
        <div className='absolute inset-0 bg-gradient-to-b from-transparent dark:via-black/20 dark:to-black/40' />
      </div>
    )
  }

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none select-none z-0'>
      {/* Palette backdrop paints first and stays behind the WebGL canvas */}
      <div className='absolute inset-0' style={{ background: canvasBackground }} />
      <SceneErrorBoundary
        render={(attempt) =>
          attempt > 1 ? null : (
            <ShaderGradientCanvas
              key={attempt}
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
                // 'env' lighting streams an HDR from a CDN; after a failure
                // retry with self-contained '3d' lights instead
                lightType={attempt === 0 ? scene.lightType : '3d'}
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
          )
        }
      />
      {/* Readability overlay - only apply in dark mode */}
      <div className='absolute inset-0 bg-gradient-to-b from-transparent dark:via-black/20 dark:to-black/40' />
    </div>
  )
}
