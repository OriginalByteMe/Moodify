'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { matchGenres, createRng, hashString } from '@/lib/mood-visuals'

/**
 * Pixelated stick-figure dancers that live on the play screen, dance to the
 * track's BPM in genre-appropriate costumes, and can be grabbed, thrown and
 * parked anywhere on the UI with the mouse.
 *
 * Sprites are hand-drawn 12x16 pixel maps rendered to data URLs (one canvas
 * per costume+frame, cached), animated by swapping frames on half-beats.
 */

// ---------------------------------------------------------------------------
// Sprite art: '.' transparent, S skin, B body, L legs, H hair/hat, A accent
// ---------------------------------------------------------------------------

const FRAMES: Record<string, string[]> = {
  stand: [
    '....HHHH....',
    '....HHHH....',
    '....SSSS....',
    '....SSSS....',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    'S.BBBBBBBB.S',
    'S.BBBBBBBB.S',
    '..BBBBBBBB..',
    '....LLLL....',
    '...LL..LL...',
    '...LL..LL...',
    '...LL..LL...',
    '...LL..LL...',
    '..LL....LL..',
    '..LL....LL..',
  ],
  step: [
    '....HHHH....',
    '....HHHH....',
    '....SSSS....',
    '....SSSS....',
    '..BBBBBBBB..',
    '.SBBBBBBBBS.',
    'S.BBBBBBBB.S',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '....LLLL....',
    '...LL.LL....',
    '..LL...LL...',
    '..LL....LL..',
    '.LL......LL.',
    '.LL......LL.',
    '............',
  ],
  armsup: [
    'S...HHHH...S',
    'S...HHHH...S',
    '.S..SSSS..S.',
    '.S..SSSS..S.',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '....LLLL....',
    '...LL..LL...',
    '...LL..LL...',
    '...LL..LL...',
    '...LL..LL...',
    '..LL....LL..',
    '..LL....LL..',
  ],
  jump: [
    '.S..HHHH..S.',
    'S...HHHH...S',
    '....SSSS....',
    '....SSSS....',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '...LLLLLL...',
    '..LL....LL..',
    '.LL......LL.',
    '............',
    '............',
    '............',
    '............',
    '............',
  ],
}

type HatStyle = 'none' | 'mohawk' | 'cap' | 'headband'

/** Extra pixels drawn over the head in the accent colour */
const HAT_OVERLAYS: Record<HatStyle, Array<[number, number]>> = {
  none: [],
  mohawk: [[5, 0], [6, 0], [5, 1], [6, 1]],
  cap: [[4, 0], [5, 0], [6, 0], [7, 0], [8, 1], [9, 1]],
  headband: [[4, 1], [5, 1], [6, 1], [7, 1]],
}

interface Costume {
  skin: string
  body: string
  legs: string
  hair: string
  accent: string
  hat: HatStyle
  /** Frame sequence + how hard this crew bounces */
  sequence: Array<keyof typeof FRAMES>
  bounce: number
  /** Half-beats per frame; 1 = every half-beat (frantic), 2 = every beat */
  stepDiv: number
}

const SKIN_TONES = ['#f2c094', '#d49a6a', '#a16c43', '#7c4a26']

/** Genre family -> crew look + dance style */
const COSTUMES: Record<string, Omit<Costume, 'skin'>> = {
  rock:      { body: '#1f1f23', legs: '#2c3a8c', hair: '#111111', accent: '#e63946', hat: 'headband', sequence: ['stand', 'armsup', 'stand', 'armsup'], bounce: 10, stepDiv: 1 },
  metal:     { body: '#0c0c0e', legs: '#161618', hair: '#26140a', accent: '#9d0208', hat: 'mohawk',   sequence: ['stand', 'armsup', 'stand', 'armsup'], bounce: 12, stepDiv: 1 },
  edm:       { body: '#5a189a', legs: '#10002b', hair: '#22d3ee', accent: '#f72585', hat: 'cap',      sequence: ['step', 'armsup', 'jump', 'step'],     bounce: 16, stepDiv: 1 },
  hiphop:    { body: '#212529', legs: '#343a40', hair: '#111111', accent: '#ffd60a', hat: 'cap',      sequence: ['stand', 'step', 'stand', 'step'],     bounce: 7,  stepDiv: 2 },
  pop:       { body: '#ff5d8f', legs: '#3a86ff', hair: '#6a3b16', accent: '#ffd60a', hat: 'none',     sequence: ['step', 'armsup', 'step', 'jump'],     bounce: 12, stepDiv: 2 },
  rnb:       { body: '#7f5539', legs: '#582f0e', hair: '#111111', accent: '#e6ccb2', hat: 'none',     sequence: ['stand', 'step', 'armsup', 'step'],    bounce: 6,  stepDiv: 2 },
  jazz:      { body: '#283618', legs: '#1d3557', hair: '#3d2613', accent: '#e9c46a', hat: 'headband', sequence: ['stand', 'step', 'armsup', 'step'],    bounce: 5,  stepDiv: 2 },
  acoustic:  { body: '#6f4518', legs: '#386641', hair: '#7f4f24', accent: '#d4a373', hat: 'none',     sequence: ['stand', 'step', 'stand', 'step'],     bounce: 4,  stepDiv: 2 },
  classical: { body: '#14213d', legs: '#000000', hair: '#5e503f', accent: '#e5e5e5', hat: 'none',     sequence: ['stand', 'step', 'armsup', 'step'],    bounce: 4,  stepDiv: 2 },
  ambient:   { body: '#3f6e8c', legs: '#274c5e', hair: '#b9d6f2', accent: '#90e0ef', hat: 'none',     sequence: ['stand', 'step', 'stand', 'armsup'],   bounce: 4,  stepDiv: 2 },
  latin:     { body: '#e07a1f', legs: '#9d2235', hair: '#1b1b1b', accent: '#ffd60a', hat: 'headband', sequence: ['step', 'armsup', 'jump', 'step'],     bounce: 13, stepDiv: 1 },
  default:   { body: '#6d28d9', legs: '#0891b2', hair: '#3d2613', accent: '#ea580c', hat: 'none',     sequence: ['stand', 'step', 'armsup', 'step'],    bounce: 9,  stepDiv: 2 },
}

const SPRITE_W = 12
const SPRITE_H = 16
const SCALE = 4
const DANCER_COUNT = 5

function renderFrameDataUrl(frameName: keyof typeof FRAMES, costume: Costume, flip: boolean): string {
  const canvas = document.createElement('canvas')
  canvas.width = SPRITE_W
  canvas.height = SPRITE_H
  const ctx = canvas.getContext('2d')!
  const colorFor: Record<string, string> = {
    S: costume.skin, B: costume.body, L: costume.legs, H: costume.hair, A: costume.accent,
  }
  const rows = FRAMES[frameName]
  for (let y = 0; y < SPRITE_H; y++) {
    for (let x = 0; x < SPRITE_W; x++) {
      const ch = rows[y][flip ? SPRITE_W - 1 - x : x]
      if (ch !== '.' && colorFor[ch]) {
        ctx.fillStyle = colorFor[ch]
        ctx.fillRect(x, y, 1, 1)
      }
    }
  }
  ctx.fillStyle = costume.accent
  for (const [hx, hy] of HAT_OVERLAYS[costume.hat]) {
    ctx.fillRect(flip ? SPRITE_W - 1 - hx : hx, hy, 1, 1)
  }
  return canvas.toDataURL()
}

interface DancerState {
  el: HTMLImageElement | null
  costume: Costume
  frames: Record<string, { normal: string; flipped: string }>
  x: number
  floorY: number
  vx: number
  vy: number
  dir: 1 | -1
  phaseOffset: number
  dragging: boolean
  falling: boolean
  lastFrameKey: string
}

type Props = {
  genres?: string[]
  tempo?: number
  trackId?: string
}

export default function PixelDancers({ genres, tempo, trackId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dancersRef = useRef<DancerState[]>([])
  const elsRef = useRef<Array<HTMLImageElement | null>>([])
  const dragRef = useRef<{ index: number; offsetX: number; offsetY: number; lastX: number; lastY: number; lastT: number; vx: number; vy: number } | null>(null)

  const bps = useMemo(() => {
    const bpm = typeof tempo === 'number' && tempo > 0 ? Math.max(60, Math.min(180, tempo)) : 110
    return bpm / 60
  }, [tempo])

  // Build the crew: costume pool from the track's genre families
  const crew = useMemo(() => {
    const rng = createRng(hashString(trackId ?? 'crew') ^ Date.now())
    const families = matchGenres(genres).map((m) => m.key)
    const pool = families.length ? families : ['default']
    return Array.from({ length: DANCER_COUNT }, (_, i) => {
      const family = pool[i % pool.length]
      const base = COSTUMES[family] ?? COSTUMES.default
      return {
        costume: { ...base, skin: SKIN_TONES[Math.floor(rng() * SKIN_TONES.length)] } as Costume,
        rngSeed: Math.floor(rng() * 0x7fffffff),
      }
    })
  }, [genres, trackId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const rngs = crew.map((c) => createRng(c.rngSeed))
    dancersRef.current = crew.map((c, i) => {
      const rng = rngs[i]
      const frames: DancerState['frames'] = {}
      for (const name of Object.keys(FRAMES)) {
        frames[name] = {
          normal: renderFrameDataUrl(name as keyof typeof FRAMES, c.costume, false),
          flipped: renderFrameDataUrl(name as keyof typeof FRAMES, c.costume, true),
        }
      }
      return {
        el: elsRef.current[i] ?? null,
        costume: c.costume,
        frames,
        x: 40 + rng() * Math.max(200, window.innerWidth - 140),
        floorY: window.innerHeight - 110 - rng() * 30,
        vx: (18 + rng() * 26) * (rng() > 0.5 ? 1 : -1),
        vy: 0,
        dir: rng() > 0.5 ? 1 : -1,
        phaseOffset: Math.floor(rng() * 4),
        dragging: false,
        falling: false,
        lastFrameKey: '',
      }
    })

    let raf = 0
    let lastT = performance.now() / 1000
    const tick = () => {
      const t = performance.now() / 1000
      const dt = Math.min(0.05, t - lastT)
      lastT = t
      const halfBeats = t * bps * 2
      const beatPhase = (t * bps) % 1
      const thump = Math.exp(-4 * beatPhase)

      for (const d of dancersRef.current) {
        if (!d.el) continue
        if (!d.dragging) {
          if (d.falling) {
            d.vy += 1400 * dt
            d.floorY += d.vy * dt
            d.x += d.vx * dt
            const ground = window.innerHeight - 80
            if (d.floorY >= ground) {
              d.floorY = ground
              d.falling = false
              d.vy = 0
            }
          } else {
            // Wander, turn at viewport edges (or randomly)
            d.x += d.vx * dt
            if (d.x < 10 || d.x > window.innerWidth - SPRITE_W * SCALE - 10) {
              d.vx *= -1
            }
            d.dir = d.vx >= 0 ? 1 : -1
          }
        }

        const seq = d.costume.sequence
        const frameIdx = Math.floor(halfBeats / d.costume.stepDiv + d.phaseOffset) % seq.length
        const frameName = seq[frameIdx]
        const bounce = d.dragging || d.falling ? 0 : Math.abs(Math.sin(Math.PI * (t * bps + d.phaseOffset * 0.25))) * d.costume.bounce * (0.6 + 0.4 * thump)
        const frameKey = `${frameName}-${d.dir}`
        if (frameKey !== d.lastFrameKey) {
          d.el.src = d.dir === 1 ? d.frames[frameName].normal : d.frames[frameName].flipped
          d.lastFrameKey = frameKey
        }
        d.el.style.transform = `translate(${d.x}px, ${d.floorY - bounce}px)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [crew, bps])

  const onPointerDown = (index: number) => (e: React.PointerEvent<HTMLImageElement>) => {
    const d = dancersRef.current[index]
    if (!d) return
    d.dragging = true
    d.falling = false
    dragRef.current = {
      index,
      offsetX: e.clientX - d.x,
      offsetY: e.clientY - d.floorY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: performance.now() / 1000,
      vx: 0,
      vy: 0,
    }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const d = dancersRef.current[drag.index]
    if (!d?.dragging) return
    const t = performance.now() / 1000
    const dt = Math.max(1e-3, t - drag.lastT)
    drag.vx = (e.clientX - drag.lastX) / dt
    drag.vy = (e.clientY - drag.lastY) / dt
    drag.lastX = e.clientX
    drag.lastY = e.clientY
    drag.lastT = t
    d.x = e.clientX - drag.offsetX
    d.floorY = e.clientY - drag.offsetY
  }

  const onPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current
    if (!drag) return
    const d = dancersRef.current[drag.index]
    dragRef.current = null
    if (!d) return
    d.dragging = false
    // Thrown hard -> tumble with gravity; placed gently -> dance right there
    const speed = Math.hypot(drag.vx, drag.vy)
    if (speed > 350) {
      d.falling = true
      d.vx = Math.max(-280, Math.min(280, drag.vx * 0.5))
      d.vy = Math.max(-500, Math.min(300, drag.vy * 0.4))
    } else {
      d.vx = (Math.abs(d.vx) || 22) * (d.dir || 1)
    }
    ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
      {crew.map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          ref={(el) => {
            elsRef.current[i] = el
            if (dancersRef.current[i]) dancersRef.current[i].el = el
          }}
          alt=""
          draggable={false}
          onPointerDown={onPointerDown(i)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing select-none"
          style={{
            width: SPRITE_W * SCALE,
            height: SPRITE_H * SCALE,
            imageRendering: 'pixelated',
            willChange: 'transform',
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
          }}
        />
      ))}
    </div>
  )
}
