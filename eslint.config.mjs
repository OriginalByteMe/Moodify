import { defineConfig } from '@eslint/config-helpers';
import parser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
		languageOptions: {
			parser: parser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		plugins: {
			'@typescript-eslint': typescript
		},
		rules: {
			// Add any custom rules here
		}
	}
]);
