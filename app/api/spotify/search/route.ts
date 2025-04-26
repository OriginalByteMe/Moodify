import { NextRequest, NextResponse } from 'next/server';
import { searchSpotify } from '@/lib/spotify';
import { useDispatch } from 'react-redux';

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
const fetchResults = async (searchQuery: string) => {
        const dispatch = useDispatch();
        if (!searchQuery.trim()) {
            return;
        }
        dispatch({ type: 'spotify/setLoading', payload: true });
        dispatch({ type: 'spotify/setError', payload: '' });
        try {
            const data = await searchSpotify(searchQuery);
            return { tracks: data };
        } catch (err) {
            console.error('Error fetching results:', err);
            return { error: 'Failed to fetch results. Please try again.' };
        } finally {
            dispatch({ type: 'spotify/setLoading', payload: false });
        }
    };