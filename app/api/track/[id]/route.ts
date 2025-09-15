import { NextRequest, NextResponse } from 'next/server'
import { getTrackCached } from '@/lib/get-track-cached'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const track = await getTrackCached(params.id)
    if (!track) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json(track, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

