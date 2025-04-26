'use client';

import {useTheme} from '../ThemeProvider';
import {Switch} from '@/components/ui/switch';
import {Moon, Sun} from 'lucide-react';

export function ThemeSwitch() {
	const {theme, toggleTheme} = useTheme();

	return (
		<div className='flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-2 rounded-full shadow-md'>
			<Sun className='h-5 w-5 text-amber-500 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
			<Switch
				checked={theme === 'dark'}
				onCheckedChange={toggleTheme}
				aria-label='Toggle dark mode'
				className='mx-1'
			/>
			<Moon className='h-5 w-5 text-blue-500 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
		</div>
	);
}

