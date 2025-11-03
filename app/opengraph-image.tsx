import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Image metadata
export const alt = 'Moodify - Pick a song, paint the mood'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Moodify brand color palette (from LavaLampBackground dark theme)
const BRAND_PALETTE = [
  [109, 40, 217],   // #6D28D9 - violet-700
  [234, 88, 12],    // #EA580C - orange-600
  [8, 145, 178],    // #0891B2 - cyan-600
  [167, 139, 250],  // #A78BFA - violet-400
  [251, 191, 36],   // #FBBF24 - amber-400
]

// Helper to convert RGB array to hex
function rgbToHex(rgb: number[]): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb[0])))
  const g = Math.max(0, Math.min(255, Math.round(rgb[1])))
  const b = Math.max(0, Math.min(255, Math.round(rgb[2])))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Image generation
export default async function Image() {
  // Load Moodify logo
  const logoSvg = await readFile(join(process.cwd(), 'public/logo.svg'), 'utf-8')
  const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

  // Get hex colors for gradient
  const color1 = rgbToHex(BRAND_PALETTE[0])
  const color2 = rgbToHex(BRAND_PALETTE[1])
  const color3 = rgbToHex(BRAND_PALETTE[2])
  const color4 = rgbToHex(BRAND_PALETTE[3])
  const color5 = rgbToHex(BRAND_PALETTE[4])

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          background: `
            linear-gradient(135deg,
              ${color1}22 0%,
              ${color2}22 25%,
              ${color3}22 50%,
              ${color4}22 75%,
              ${color5}22 100%
            ),
            linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)
          `,
          padding: 60,
          gap: 40,
        }}
      >
        {/* Moodify Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={logoDataUrl}
            width={300}
            height={300}
            alt="Moodify Logo"
            style={{
              filter: 'brightness(0) invert(1) drop-shadow(0 20px 50px rgba(0, 0, 0, 0.5))',
            }}
          />
        </div>

        {/* Title and Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Moodify
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 36,
              color: '#cbd5e1',
              fontWeight: 500,
            }}
          >
            Pick a song, paint the mood.
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: 24,
            borderRadius: 12,
            width: '85%',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            {BRAND_PALETTE.map((color, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                {/* Color swatch */}
                <div
                  style={{
                    display: 'flex',
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    backgroundColor: rgbToHex(color),
                    border: '3px solid white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  }}
                />
                {/* RGB value */}
                <div
                  style={{
                    display: 'flex',
                    fontSize: 16,
                    color: '#94a3b8',
                    fontFamily: 'monospace',
                  }}
                >
                  {color[0]},{color[1]},{color[2]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Marketing Stats */}
        <div
          style={{
            display: 'flex',
            gap: 32,
            fontSize: 28,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: '20px 40px',
            borderRadius: 12,
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <span>100% Awesome</span>
          </div>
          <div
            style={{
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            •
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>💰</span>
            <span>100% Free</span>
          </div>
          <div
            style={{
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            •
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32 }}>🕺</span>
            <span>100% Groovy</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
