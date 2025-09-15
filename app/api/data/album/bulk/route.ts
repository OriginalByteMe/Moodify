import { NextRequest, NextResponse } from 'next/server';
import { uploadAlbumsToDatabase } from '@/lib/database-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { albums } = body as { albums: Array<{
      spotifyId: string;
      album: string;
      artists: string | string[];
      albumCover?: string;
      colourPalette?: number[][];
    }> };

    if (!Array.isArray(albums)) {
      return NextResponse.json({ error: 'Invalid payload: albums must be an array' }, { status: 400 });
    }

    const result = await uploadAlbumsToDatabase(albums);
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error('Error uploading albums to database:', error);
    return NextResponse.json(
      { error: 'Failed to upload albums to database' },
      { status: 500 }
    );
  }
}

