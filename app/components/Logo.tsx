import React from 'react'
import Image from 'next/image'

type LogoProps = {
  size?: number
  withWordmark?: boolean
  className?: string
}

/**
 * Moodify brand mark: the original wave-banded circle (public/logo.svg),
 * rebuilt as a clean hand-authored SVG — same waves and palette as the
 * traced original, without the trace artifacts.
 */
export default function Logo({ size = 48, withWordmark = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image src="/logo.svg" alt="Moodify logo" width={size} height={size} priority />
      {withWordmark && (
        <span
          className="moodify-gradient-text font-extrabold tracking-tight"
          style={{ fontSize: size * 0.62, lineHeight: 1 }}
        >
          Moodify
        </span>
      )}
    </span>
  )
}
