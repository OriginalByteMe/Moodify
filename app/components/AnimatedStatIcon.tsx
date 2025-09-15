"use client"

import { motion, useReducedMotion } from "framer-motion"
import { AudioWaveform, BarChart3, Gauge, Guitar, KeyboardMusic, Mic2, Music, Smile, SquareActivity, Volume2 } from "lucide-react"
import React from "react"

type Kind =
  | 'danceability'
  | 'energy'
  | 'valence'
  | 'acousticness'
  | 'instrumentalness'
  | 'speechiness'
  | 'liveness'
  | 'loudness'
  | 'tempo'
  | 'key'
  | 'time_signature'
  | 'popularity'

export default function AnimatedStatIcon({ kind, className, value }: { kind: Kind; className?: string; value?: number }) {
  const prefersReduced = useReducedMotion()
  // Static fallbacks when reduced motion is enabled
  if (prefersReduced) {
    switch (kind) {
      case 'danceability':
        return <span className={className} role="img" aria-label="dance">💃</span>
      case 'popularity':
        return <BarChart3 className={className} />
      case 'energy':
        return <span className={className} role="img" aria-label="energy">⚡</span>
      case 'valence':
        return <Smile className={className} />
      case 'acousticness':
      case 'key':
        return <KeyboardMusic className={className} />
      case 'instrumentalness':
        return <Guitar className={className} />
      case 'speechiness':
        return <Mic2 className={className} />
      case 'liveness':
        return <span className={className} role="img" aria-label="liveness">👥</span>
      case 'loudness':
        return <Volume2 className={className} />
      case 'tempo':
        return <span className={className} role="img" aria-label="tempo">🏎️</span>
      case 'time_signature':
        return <Music className={className} />
      default:
        return <BarChart3 className={className} />
    }
  }
  const to01 = (v?: number) => {
    if (v === undefined || v === null) return 0.5
    let n = Number(v)
    if (!Number.isFinite(n)) return 0.5
    // Normalize common ranges
    if (kind === 'popularity') {
      // 0..100
      n = Math.max(0, Math.min(100, n)) / 100
    } else if (kind === 'tempo') {
      // Roughly 60..200 BPM -> 0..1
      n = Math.max(60, Math.min(200, n))
      n = (n - 60) / (200 - 60)
    } else if (kind === 'loudness') {
      // -60..0 dB -> 0..1
      n = Math.max(-60, Math.min(0, n))
      n = (n + 60) / 60
    } else {
      // Assume 0..1
      if (n > 1) n = Math.max(0, Math.min(100, n)) / 100
      if (n < 0) n = 0
    }
    return n
  }

  const n01 = to01(value)

  switch (kind) {
    case 'danceability':
      // Dancing emoji shimmy
      return (
        <motion.span
          className={className}
          role="img"
          aria-label="dance"
          animate={{ rotate: [-10 - n01 * 10, 10 + n01 * 10, -10 - n01 * 10], y: [0, -2 - n01 * 3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💃
        </motion.span>
      )
    case 'energy':
      // Electric bolt crackle
      return (
        <motion.span
          className={className}
          role="img"
          aria-label="energy"
          animate={{ scale: [1, 1.2 + n01 * 0.4, 1], rotate: [-5, 5, -5] }}
          transition={{ duration: 0.6 - n01 * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          ⚡
        </motion.span>
      )
    case 'valence':
      // Smiley that subtly bounces
      return (
        <motion.div className={className} aria-hidden>
          <motion.span animate={{ y: [0, -1 - n01 * 3, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="inline-block">
            <Smile className="w-4 h-4" />
          </motion.span>
        </motion.div>
      )
    case 'acousticness':
      // Wavy lines breathing
      return (
        <motion.svg width="20" height="20" viewBox="0 0 20 20" className={className} aria-hidden>
          <motion.path d="M2 10c3-4 5 4 8 0s5 4 8 0" fill="none" stroke="currentColor" strokeWidth="1.5"
            animate={{ d: [
              `M2 10c3-${4 - n01} 5 ${4 - n01} 8 0s5 ${4 - n01} 8 0`,
              `M2 10c3-${3 - n01} 5 ${3 - n01} 8 0s5 ${3 - n01} 8 0`,
              `M2 10c3-${4 - n01} 5 ${4 - n01} 8 0s5 ${4 - n01} 8 0`
            ] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>
      )
    case 'instrumentalness':
      // Music note bobbing
      return (
        <motion.div className={className} aria-hidden>
          <motion.span animate={{ y: [0, -1 - n01 * 4, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="inline-block">
            <Guitar className="w-4 h-4" />
          </motion.span>
        </motion.div>
      )
    case 'speechiness':
      // Speaking bubbles (three dots pulsing)
      return (
        <motion.svg width="20" height="20" viewBox="0 0 20 20" className={className} aria-hidden>
          <path d="M3 4h14v9H9l-4 3V4z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          {[0,1,2].map((i) => (
            <motion.circle key={i} cx={8 + i*3} cy={9} r={1} fill="currentColor" animate={{ opacity: [0.2, 0.3 + n01 * 0.7, 0.2] }} transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }} />
          ))}
        </motion.svg>
      )
    case 'liveness':
      // Group emoji bobbing like a crowd
      return (
        <motion.span
          className={className}
          role="img"
          aria-label="liveness"
          animate={{ y: [0, -2 - n01 * 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          👥
        </motion.span>
      )
    case 'loudness':
      // Expanding concentric circles
      return (
        <motion.svg width="20" height="20" viewBox="0 0 20 20" className={className} aria-hidden>
          {[0,1,2].map((i) => (
            <motion.circle key={i} cx="10" cy="10" r={2 + i*3} stroke="currentColor" strokeWidth="1.2" fill="none" initial={{ opacity: 0.2 }} animate={{ opacity: [0.2, 0.4 + n01 * 0.6, 0.2] }} transition={{ duration: 1.6 + i*0.2, repeat: Infinity }} />
          ))}
        </motion.svg>
      )
    case 'tempo':
      // Race car on a tiny road back and forth
      return (
        <div className={className} aria-hidden>
          <div className="relative w-5 h-5">

            {/* Car */}
            <motion.span
              className="absolute top-1/2 -translate-y-1/2"
              role="img"
              aria-label="race car"
              animate={{ x: [0, 12, 0] }}
              transition={{ duration: 1.8 - n01 * 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              🏎️
            </motion.span>
          </div>
        </div>
      )
    case 'key':
      // Rotating circle to indicate key wheel
      return (
        <motion.svg width="20" height="20" viewBox="0 0 20 20" className={className} aria-hidden>
          <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <motion.line x1="10" y1="10" x2="10" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ originX: 10, originY: 10 }} animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
        </motion.svg>
      )
    case 'time_signature':
      // 4/4 text pulsing
      return (
        <motion.div className={className} aria-hidden>
          <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.4, repeat: Infinity }} className="inline-block text-[10px] font-semibold align-middle">TS</motion.span>
        </motion.div>
      )
    case 'popularity':
      // Rising bars
      return (
        <motion.svg width="20" height="20" viewBox="0 0 20 20" className={className} aria-hidden>
          {[0,1,2].map((i) => (
            <motion.rect key={i} x={4 + i*4} y={6} width={3} height={8} rx={1.5} fill="currentColor" animate={{ height: [3, 10, 5, 12, 3] }} transition={{ duration: 2 + i*0.2, repeat: Infinity, ease: 'easeInOut' }} />
          ))}
        </motion.svg>
      )
    default:
      // Fallback to a minimal icon to avoid layout jumps
      return <BarChart3 className={className} />
  }
}
