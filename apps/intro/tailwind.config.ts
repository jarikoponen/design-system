import type { Config } from 'tailwindcss';
import { preset } from '@sk-web-gui/core';

export default {
	presets: [preset()],
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	darkMode: 'selector',
} satisfies Config;
