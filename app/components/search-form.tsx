'use client';

import {useState, useEffect} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import {Search} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {SearchResults} from '@/components/search-results';
import {searchSpotify} from '@/lib/spotify';
import {useDebounce} from '@/hooks/use-debounce';
import {useDispatch, useSelector} from 'react-redux';
import {SpotifyTrack} from '@/utils/interfaces';
import useSpotify from '@/hooks/useSpotify';

export function SearchForm() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const initialQuery = searchParams.get('q') || '';

	const [query, setQuery] = useState(initialQuery);

	const dispatch = useDispatch();
    const { fetchTracksFromSearch } = useSpotify();
	const debouncedQuery = useDebounce(query, 500);
    const loading = useSelector((state: { spotify: { isLoading: boolean } }) => state.spotify.isLoading);
    const error = useSelector((state: { spotify: { error: string } }) => state.spotify.error);
	useEffect(() => {
		if (debouncedQuery) {
			router.push(`/?q=${encodeURIComponent(debouncedQuery)}`, {scroll: false});
			fetchTracksFromSearch(debouncedQuery);
		} else {
			dispatch({ type: 'spotify/setTracks', payload: [] });
			router.push('/', {scroll: false});
		}
	}, [debouncedQuery, router]);

	return (
		<div className='w-full max-w-3xl mx-auto'>
			<div className='relative'>
				<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
					<Search className='h-5 w-5 text-zinc-400' />
				</div>
				<Input
					type='search'
					placeholder='Search for songs, artists, or albums...'
					value={query}
					onChange={e => setQuery(e.target.value)}
					className='pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-400 h-12'
				/>
			</div>

			{error && <div className='mt-4 p-4 bg-red-900/50 border border-red-700 rounded-md text-white'>{error}</div>}

			{loading
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
