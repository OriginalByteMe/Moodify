import { NextRequest, NextResponse } from 'next/server';
import { fetchTrackFromDatabase, uploadTrackToDatabase } from '@/lib/database-handler';

export async function GET(request: NextRequest) {
  try {
    const data = await fetchTrackFromDatabase(request.nextUrl.searchParams.get('id') || '');
    return NextResponse.json({ track: data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching from database:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { track } = body;
    const data = await uploadTrackToDatabase(track);
    return NextResponse.json({ track: data }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to database:', error);
    return NextResponse.json(
      { error: 'Failed to upload to database' },
      { status: 500 }
    );
  }
}


    