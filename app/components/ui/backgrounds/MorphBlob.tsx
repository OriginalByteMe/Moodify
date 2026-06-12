'use client'

import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { SceneConfig } from '@/lib/mood-visuals'

// Ashima/iq 3D simplex noise (MIT) — standard GLSL snippet
const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`

const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uFreq;
uniform float uBeat;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewDir;
${NOISE_GLSL}
void main() {
  float n = snoise(normal * uFreq + vec3(uTime * 0.4, uTime * 0.27, uTime * 0.33));
  float displacement = n * uAmp * (1.0 + 0.35 * uBeat);
  vec3 displaced = position + normal * displacement;
  // Whole blob breathes on the beat
  displaced *= 1.0 + 0.05 * uBeat;
  vDisplacement = n;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`

const FRAGMENT_SHADER = /* glsl */ `
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uBrightness;
varying float vDisplacement;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  // Valleys take color1, peaks take color2; rim light in color3
  float mixFactor = smoothstep(-1.0, 1.0, vDisplacement);
  vec3 base = mix(uColor1, uColor2, mixFactor);
  float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.2);
  vec3 color = mix(base, uColor3, fresnel * 0.85) * uBrightness;
  gl_FragColor = vec4(color, 1.0);
}
`

type BlobProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
}

/**
 * Organic noise-displaced blob that breathes with the track: surface
 * turbulence follows the genre preset, the pulse follows the BPM.
 */
function Blob({ colors, tempo, scene }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 110
    return bpm / 60
  }, [tempo])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uBeat: { value: 0 },
    uAmp: { value: 0.18 + scene.uStrength * 0.09 },
    uFreq: { value: 0.8 + scene.uFrequency * 0.22 },
    uBrightness: { value: Math.min(1.4, scene.brightness) },
    uColor1: { value: new THREE.Color(colors[0]) },
    uColor2: { value: new THREE.Color(colors[1]) },
    uColor3: { value: new THREE.Color(colors[2]) },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  // Keep colors/params in sync without rebuilding the material
  React.useEffect(() => {
    uniforms.uColor1.value.set(colors[0])
    uniforms.uColor2.value.set(colors[1])
    uniforms.uColor3.value.set(colors[2])
    uniforms.uAmp.value = 0.18 + scene.uStrength * 0.09
    uniforms.uFreq.value = 0.8 + scene.uFrequency * 0.22
    uniforms.uBrightness.value = Math.min(1.4, scene.brightness)
  }, [colors, scene.uStrength, scene.uFrequency, scene.brightness, uniforms])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const beatPhase = (t * bps) % 1
    uniforms.uTime.value = t * (0.4 + scene.uSpeed * 0.6)
    uniforms.uBeat.value = Math.exp(-4 * beatPhase)
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.08 * (0.5 + scene.uSpeed)
      meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.2
    }
  })

  return (
    <mesh ref={meshRef} scale={2.1}>
      <icosahedronGeometry args={[1, 48]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
      />
    </mesh>
  )
}

type MorphBlobProps = {
  colors: string[]
  tempo?: number
  scene: SceneConfig
  backgroundColor: string
}

export default function MorphBlob({ colors, tempo, scene, backgroundColor }: MorphBlobProps) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: backgroundColor }}
      camera={{ position: [0, 0, 6.5], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <Blob colors={colors} tempo={tempo} scene={scene} />
    </Canvas>
  )
}
