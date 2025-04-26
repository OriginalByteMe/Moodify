import config from 'eslint-config-xo';
import tsConfig from 'eslint-config-xo-typescript';
import {defineConfig} from '@eslint/config-helpers';

export default defineConfig([
	config,
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: 'typescript-eslint-parser', // Or '@typescript-eslint/parser'
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'@typescript-eslint': tsConfig
		},
	}
]);
