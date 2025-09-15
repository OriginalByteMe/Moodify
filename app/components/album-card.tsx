import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import Image from 'next/image'
import { Calendar, Disc, Music } from 'lucide-react'
import { SpotifyAlbum } from '../utils/interfaces'
import { useDispatch } from 'react-redux'
import { openAlbumTracksModal } from '@/lib/features/spotifySlice'

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

export const AlbumCard = memo(({ album }: { album: SpotifyAlbum }) => {
  const dispatch = useDispatch()

  const handleAlbumClick = useCallback(() => {
    dispatch(openAlbumTracksModal(album))
  }, [album, dispatch])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear()
    } catch {
      return dateString
    }
  }

  return (
    <div 
      className='rounded-2xl overflow-hidden transition-all group shadow-lg cursor-pointer hover:shadow-xl hover:scale-105'
      onClick={handleAlbumClick}
    >
      <LazyImage
        src={album.albumCover || '/placeholder.svg?height=300&width=300'}
        alt={album.name}
        className="group-hover:scale-110 transition-transform duration-300"
      />
      
      <div className='p-4 backdrop-blur-lg bg-white/70 dark:bg-black/70'>
        <h3 className='font-medium text-gray-900 dark:text-white truncate'>{album.name}</h3>
        <p className='text-gray-700 dark:text-gray-300 text-sm truncate'>{album.artists.join(', ')}</p>
        
        <div className='flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400'>
          <div className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            <span>{formatDate(album.releaseDate)}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Music className='h-3 w-3' />
            <span>{album.totalTracks} tracks</span>
          </div>
        </div>
        
        <div className='flex gap-1 mt-2'>
          {album.colourPalette.map((c: number[], i: number) => (
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
  )
})

AlbumCard.displayName = 'AlbumCard'