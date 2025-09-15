import Image from 'next/image';
import { Play, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotifyTrack } from '../utils/interfaces';
import useTheme from '@/hooks/useTheme';
import { RootState } from '@/lib/store';
import { useEffect, useState, useCallback, memo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openModal } from '@/lib/features/spotifySlice';
import { usePreviewPlayer } from '@/app/components/PreviewPlayer';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
}

const LazyImage = memo(({ src, alt, className, children }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative aspect-square">
      {!isInView ? (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className || ''}`}
            onLoad={() => setIsLoaded(true)}
          />
          {children}
        </>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export const SongCard = memo(({ track }: { track: SpotifyTrack }) => {
	const [isHovered, setIsHovered] = useState(false)
	const [isJiggling, setIsJiggling] = useState(false)
	const [showPalette, setShowPalette] = useState(false)
	const { selectedTrack } = useSelector((state: RootState) => state.spotify)
	const dispatch = useDispatch();
	const { applyPalette, resetPalette } = useTheme();
	const currentTrack = track
	const { play, stop } = usePreviewPlayer()

	const handleMagicWandClick = useCallback(() => {
		if (!currentTrack) return;

		if (selectedTrack?.id === currentTrack.id) {
			dispatch({ type: 'spotify/setSelectedTrack', payload: null });
			resetPalette();
			setShowPalette(false);
			stop();
		} else {
			dispatch({ type: 'spotify/setSelectedTrack', payload: currentTrack });
			if (currentTrack.colourPalette) {
				applyPalette(currentTrack.colourPalette);
			}
			setShowPalette(true);
			play(currentTrack);
		}
		setIsJiggling(true)
		// Reset jiggling after animation completes
		setTimeout(() => setIsJiggling(false), 820)
	}, [currentTrack, selectedTrack, dispatch, resetPalette, applyPalette, play, stop]);

	const handleInfoClick = useCallback(() => {
		if (!currentTrack) return;
		dispatch(openModal(currentTrack));
	}, [currentTrack, dispatch]);

	useEffect(() => {
		if (selectedTrack && currentTrack && selectedTrack.id !== currentTrack.id) {
		  setShowPalette(false);
		}
	  }, [selectedTrack, currentTrack]);
	  
	return (
		<div className='rounded-2xl overflow-hidden transition-all group shadow-lg'>
			<LazyImage
				src={track.albumCover || '/placeholder.svg?height=300&width=300'}
				alt={track.album}
			>
				<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
					<Button size='icon' variant='secondary' className='rounded-full bg-green-500 hover:bg-green-600 h-12 w-12' onClick={handleMagicWandClick}>
						<Wand2 className='h-6 w-6 fill-white text-white'  />
					</Button>
				</div>
			</LazyImage>
			<div 
				className='p-4 backdrop-blur-lg bg-white/70 dark:bg-black/70 cursor-pointer hover:bg-white/80 dark:hover:bg-black/80 transition-colors'
				onClick={handleInfoClick}
			>
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
});

SongCard.displayName = 'SongCard';
