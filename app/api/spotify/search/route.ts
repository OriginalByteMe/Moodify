import { NextRequest, NextResponse } from 'next/server';
import { searchSpotify } from '@/lib/spotify';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get('q');
    
    if (!searchQuery || !searchQuery.trim()) {
        return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
        );
    }
    
    try {
        const data = await searchSpotify(searchQuery);
        return NextResponse.json({ tracks: data }, { status: 200 });
    } catch (error) {
        console.error('Error searching Spotify:', error);
        return NextResponse.json(
            { error: 'Failed to search Spotify' },
            { status: 500 }
        );
    }
}