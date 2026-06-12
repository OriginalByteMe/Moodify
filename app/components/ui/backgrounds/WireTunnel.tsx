'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneConfig } from '@/lib/mood-visuals'

const RING_COUNT = 26
const SPACING = 2.2

type TunnelProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
}

/**
 * Flying through a wireframe tunnel of rings at the track's tempo.
 * Ring shape follows the genre's aggression: low segment counts give
 * jagged triangle/square rings (metal/rock), high counts smooth circles.
 * Every beat kicks the nearest rings outward.
 */
function Tunnel({ colors, tempo, scene }: TunnelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRefs = useRef<Array<THREE.Mesh | null>>([])

  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 110
    return bpm / 60
  }, [tempo])

  // Aggressive genres (high uFrequency) get fewer, sharper segments
  const radialSegments = useMemo(() => {
    const aggression = Math.max(0, Math.min(1, (scene.uFrequency - 2) / 8))
    return Math.max(3, Math.round(12 - aggression * 9))
  }, [scene.uFrequency])

  const palette = useMemo(() => colors.map((c) => new THREE.Color(c)), [colors])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const beatPhase = (t * bps) % 1
    const thump = Math.exp(-5 * beatPhase)
    const travel = t * (1.2 + scene.uSpeed * 2.2) * bps
    for (let i = 0; i < RING_COUNT; i++) {
      const ring = ringRefs.current[i]
      if (!ring) continue
      // Rings recycle: fly towards the camera then wrap to the back
      const z = ((i * SPACING + travel) % (RING_COUNT * SPACING)) - RING_COUNT * SPACING + 4
      ring.position.z = z
      ring.rotation.z = t * 0.3 * (i % 2 === 0 ? 1 : -1) + i * 0.4
      // The closest rings pop on the beat
      const closeness = Math.max(0, 1 - Math.abs(z + 4) / 8)
      const pulse = 1 + thump * 0.18 * closeness
      ring.scale.setScalar(pulse)
      const material = ring.material as THREE.MeshBasicMaterial
      material.opacity = 0.25 + closeness * 0.75
    }
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.25
    }
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: RING_COUNT }, (_, i) => (
        <mesh key={i} ref={(el) => { ringRefs.current[i] = el }}>
          <torusGeometry args={[3.6, 0.025 + scene.uStrength * 0.012, 4, radialSegments]} />
          <meshBasicMaterial
            color={palette[i % palette.length]}
            wireframe
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

type WireTunnelProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  backgroundColor: string
}

export default function WireTunnel({ colors, tempo, scene, backgroundColor }: WireTunnelProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: backgroundColor }}
      camera={{ position: [0, 0, 6], fov: 70 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'low-power' }}
    >
      <Tunnel colors={colors} tempo={tempo} scene={scene} />
    </Canvas>
  )
}
