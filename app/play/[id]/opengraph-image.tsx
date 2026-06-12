// /play links share the same OG image renderer as /share links.
// Config exports must be literals so Next.js can statically analyze them.
export { default } from '../../share/[id]/opengraph-image'

export const alt = 'Moodify track visualization'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'
export const revalidate = 3600
