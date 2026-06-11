import React from 'react'

type LogoProps = {
  size?: number
  withWordmark?: boolean
  className?: string
}

/**
 * Moodify brand mark: a glassy "mood prism" tile where three colour fields
 * (violet / orange / cyan — the brand triad) melt into each other behind a
 * waveform, echoing what the app does: turn sound into colour.
 */
export default function Logo({ size = 48, withWordmark = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Moodify logo"
      >
        <defs>
          <radialGradient id="moodify-violet" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6D28D9" />
          </radialGradient>
          <radialGradient id="moodify-orange" cx="75%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FDBA74" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>
          <radialGradient id="moodify-cyan" cx="50%" cy="85%" r="75%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#0891B2" />
          </radialGradient>
          <filter id="moodify-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id="moodify-tile">
            <rect x="2" y="2" width="60" height="60" rx="16" />
          </clipPath>
        </defs>

        <rect x="2" y="2" width="60" height="60" rx="16" fill="#0F0A1E" />
        <g clipPath="url(#moodify-tile)">
          <circle cx="20" cy="20" r="22" fill="url(#moodify-violet)" filter="url(#moodify-blur)" opacity="0.95" />
          <circle cx="48" cy="24" r="20" fill="url(#moodify-orange)" filter="url(#moodify-blur)" opacity="0.9" />
          <circle cx="34" cy="52" r="22" fill="url(#moodify-cyan)" filter="url(#moodify-blur)" opacity="0.9" />
          {/* Waveform: sound made visible */}
          <path
            d="M10 32 L16 32 L21 20 L27 44 L33 14 L39 50 L45 26 L50 38 L54 32 L58 32"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        <rect x="2" y="2" width="60" height="60" rx="16" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" fill="none" />
      </svg>
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
