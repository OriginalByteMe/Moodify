import Image from 'next/image';
import { Play, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotifyTrack } from '../utils/interfaces';
import useTheme from '@/hooks/useTheme';
import { RootState } from '@/lib/store';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
export function SongCard({ track }: { track: SpotifyTrack }) {
	const [isHovered, setIsHovered] = useState(false)
	const [isJiggling, setIsJiggling] = useState(false)
	const [showPalette, setShowPalette] = useState(false)
	const { selectedTrack } = useSelector((state: RootState) => state.spotify)
	const dispatch = useDispatch();
	const { applyPalette, resetPalette } = useTheme();
	const currentTrack = track

	const handleMagicWandClick = () => {
		if (!currentTrack) return;

		if (selectedTrack?.id === currentTrack.id) {
			dispatch({ type: 'spotify/setSelectedTrack', payload: null });
			resetPalette();
			setShowPalette(false);
		} else {
			dispatch({ type: 'spotify/setSelectedTrack', payload: currentTrack });
			if (currentTrack.colourPalette) {
				applyPalette(currentTrack.colourPalette);
			}
			setShowPalette(true);
		}
		setIsJiggling(true)
		// Reset jiggling after animation completes
		setTimeout(() => setIsJiggling(false), 820)
	};

	useEffect(() => {
		if (selectedTrack && currentTrack && selectedTrack.id !== currentTrack.id) {
		  setShowPalette(false);
		}
	  }, [selectedTrack, currentTrack]);
	  
	return (
		<div className='rounded-2xl overflow-hidden transition-all group shadow-lg'>
			<div className='relative aspect-square'>
				<Image
					src={track.albumCover || '/placeholder.svg?height=300&width=300'}
					alt={track.album}
					fill
					className='object-cover'
				/>
				<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
					<Button size='icon' variant='secondary' className='rounded-full bg-green-500 hover:bg-green-600 h-12 w-12' onClick={handleMagicWandClick}>
						<Wand2 className='h-6 w-6 fill-white text-white'  />
					</Button>
				</div>
			</div>
			<div className='p-4 backdrop-blur-lg bg-white/70 dark:bg-black/70'>
				<h3 className='font-medium text-gray-900 dark:text-white truncate'>{track.title}</h3>
				<p className='text-gray-700 dark:text-gray-300 text-sm truncate'>{track.artists.join(', ')}</p>
				<p className='text-gray-600 dark:text-gray-400 text-xs mt-1'>{track.album}</p>
				<div className='flex gap-1 mt-1'>
					{track.colourPalette.map((c: number[], i: number) => (
						<div
							key={i}
							className="palette-circle"
							style={{
								backgroundColor: `rgb(${c[0]}, ${c[1]}, ${c[2]})`,
								animationDelay: `${i * 0.05}s`,
								animation: 'pop-in 0.3s forwards'
							}}
							title={`RGB(${c[0]}, ${c[1]}, ${c[2]})`}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
