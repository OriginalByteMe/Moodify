'use client';

import {useState, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Search, Music, Disc} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {SearchResults} from '@/components/search-results';
import {useDebounce} from '@/hooks/use-debounce';
import {useDispatch, useSelector} from 'react-redux';
import useSpotify from '@/hooks/useSpotify';
import { setSearchType, clearTracks, clearAlbums, applyCachedResults } from '@/lib/features/spotifySlice';
import { ISpotifyState } from '@/app/utils/interfaces';

export function SearchForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialQuery = searchParams.get('q') || '';

	const [query, setQuery] = useState(initialQuery);

	const dispatch = useDispatch();
    const { fetchTracksFromSearch, fetchAlbumsFromSearch } = useSpotify();
	const debouncedQuery = useDebounce(query, 500);
    const state = useSelector((state: { spotify: ISpotifyState }) => state.spotify);
    const { isLoading, error, searchType, trackCache, albumCache } = state;

    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

    // Helper function to check if cache is valid and apply results
    const applyCacheIfValid = (type: 'track' | 'album', query: string): boolean => {
        const cache = type === 'track' ? trackCache : albumCache;
        const cached = cache?.[query];

        if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS) {
            dispatch(applyCachedResults({ type, query }));
            return true;
        }
        return false;
    };
	useEffect(() => {
		if (debouncedQuery) {
			router.push(`/?q=${encodeURIComponent(debouncedQuery)}`, {scroll: false});

			// Apply cache first, then fetch if needed
			const cacheApplied = applyCacheIfValid(searchType, debouncedQuery);

			if (!cacheApplied) {
				if (searchType === 'track') {
					fetchTracksFromSearch(debouncedQuery);
				} else {
					fetchAlbumsFromSearch(debouncedQuery);
				}
			}
		} else {
			dispatch(clearTracks());
			dispatch(clearAlbums());
			router.push('/', {scroll: false});
		}
	}, [debouncedQuery, searchType, router, dispatch]);

    const handleSearchTypeChange = (type: 'track' | 'album') => {
        dispatch(setSearchType(type));

        if (debouncedQuery) {
            // Try to apply cached results first for instant tab switching
            const cacheApplied = applyCacheIfValid(type, debouncedQuery);

            if (!cacheApplied) {
                // Only fetch if no valid cache exists
                if (type === 'track') {
                    fetchTracksFromSearch(debouncedQuery);
                } else {
                    fetchAlbumsFromSearch(debouncedQuery);
                }
            }
        }
    };

	return (
		<div className='w-full max-w-3xl mx-auto'>
			{/* Search Type Toggle */}
			<div className='flex justify-center mb-4'>
				<div className='inline-flex rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md p-1 shadow-lg'>
					<button
						onClick={() => handleSearchTypeChange('track')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							searchType === 'track'
								? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-md'
								: 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
						}`}
					>
						<Music className='h-4 w-4' />
						Songs
					</button>
					<button
						onClick={() => handleSearchTypeChange('album')}
						className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							searchType === 'album'
								? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-md'
								: 'text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white'
						}`}
					>
						<Disc className='h-4 w-4' />
						Albums
					</button>
				</div>
			</div>

			<div className='relative'>
				<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
					<Search className='h-5 w-5 text-zinc-400' />
				</div>
				<Input
					type='search'
					placeholder={searchType === 'track' ? 'Search for songs and artists...' : 'Search for albums...'}
					value={query}
					onChange={e => setQuery(e.target.value)}
					className='pl-10 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 h-12 rounded-full backdrop-blur-md bg-white/80 dark:bg-black/80 border-transparent focus:border-blue-500 focus-visible:ring-blue-500/20 shadow-lg'
				/>
			</div>

			{error && <div className='mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-white'>{error}</div>}

			{isLoading
				? (
					<div className='mt-8 flex justify-center'>
						<div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500'></div>
					</div>
				)
				: (
					debouncedQuery && <SearchResults />
				)}
		</div>
	);
}
