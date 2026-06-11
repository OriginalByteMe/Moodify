'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneConfig } from '@/lib/mood-visuals'

const RIBBON_COUNT = 5
const SEGMENTS = 96
const WIDTH = 22

type RibbonsProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
}

/**
 * Layered silk ribbons drifting like an aurora — the calm signature for
 * jazz, classical, acoustic and ambient scenes. The undulation speed
 * follows the tempo, and beats send a soft swell along each ribbon.
 */
function Ribbons({ colors, tempo, scene }: RibbonsProps) {
  const meshRefs = useRef<Array<THREE.Mesh | null>>([])

  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 95
    return bpm / 60
  }, [tempo])

  const ribbons = useMemo(
    () =>
      Array.from({ length: RIBBON_COUNT }, (_, i) => ({
        color: colors[i % colors.length],
        y: 1.6 - i * 0.85,
        z: -1 - i * 0.6,
        phase: i * 1.7,
        freq: 0.5 + (i % 3) * 0.2 + scene.uFrequency * 0.04,
        amp: 0.5 + scene.uStrength * 0.18,
        speed: (0.25 + scene.uSpeed * 0.5) * (i % 2 === 0 ? 1 : -0.8),
      })),
    [colors, scene.uFrequency, scene.uStrength, scene.uSpeed]
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const beatPhase = (t * bps) % 1
    // Gentle swell rather than a thump: half-sine over the whole beat
    const swell = Math.sin(Math.PI * beatPhase) * 0.25
    ribbons.forEach((ribbon, i) => {
      const mesh = meshRefs.current[i]
      if (!mesh) return
      const geometry = mesh.geometry as THREE.PlaneGeometry
      const pos = geometry.attributes.position as THREE.BufferAttribute
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v)
        const wave =
          Math.sin(x * ribbon.freq + t * ribbon.speed * bps + ribbon.phase) * ribbon.amp +
          Math.sin(x * ribbon.freq * 2.3 - t * ribbon.speed * 0.6 * bps) * ribbon.amp * 0.35
        // Original plane is flat; row 0 is the top edge, row 1 the bottom
        const isTop = v < SEGMENTS + 1
        pos.setY(v, wave * (1 + swell) + (isTop ? 0.55 : -0.55))
      }
      pos.needsUpdate = true
    })
  })

  return (
    <>
      {ribbons.map((ribbon, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el }} position={[0, ribbon.y, ribbon.z]}>
          <planeGeometry args={[WIDTH, 1.1, SEGMENTS, 1]} />
          <meshBasicMaterial
            color={ribbon.color}
            transparent
            opacity={0.34}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  )
}

type RibbonWavesProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  backgroundColor: string
}

export default function RibbonWaves({ colors, tempo, scene, backgroundColor }: RibbonWavesProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: backgroundColor }}
      camera={{ position: [0, 0, 7], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <Ribbons colors={colors} tempo={tempo} scene={scene} />
    </Canvas>
  )
}
