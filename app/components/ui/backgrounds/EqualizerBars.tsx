'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneConfig } from '@/lib/mood-visuals'

const COLS = 22
const ROWS = 10
const COUNT = COLS * ROWS

type BarsProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
}

/**
 * A floor of equalizer bars: waves travel across the grid at the track's
 * tempo and every beat slams an extra pulse through the whole floor.
 * The signature look for EDM / hip-hop scenes.
 */
function Bars({ colors, tempo, scene }: BarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 110
    return bpm / 60
  }, [tempo])

  const palette = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors])

  // Static per-instance colours: blend across the grid diagonal
  React.useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const color = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      const cx = (i % COLS) / (COLS - 1)
      const cz = Math.floor(i / COLS) / (ROWS - 1)
      const mix = (cx + cz) / 2
      if (mix < 0.5) color.lerpColors(palette[0], palette[1], mix * 2)
      else color.lerpColors(palette[1], palette[2], (mix - 0.5) * 2)
      mesh.setColorAt(i, color)
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [palette])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()
    const beatPhase = (t * bps) % 1
    const thump = Math.exp(-5 * beatPhase)
    const speed = (0.8 + scene.uSpeed) * bps
    for (let i = 0; i < COUNT; i++) {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const x = (col - COLS / 2) * 0.62
      const z = (row - ROWS / 2) * 0.62 - 1
      // Two travelling waves + a beat slam that ripples out from the centre
      const wave =
        Math.abs(Math.sin(col * 0.55 + t * speed)) * 0.8 +
        Math.abs(Math.sin(row * 0.7 - t * speed * 0.7 + col * 0.2)) * 0.5
      const distFromCentre = Math.hypot(col - COLS / 2, row - ROWS / 2)
      const slam = thump * Math.max(0, 1.4 - distFromCentre * 0.16)
      const h = 0.15 + (wave * scene.uStrength * 0.35 + slam) * 0.9
      dummy.position.set(x, h / 2 - 1.9, z)
      dummy.scale.set(1, h, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

type EqualizerBarsProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  backgroundColor: string
}

export default function EqualizerBars({ colors, tempo, scene, backgroundColor }: EqualizerBarsProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: backgroundColor }}
      camera={{ position: [0, 2.6, 7], fov: 55, rotation: [-0.25, 0, 0] }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'low-power' }}
    >
      <Bars colors={colors} tempo={tempo} scene={scene} />
    </Canvas>
  )
}
