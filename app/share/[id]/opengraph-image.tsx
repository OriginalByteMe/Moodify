import { ImageResponse } from 'next/og'
import { getTrackCached } from '@/lib/get-track-cached'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Image metadata
export const alt = 'Moodify track visualization'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
export const runtime = 'nodejs'

// Default emerald palette (fallback from LavaLampBackground)
const DEFAULT_PALETTE = [
  [109, 40, 217],   // violet-700
  [234, 88, 12],    // orange-600
  [8, 145, 178],    // cyan-600
  [167, 139, 250],  // violet-400
  [251, 191, 36],   // amber-400
]

// Helper to convert RGB array to hex
function rgbToHex(rgb: number[]): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb[0])))
  const g = Math.max(0, Math.min(255, Math.round(rgb[1])))
  const b = Math.max(0, Math.min(255, Math.round(rgb[2])))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Helper to format stat values
function formatStat(value: number | undefined): string {
  if (value === undefined) return 'N/A'
  return value < 1 ? value.toFixed(2) : Math.round(value).toString()
}

// Image generation
export default async function Image({ params }: { params: { id: string } }) {
  try {
    const track = await getTrackCached(params.id)

    if (!track) {
      // Return default Moodify image if track not found
      const logoSvg = await readFile(join(process.cwd(), 'public/logo.svg'), 'utf-8')

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
              backgroundColor: '#111827',
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
            }}
          >
            <div
              style={{
                fontSize: 128,
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              Moodify
            </div>
            <div
              style={{
                fontSize: 32,
                color: '#9ca3af',
                marginTop: 20,
              }}
            >
              Pick a song, paint the mood.
            </div>
          </div>
        ),
        {
          ...size,
        }
      )
    }

    // Use track palette or fallback to default
    const palette = track.colourPalette && track.colourPalette.length >= 5
      ? track.colourPalette
      : DEFAULT_PALETTE

    // Get gradient colors from first 3 palette colors
    const gradientColor1 = rgbToHex(palette[0])
    const gradientColor2 = rgbToHex(palette[1])
    const gradientColor3 = rgbToHex(palette[2])

    // Prepare album artwork
    const albumArt = track.albumCover
    const useDefaultLogo = !albumArt

    // Load logo for branding
    const logoSvg = await readFile(join(process.cwd(), 'public/logo.svg'), 'utf-8')
    const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

    // Format artist names
    const artistText = track.artists.join(', ')

    // Format stats
    const tempo = formatStat(track.tempo)
    const danceability = formatStat(track.danceability)
    const energy = formatStat(track.energy)

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0f172a',
            background: `linear-gradient(135deg,
              ${gradientColor1}22 0%,
              ${gradientColor2}22 50%,
              ${gradientColor3}22 100%
            ), linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)`,
            padding: 60,
            position: 'relative',
          }}
        >
          {/* Moodified branding - top right */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: '12px 24px',
              borderRadius: 12,
            }}
          >
            <img
              src={logoDataUrl}
              width={32}
              height={32}
              alt="Moodify"
              style={{
                filter: 'brightness(0) invert(1)',
              }}
            />
            <span
              style={{
                color: 'white',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              Moodified
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 40,
              flex: 1,
              alignItems: 'center',
            }}
          >
            {/* Album artwork or logo */}
            <div
              style={{
                width: 400,
                height: 400,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1e293b',
              }}
            >
              {useDefaultLogo ? (
                <img
                  src={logoDataUrl}
                  width={280}
                  height={280}
                  alt="Moodify Logo"
                  style={{
                    filter: 'brightness(0) invert(1) opacity(0.8)',
                  }}
                />
              ) : (
                <img
                  src={albumArt}
                  width={400}
                  height={400}
                  alt={track.title}
                />
              )}
            </div>

            {/* Track info and palette */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 30,
                flex: 1,
              }}
            >
              {/* Track title */}
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 'bold',
                  color: 'white',
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {track.title}
              </div>

              {/* Artist */}
              <div
                style={{
                  fontSize: 32,
                  color: '#cbd5e1',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                By {artistText}
              </div>

              {/* Color palette swatches */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: 24,
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    justifyContent: 'space-between',
                  }}
                >
                  {palette.slice(0, 5).map((color, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      {/* Color swatch */}
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          backgroundColor: rgbToHex(color),
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      />
                      {/* RGB value */}
                      <div
                        style={{
                          fontSize: 14,
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

              {/* Nerd stats */}
              <div
                style={{
                  display: 'flex',
                  gap: 24,
                  fontSize: 22,
                  color: '#e2e8f0',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  padding: 16,
                  borderRadius: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🎵</span>
                  <span>{tempo} BPM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>💃</span>
                  <span>{danceability}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚡</span>
                  <span>{energy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Return fallback image on error
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
            backgroundColor: '#111827',
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
          }}
        >
          <div
            style={{
              fontSize: 96,
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Moodify
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#9ca3af',
              marginTop: 20,
            }}
          >
            Pick a song, paint the mood.
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}
