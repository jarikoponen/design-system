// Style Dictionary v4 – konfiguration för Sundsvalls designsystem.
// Källa: tokens-src/*.json (W3C Design Tokens-format).
// Utfall: src/styles/tokens.css (CSS custom properties) + src/data/tokens.json (för MDX-import).

export default {
	source: ['tokens-src/**/*.json'],
	preprocessors: ['tokens-studio'],
	platforms: {
		css: {
			transformGroup: 'css',
			buildPath: 'src/styles/',
			files: [
				{
					destination: 'tokens.css',
					format: 'css/variables',
					options: {
						outputReferences: true,
					},
				},
			],
		},
		json: {
			transformGroup: 'js',
			buildPath: 'src/data/',
			files: [
				{
					destination: 'tokens.json',
					format: 'json/flat',
				},
			],
		},
	},
};
