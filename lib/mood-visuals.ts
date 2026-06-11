/**
 * Mood-driven 3D scene engine.
 *
 * Turns what we know about a track (genres, derived mood, audio features,
 * colour palette) into a ShaderGradient scene configuration. Every genre
 * family has its own visual language (rock is jagged and aggressive, EDM is
 * fast liquid, hip-hop is heavy and slow, classical is calm silk, ...), and
 * tracks that span genres get a weighted blend of those languages.
 *
 * Scenes are seeded per track but include a per-mount variation salt, so a
 * song always feels like "itself" while never rendering exactly the same
 * scene twice.
 */

export type GradientType = 'plane' | 'sphere' | 'waterPlane'

/**
 * Which background implementation draws the scene:
 * - 'gradient': ShaderGradient lava-lamp surfaces
 * - 'particles': custom R3F particle field, orbiting and thumping on the beat
 * - 'blob': custom R3F noise-displaced blob, breathing with the tempo
 */
export type SceneRenderer = 'gradient' | 'particles' | 'blob'

export interface SceneConfig {
  renderer: SceneRenderer
  type: GradientType
  uSpeed: number
  uStrength: number
  uDensity: number
  uFrequency: number
  uAmplitude: number
  reflection: number
  brightness: number
  grain: 'on' | 'off'
  lightType: '3d' | 'env'
  envPreset: 'city' | 'dawn' | 'lobby'
  wireframe: boolean
  cAzimuthAngle: number
  cPolarAngle: number
  cDistance: number
  cameraZoom: number
  rotationX: number
  rotationY: number
  rotationZ: number
  positionY: number
  /** Palette ordering can be shuffled per scene for extra variety */
  colorOrder: [number, number, number]
}

/** Numeric parameter expressed as a [min, max] range to sample from */
type Range = [number, number]

interface GenrePreset {
  /** Substrings matched against raw Spotify genre strings (lowercase) */
  match: string[]
  types: Array<{ value: GradientType; weight: number }>
  /** Renderer mix for this family; falls back to DEFAULT_RENDERERS */
  renderers?: Array<{ value: SceneRenderer; weight: number }>
  uSpeed: Range
  uStrength: Range
  uDensity: Range
  uFrequency: Range
  uAmplitude: Range
  reflection: Range
  brightness: Range
  grain: 'on' | 'off'
  lightType: '3d' | 'env'
  envPreset: 'city' | 'dawn' | 'lobby'
  wireframeChance: number
  cDistance: Range
  cameraZoom: Range
  polarAngle: Range
}

export const GENRE_PRESETS: Record<string, GenrePreset> = {
  rock: {
    match: ['rock', 'grunge', 'punk', 'garage', 'psych'],
    types: [{ value: 'plane', weight: 3 }, { value: 'waterPlane', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.5 }, { value: 'particles', weight: 0.4 }, { value: 'blob', weight: 0.1 }],
    uSpeed: [0.5, 0.9], uStrength: [2.6, 3.6], uDensity: [1.6, 2.4],
    uFrequency: [6, 8.5], uAmplitude: [1.2, 1.6], reflection: [0.05, 0.15],
    brightness: [0.9, 1.2], grain: 'on', lightType: '3d', envPreset: 'city',
    wireframeChance: 0.25, cDistance: [2.4, 3.4], cameraZoom: [1, 1.4], polarAngle: [70, 95],
  },
  metal: {
    match: ['metal', 'hardcore', 'industrial', 'death', 'thrash', 'doom'],
    types: [{ value: 'plane', weight: 3 }, { value: 'sphere', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.45 }, { value: 'particles', weight: 0.45 }, { value: 'blob', weight: 0.1 }],
    uSpeed: [0.7, 1.1], uStrength: [3.2, 4.2], uDensity: [2, 3],
    uFrequency: [7.5, 10], uAmplitude: [1.4, 1.9], reflection: [0, 0.1],
    brightness: [0.6, 0.9], grain: 'on', lightType: '3d', envPreset: 'city',
    wireframeChance: 0.45, cDistance: [2, 3], cameraZoom: [1.1, 1.6], polarAngle: [60, 90],
  },
  edm: {
    match: ['edm', 'house', 'techno', 'dubstep', 'trance', 'electro', 'dance', 'rave', 'drum and bass', 'dnb', 'bass'],
    types: [{ value: 'waterPlane', weight: 3 }, { value: 'sphere', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.35 }, { value: 'particles', weight: 0.55 }, { value: 'blob', weight: 0.1 }],
    uSpeed: [0.8, 1.3], uStrength: [2.2, 3.2], uDensity: [1.4, 2],
    uFrequency: [5.5, 8], uAmplitude: [1.1, 1.5], reflection: [0.3, 0.6],
    brightness: [1.2, 1.6], grain: 'off', lightType: 'env', envPreset: 'city',
    wireframeChance: 0.08, cDistance: [2.2, 3.2], cameraZoom: [1, 1.5], polarAngle: [80, 110],
  },
  hiphop: {
    match: ['hip hop', 'hip-hop', 'rap', 'trap', 'drill', 'grime', 'boom bap'],
    types: [{ value: 'plane', weight: 2 }, { value: 'waterPlane', weight: 2 }],
    renderers: [{ value: 'gradient', weight: 0.5 }, { value: 'particles', weight: 0.2 }, { value: 'blob', weight: 0.3 }],
    uSpeed: [0.3, 0.55], uStrength: [3, 4], uDensity: [1, 1.5],
    uFrequency: [2, 3.5], uAmplitude: [1.5, 2], reflection: [0.1, 0.3],
    brightness: [0.8, 1.1], grain: 'on', lightType: '3d', envPreset: 'lobby',
    wireframeChance: 0.12, cDistance: [1.8, 2.6], cameraZoom: [1.2, 1.7], polarAngle: [75, 100],
  },
  pop: {
    match: ['pop', 'k-pop', 'j-pop', 'boy band', 'girl group', 'idol'],
    types: [{ value: 'sphere', weight: 2 }, { value: 'waterPlane', weight: 2 }, { value: 'plane', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.5 }, { value: 'particles', weight: 0.35 }, { value: 'blob', weight: 0.15 }],
    uSpeed: [0.45, 0.75], uStrength: [1.8, 2.6], uDensity: [1.1, 1.6],
    uFrequency: [4, 6], uAmplitude: [1, 1.4], reflection: [0.2, 0.45],
    brightness: [1.2, 1.5], grain: 'off', lightType: 'env', envPreset: 'city',
    wireframeChance: 0.05, cDistance: [2.4, 3.4], cameraZoom: [0.9, 1.3], polarAngle: [85, 110],
  },
  rnb: {
    match: ['r&b', 'rnb', 'soul', 'neo soul', 'funk', 'disco', 'motown'],
    types: [{ value: 'waterPlane', weight: 3 }, { value: 'sphere', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.5 }, { value: 'particles', weight: 0.15 }, { value: 'blob', weight: 0.35 }],
    uSpeed: [0.3, 0.55], uStrength: [1.4, 2.2], uDensity: [1, 1.4],
    uFrequency: [3, 4.5], uAmplitude: [1, 1.3], reflection: [0.35, 0.6],
    brightness: [1, 1.3], grain: 'off', lightType: 'env', envPreset: 'lobby',
    wireframeChance: 0, cDistance: [2.2, 3], cameraZoom: [1, 1.4], polarAngle: [85, 105],
  },
  jazz: {
    match: ['jazz', 'blues', 'bossa', 'swing', 'bebop', 'lounge'],
    types: [{ value: 'waterPlane', weight: 3 }, { value: 'plane', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.45 }, { value: 'particles', weight: 0.15 }, { value: 'blob', weight: 0.4 }],
    uSpeed: [0.2, 0.4], uStrength: [1.2, 2], uDensity: [0.9, 1.3],
    uFrequency: [3, 5], uAmplitude: [0.9, 1.2], reflection: [0.4, 0.7],
    brightness: [0.9, 1.2], grain: 'on', lightType: 'env', envPreset: 'lobby',
    wireframeChance: 0, cDistance: [2.6, 3.6], cameraZoom: [0.9, 1.2], polarAngle: [85, 105],
  },
  acoustic: {
    match: ['acoustic', 'folk', 'singer-songwriter', 'country', 'americana', 'bluegrass', 'indie folk'],
    types: [{ value: 'plane', weight: 3 }, { value: 'waterPlane', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.55 }, { value: 'particles', weight: 0.1 }, { value: 'blob', weight: 0.35 }],
    uSpeed: [0.15, 0.35], uStrength: [1, 1.8], uDensity: [0.8, 1.2],
    uFrequency: [3, 4.5], uAmplitude: [0.8, 1.1], reflection: [0.2, 0.4],
    brightness: [1.1, 1.4], grain: 'off', lightType: 'env', envPreset: 'dawn',
    wireframeChance: 0, cDistance: [2.8, 3.8], cameraZoom: [0.8, 1.1], polarAngle: [90, 110],
  },
  classical: {
    match: ['classical', 'orchestra', 'piano', 'baroque', 'opera', 'symphony', 'chamber'],
    types: [{ value: 'waterPlane', weight: 2 }, { value: 'plane', weight: 2 }],
    renderers: [{ value: 'gradient', weight: 0.45 }, { value: 'particles', weight: 0.15 }, { value: 'blob', weight: 0.4 }],
    uSpeed: [0.1, 0.3], uStrength: [0.8, 1.6], uDensity: [0.7, 1.1],
    uFrequency: [2.5, 4], uAmplitude: [0.7, 1], reflection: [0.4, 0.7],
    brightness: [1, 1.3], grain: 'off', lightType: 'env', envPreset: 'dawn',
    wireframeChance: 0, cDistance: [3, 4], cameraZoom: [0.8, 1.1], polarAngle: [90, 115],
  },
  ambient: {
    match: ['ambient', 'chill', 'lo-fi', 'lofi', 'downtempo', 'shoegaze', 'dream', 'sleep', 'new age'],
    types: [{ value: 'sphere', weight: 2 }, { value: 'waterPlane', weight: 2 }],
    renderers: [{ value: 'gradient', weight: 0.35 }, { value: 'particles', weight: 0.2 }, { value: 'blob', weight: 0.45 }],
    uSpeed: [0.1, 0.25], uStrength: [1, 1.8], uDensity: [0.8, 1.2],
    uFrequency: [2, 3.5], uAmplitude: [0.8, 1.2], reflection: [0.3, 0.6],
    brightness: [0.9, 1.2], grain: 'on', lightType: 'env', envPreset: 'dawn',
    wireframeChance: 0, cDistance: [3, 4.2], cameraZoom: [0.8, 1.1], polarAngle: [90, 120],
  },
  latin: {
    match: ['latin', 'reggaeton', 'salsa', 'cumbia', 'bachata', 'afrobeat', 'dancehall', 'reggae', 'samba'],
    types: [{ value: 'waterPlane', weight: 2 }, { value: 'sphere', weight: 1 }, { value: 'plane', weight: 1 }],
    renderers: [{ value: 'gradient', weight: 0.45 }, { value: 'particles', weight: 0.4 }, { value: 'blob', weight: 0.15 }],
    uSpeed: [0.55, 0.9], uStrength: [2, 3], uDensity: [1.2, 1.8],
    uFrequency: [4.5, 6.5], uAmplitude: [1.1, 1.5], reflection: [0.25, 0.5],
    brightness: [1.2, 1.5], grain: 'off', lightType: 'env', envPreset: 'city',
    wireframeChance: 0.05, cDistance: [2.2, 3.2], cameraZoom: [1, 1.4], polarAngle: [80, 105],
  },
}

/** Fallback when nothing matches: the current Moodify lava-lamp feel */
const DEFAULT_RENDERERS: Array<{ value: SceneRenderer; weight: number }> = [
  { value: 'gradient', weight: 0.55 },
  { value: 'particles', weight: 0.25 },
  { value: 'blob', weight: 0.2 },
]

const DEFAULT_PRESET: GenrePreset = {
  match: [],
  types: [{ value: 'plane', weight: 2 }, { value: 'waterPlane', weight: 2 }],
  renderers: DEFAULT_RENDERERS,
  uSpeed: [0.3, 0.6], uStrength: [2, 3], uDensity: [1.1, 1.6],
  uFrequency: [4.5, 6.5], uAmplitude: [1, 1.4], reflection: [0.1, 0.3],
  brightness: [1, 1.3], grain: 'on', lightType: '3d', envPreset: 'city',
  wireframeChance: 0.05, cDistance: [2.4, 3.4], cameraZoom: [0.9, 1.3], polarAngle: [80, 105],
}

/** Mood labels from the backend mood engine bias the genre look */
const MOOD_MODIFIERS: Record<string, { speed: number; strength: number; brightness: number; wireframeBoost?: number }> = {
  euphoric:    { speed: 1.25, strength: 1.1, brightness: 1.15 },
  energetic:   { speed: 1.2,  strength: 1.15, brightness: 1 },
  aggressive:  { speed: 1.3,  strength: 1.3, brightness: 0.8, wireframeBoost: 0.2 },
  groovy:      { speed: 1.05, strength: 1, brightness: 1.1 },
  confident:   { speed: 1,    strength: 1.05, brightness: 1 },
  brooding:    { speed: 0.9,  strength: 1.1, brightness: 0.75 },
  serene:      { speed: 0.7,  strength: 0.8, brightness: 1.1 },
  dreamy:      { speed: 0.75, strength: 0.85, brightness: 0.95 },
  melancholic: { speed: 0.65, strength: 0.85, brightness: 0.8 },
}

/** Deterministic 32-bit hash for strings */
export function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Mulberry32 seeded PRNG: tiny, fast, good enough for visuals */
export function createRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Match raw Spotify genre strings against presets.
 * Returns weights normalized to sum to 1 (empty when nothing matches).
 */
export function matchGenres(genres: string[] | undefined): Array<{ key: string; weight: number }> {
  if (!genres?.length) return []
  const counts = new Map<string, number>()
  for (const raw of genres) {
    const genre = raw.toLowerCase()
    for (const [key, preset] of Object.entries(GENRE_PRESETS)) {
      if (preset.match.some((m) => genre.includes(m))) {
        counts.set(key, (counts.get(key) ?? 0) + 1)
        break // first preset wins per genre string to avoid double counting
      }
    }
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0)
  if (!total) return []
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, weight: count / total }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
}

function sample(rng: () => number, [min, max]: Range): number {
  return min + rng() * (max - min)
}

function pickWeighted<T>(rng: () => number, options: Array<{ value: T; weight: number }>): T {
  const total = options.reduce((acc, o) => acc + o.weight, 0)
  let roll = rng() * total
  for (const option of options) {
    roll -= option.weight
    if (roll <= 0) return option.value
  }
  return options[options.length - 1].value
}

export interface SceneInput {
  trackId?: string
  genres?: string[]
  mood?: string
  tempo?: number
  energy?: number
  valence?: number
  /**
   * Changes on every mount so the same track renders a fresh scene each
   * visit while staying within its genre/mood family.
   */
  variationSeed?: number
}

/**
 * Build a full scene configuration for a track. Multi-genre tracks blend
 * their genre presets proportionally (numeric params are weighted averages,
 * discrete params are weighted picks).
 */
export function buildSceneConfig(input: SceneInput): SceneConfig {
  const { trackId, genres, mood, tempo, energy, valence, variationSeed = 0 } = input
  const seed = hashString(trackId ?? 'moodify-default') ^ (variationSeed >>> 0)
  const rng = createRng(seed)

  let matched = matchGenres(genres)
  if (!matched.length) matched = [{ key: '__default__', weight: 1 }]
  const presets = matched.map(({ key, weight }) => ({
    preset: GENRE_PRESETS[key] ?? DEFAULT_PRESET,
    weight,
  }))

  // Weighted blend of numeric ranges (each sampled within its preset range)
  const blend = (pick: (p: GenrePreset) => Range): number =>
    presets.reduce((acc, { preset, weight }) => acc + sample(rng, pick(preset)) * weight, 0)

  let uSpeed = blend((p) => p.uSpeed)
  let uStrength = blend((p) => p.uStrength)
  const uDensity = blend((p) => p.uDensity)
  const uFrequency = blend((p) => p.uFrequency)
  const uAmplitude = blend((p) => p.uAmplitude)
  const reflection = blend((p) => p.reflection)
  let brightness = blend((p) => p.brightness)
  const cDistance = blend((p) => p.cDistance)
  const cameraZoom = blend((p) => p.cameraZoom)
  const cPolarAngle = blend((p) => p.polarAngle)

  // Discrete params: weighted pick across presets
  const typeOptions = presets.flatMap(({ preset, weight }) =>
    preset.types.map((t) => ({ value: t.value, weight: t.weight * weight }))
  )
  const type = pickWeighted(rng, typeOptions)
  const rendererOptions = presets.flatMap(({ preset, weight }) =>
    (preset.renderers ?? DEFAULT_RENDERERS).map((r) => ({ value: r.value, weight: r.weight * weight }))
  )
  const renderer = pickWeighted(rng, rendererOptions)
  const dominant = presets[0].preset
  const grain = dominant.grain
  const lightType = dominant.lightType
  const envPreset = dominant.envPreset
  const wireframeChance = presets.reduce((acc, { preset, weight }) => acc + preset.wireframeChance * weight, 0)

  // Mood biases the family look
  const modifier = mood ? MOOD_MODIFIERS[mood] : undefined
  if (modifier) {
    uSpeed *= modifier.speed
    uStrength *= modifier.strength
    brightness *= modifier.brightness
  }
  const wireframe = rng() < wireframeChance + (modifier?.wireframeBoost ?? 0)

  // Audio features fine-tune: tempo nudges speed, energy nudges turbulence
  if (typeof tempo === 'number' && tempo > 0) {
    const tempoNorm = Math.max(0, Math.min(1, (tempo - 60) / 120))
    uSpeed = uSpeed * 0.7 + (0.2 + tempoNorm * 0.9) * 0.5
  }
  if (typeof energy === 'number') {
    uStrength *= 0.85 + energy * 0.3
  }
  if (typeof valence === 'number') {
    brightness *= 0.9 + valence * 0.2
  }

  // Per-scene camera drift and palette rotation for extra uniqueness
  const cAzimuthAngle = Math.round(rng() * 360)
  const rotationY = Math.round(rng() * 40 - 20)
  const orders: Array<[number, number, number]> = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [2, 1, 0]]
  const colorOrder = orders[Math.floor(rng() * orders.length)]

  const round = (n: number, dp = 2) => Number(n.toFixed(dp))

  return {
    renderer,
    type,
    uSpeed: round(Math.max(0.05, Math.min(1.6, uSpeed))),
    uStrength: round(Math.max(0.5, Math.min(4.5, uStrength))),
    uDensity: round(Math.max(0.5, Math.min(3, uDensity))),
    uFrequency: round(Math.max(1.5, Math.min(10, uFrequency))),
    uAmplitude: round(Math.max(0.5, Math.min(2, uAmplitude))),
    reflection: round(Math.max(0, Math.min(0.8, reflection))),
    brightness: round(Math.max(0.4, Math.min(1.8, brightness))),
    grain,
    lightType,
    envPreset,
    wireframe,
    cAzimuthAngle,
    cPolarAngle: Math.round(cPolarAngle),
    cDistance: round(cDistance, 1),
    cameraZoom: round(cameraZoom, 1),
    rotationX: 0,
    rotationY,
    rotationZ: 50,
    positionY: round(type === 'waterPlane' ? -0.3 : 0, 1),
    colorOrder,
  }
}
