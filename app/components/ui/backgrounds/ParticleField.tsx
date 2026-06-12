'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createRng, type SceneConfig } from '@/lib/mood-visuals'

const PARTICLE_COUNT = 1800

type FieldProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  seed: number
}

/**
 * Galaxy-like particle field. The whole field orbits at a rate derived from
 * the track's BPM and "thumps" (size + brightness) on every beat.
 */
function Field({ colors, tempo, scene, seed }: FieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.PointsMaterial>(null)

  // Beats per second straight from the nerd-stats tempo
  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 110
    return bpm / 60
  }, [tempo])

  const { positions, particleColors, baseSize } = useMemo(() => {
    const rng = createRng(seed)
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const particleColors = new Float32Array(PARTICLE_COUNT * 3)
    const palette = colors.map((c) => new THREE.Color(c))
    // Spiral-ish disc: denser core, sparse rim, slight vertical spread
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 1.2 + Math.pow(rng(), 0.6) * 6.5
      const angle = rng() * Math.PI * 2 + radius * (0.35 + scene.uFrequency * 0.04)
      const y = (rng() - 0.5) * (0.6 + radius * 0.25)
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(angle) * radius
      // Core leans towards color1, rim towards color3
      const mix = Math.min(1, radius / 7.5)
      const base = palette[mix < 0.45 ? 0 : mix < 0.75 ? 1 : 2] ?? palette[0]
      const jitter = 0.85 + rng() * 0.3
      particleColors[i * 3] = base.r * jitter
      particleColors[i * 3 + 1] = base.g * jitter
      particleColors[i * 3 + 2] = base.b * jitter
    }
    return { positions, particleColors, baseSize: 0.05 + scene.uStrength * 0.012 }
  }, [colors, seed, scene.uFrequency, scene.uStrength])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // Per-beat thump: sharp attack, exponential decay
    const beatPhase = (t * bps) % 1
    const thump = Math.exp(-4 * beatPhase)
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.12 * scene.uSpeed * bps
      pointsRef.current.rotation.z = Math.sin(t * 0.05) * 0.15
      const breathe = 1 + 0.025 * thump
      pointsRef.current.scale.setScalar(breathe)
    }
    if (materialRef.current) {
      materialRef.current.size = baseSize * (1 + 0.45 * thump)
      materialRef.current.opacity = 0.75 + 0.25 * thump
    }
  })

  return (
    <points ref={pointsRef} rotation={[scene.rotationY * 0.01, 0, 0.3]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        vertexColors
        transparent
        size={baseSize}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

type ParticleFieldProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  seed: number
  backgroundColor: string
}

export default function ParticleField({ colors, tempo, scene, seed, backgroundColor }: ParticleFieldProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: backgroundColor }}
      camera={{ position: [0, 2.2, 7.5], fov: 60 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'low-power' }}
    >
      <Field colors={colors} tempo={tempo} scene={scene} seed={seed} />
    </Canvas>
  )
}
