import Image from 'next/image';
import {Play} from 'lucide-react';
import {Button} from '@/components/ui/button';

export function SongCard({track}) {
	return (
		<div className='bg-zinc-800 rounded-lg overflow-hidden transition-all hover:bg-zinc-700 group'>
			<div className='relative aspect-square'>
				<Image
					src={track.albumCover || '/placeholder.svg?height=300&width=300'}
					alt={track.album}
					fill
					className='object-cover'
				/>
				<div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
					<Button size='icon' variant='secondary' className='rounded-full bg-green-500 hover:bg-green-600 h-12 w-12'>
						<Play className='h-6 w-6 fill-white text-white' />
					</Button>
				</div>
			</div>
			<div className='p-4'>
				<h3 className='font-medium text-white truncate'>{track.title}</h3>
				<p className='text-zinc-400 text-sm truncate'>{track.artist}</p>
				<p className='text-zinc-500 text-xs mt-1'>{track.album}</p>
			</div>
		</div>
	);
}
