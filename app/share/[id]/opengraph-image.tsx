import { ImageResponse } from 'next/og'
import { getTrackCached } from '@/lib/get-track-cached'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Moodify track visualization'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'
export const revalidate = 3600

const DEFAULT_PALETTE = [
  [109, 40, 217],
  [234, 88, 12],
  [8, 145, 178],
  [167, 139, 250],
  [251, 191, 36],
]

function rgbToHex(rgb: number[]): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb[0] ?? 0)))
  const g = Math.max(0, Math.min(255, Math.round(rgb[1] ?? 0)))
  const b = Math.max(0, Math.min(255, Math.round(rgb[2] ?? 0)))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function clampText(text: string, max = 80): string {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function formatStat(value: number | undefined, suffix = '', scale100 = false): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return 'N/A'
  const n = scale100 ? Math.round(value * 100) : Math.round(value)
  return `${n}${suffix}`
}

async function fetchAsDataUrl(url: string, timeout = 10000): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'MoodifyBot/1.0 (+https://moodify.app)',
        accept: 'image/*,*/*;q=0.8',
      },
      cache: 'force-cache',
    })
    clearTimeout(timeoutId)

    if (!response.ok) return null
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'
    const arr = await response.arrayBuffer()
    return `data:${contentType};base64,${Buffer.from(arr).toString('base64')}`
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const logoSvg = await readFile(join(process.cwd(), 'public/logo.svg'), 'utf-8')
  const logoDataUrl = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

  try {
    const track = await getTrackCached(params.id)

    if (!track) {
      return new ImageResponse(
        (
          <div
            style={{
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)',
              color: 'white',
              gap: 20,
            }}
          >
            <img src={logoDataUrl} width={180} height={180} alt="Moodify" style={{ filter: 'brightness(0) invert(1)' }} />
            <div style={{ fontSize: 64, fontWeight: 700 }}>Moodify</div>
            <div style={{ fontSize: 28, color: '#cbd5e1' }}>Pick a song, paint the mood.</div>
          </div>
        ),
        { ...size }
      )
    }

    const palette = track.colourPalette && track.colourPalette.length >= 3 ? track.colourPalette : DEFAULT_PALETTE
    const c1 = rgbToHex(palette[0])
    const c2 = rgbToHex(palette[1])
    const c3 = rgbToHex(palette[2])
    const c4 = rgbToHex(palette[3] ?? palette[0])
    const c5 = rgbToHex(palette[4] ?? palette[1])

    const title = clampText(track.title ?? 'Unknown Track', 64)
    const artists = clampText((track.artists ?? []).join(', ') || 'Unknown Artist', 64)
    const album = clampText(track.album ?? '', 56)

    const albumArtDataUrl = track.albumCover ? await fetchAsDataUrl(track.albumCover) : null

    const stats = [
      { label: 'Tempo', value: formatStat(track.tempo, ' BPM') },
      { label: 'Energy', value: formatStat(track.energy, '%', true) },
      { label: 'Dance', value: formatStat(track.danceability, '%', true) },
    ]

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            padding: 42,
            backgroundColor: '#0f172a',
            background: `radial-gradient(circle at 20% 20%, ${c1}55 0%, transparent 35%), radial-gradient(circle at 80% 10%, ${c2}40 0%, transparent 40%), radial-gradient(circle at 70% 90%, ${c3}50 0%, transparent 35%), linear-gradient(140deg, #0f172a 0%, #111827 45%, #020617 100%)`,
            color: 'white',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 180,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-evenly',
              opacity: 0.35,
            }}
          >
            {Array.from({ length: 34 }).map((_, i) => {
              const h = 30 + ((i * 37) % 120)
              return (
                <div
                  key={i}
                  style={{
                    width: 18,
                    height: h,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    background: i % 2 === 0 ? `${c4}` : `${c5}`,
                    boxShadow: '0 0 20px rgba(255,255,255,0.08)',
                  }}
                />
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(2,6,23,0.6)', padding: '10px 16px', borderRadius: 999 }}>
              <img src={logoDataUrl} width={28} height={28} alt="Moodify" style={{ filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: 24, fontWeight: 700 }}>Moodify</span>
            </div>
            <div style={{ fontSize: 20, color: '#cbd5e1' }}>Moodified preview</div>
          </div>

          <div style={{ display: 'flex', gap: 32, marginTop: 26, flex: 1, zIndex: 2 }}>
            <div
              style={{
                width: 360,
                height: 360,
                borderRadius: 20,
                overflow: 'hidden',
                background: 'rgba(15,23,42,0.75)',
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {albumArtDataUrl ? (
                <img src={albumArtDataUrl} width={360} height={360} alt={title} />
              ) : (
                <img src={logoDataUrl} width={220} height={220} alt="Moodify" style={{ filter: 'brightness(0) invert(1) opacity(0.85)' }} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}>
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
              <div style={{ fontSize: 30, color: '#dbeafe' }}>{artists}</div>
              <div style={{ fontSize: 22, color: '#93c5fd' }}>{album}</div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {stats.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'rgba(2,6,23,0.65)',
                      padding: '10px 14px',
                      borderRadius: 10,
                      minWidth: 130,
                    }}
                  >
                    <span style={{ fontSize: 16, color: '#93c5fd' }}>{s.label}</span>
                    <span style={{ fontSize: 24, fontWeight: 700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: 32,
              bottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: 'rgba(2,6,23,0.72)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14,
              padding: '12px 14px',
              zIndex: 3,
            }}
          >
            <div style={{ fontSize: 16, color: '#bfdbfe' }}>Palette</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {palette.slice(0, 5).map((rgb, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 999, border: '2px solid rgba(255,255,255,0.9)', background: rgbToHex(rgb) }} />
                  <div style={{ fontSize: 10, color: '#e2e8f0', fontFamily: 'monospace' }}>{rgb[0]},{rgb[1]},{rgb[2]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      { ...size }
    )
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            background: 'linear-gradient(140deg, #1f2937 0%, #111827 45%, #000000 100%)',
            color: 'white',
            gap: 16,
          }}
        >
          <div style={{ fontSize: 88, fontWeight: 700 }}>Moodify</div>
          <div style={{ fontSize: 28, color: '#cbd5e1' }}>Track preview unavailable right now</div>
        </div>
      ),
      { ...size }
    )
  }
}
