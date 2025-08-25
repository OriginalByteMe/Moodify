import { NextRequest, NextResponse } from 'next/server';
import { getAlbumTracks } from '@/lib/spotify';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const albumId = params.id;
  
  if (!albumId) {
    return NextResponse.json(
      { error: 'Album ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const tracks = await getAlbumTracks(albumId);
    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album tracks' },
      { status: 500 }
    );
  }
}