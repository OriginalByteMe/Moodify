import { NextRequest, NextResponse } from 'next/server';
import { searchSpotify } from '@/lib/spotify';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const limit = parseInt(searchParams.get('limit') ?? '12', 10);
    const type = searchParams.get('type') ?? 'track';
    
    if (!searchQuery || !searchQuery.trim()) {
        return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
        );
    }
    
    try {
        const data = await searchSpotify(searchQuery, offset, limit, type);
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return NextResponse.json(
            { error: 'Failed to search Spotify' },
            { status: 500 }
        );
    }
}