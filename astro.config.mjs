// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://ui.sundsvall.dev',
	integrations: [
		starlight({
			title: 'Sundsvalls designsystem',
			description:
				'AI-vänlig designsystem-portal för Sundsvalls kommun. Tokens, komponenter och riktlinjer.',
			defaultLocale: 'sv',
			locales: {
				sv: { label: 'Svenska', lang: 'sv' },
			},
			customCss: ['./src/styles/tokens.css', './src/styles/site.css'],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/jarikoponen/design-system',
				},
			],
			sidebar: [
				{
					label: 'Kom igång',
					items: [
						{ label: 'Introduktion', link: '/' },
						{ label: 'För AI-agenter', link: '/for-ai/' },
					],
				},
				{
					label: 'Identitet',
					items: [{ autogenerate: { directory: 'identitet' } }],
				},
				{
					label: 'Riktlinjer',
					items: [{ autogenerate: { directory: 'guidelines' } }],
				},
				{
					label: 'Tokens',
					items: [{ autogenerate: { directory: 'tokens' } }],
				},
				{
					label: 'Komponenter',
					items: [{ autogenerate: { directory: 'komponenter' } }],
				},
				{
					label: 'AI-komponenter',
					items: [{ autogenerate: { directory: 'ai-komponenter' } }],
				},
			],
		}),
	],
});
