import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { trackTag } from '@/lib/get-track-cached'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const { tag, tags, trackId, trackIds } = body || {}
    const toTags: string[] = []
    if (typeof tag === 'string') toTags.push(tag)
    if (Array.isArray(tags)) toTags.push(...tags.filter((t: any) => typeof t === 'string'))
    if (typeof trackId === 'string') toTags.push(trackTag(trackId))
    if (Array.isArray(trackIds)) toTags.push(...trackIds.filter((id: any) => typeof id === 'string').map((id: string) => trackTag(id)))
    const unique = Array.from(new Set(toTags))
    for (const t of unique) {
      try { revalidateTag(t) } catch {}
    }
    return NextResponse.json({ revalidated: unique }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'failed to revalidate' }, { status: 500 })
  }
}

