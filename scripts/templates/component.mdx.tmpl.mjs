// MDX-mall för auto-genererad komponentdokumentation.
// Tar emot { pkg, story, props } och returnerar en MDX-sträng.

const SK_REACT_PKG = '@sk-web-gui/react';

function escapeMdx(s) {
	return String(s ?? '').replace(/\|/g, '\\|');
}

function formatType(t) {
	if (!t) return '–';
	// Escape pipes once for markdown table compatibility.
	return String(t).replace(/\|/g, '\\|');
}

function tableRow(p, argTypes = {}) {
	const at = argTypes[p.name];
	const desc = (at?.description || p.jsDoc || '').replace(/\n/g, ' ').trim();
	const def =
		at?.defaultValue !== undefined
			? String(at.defaultValue)
			: at?.table?.defaultValue?.summary !== undefined
				? String(at.table.defaultValue.summary)
				: '–';
	return `| \`${p.name}\` | \`${formatType(p.type)}\` | \`${escapeMdx(def)}\` | ${escapeMdx(desc)} |`;
}

function frontmatter(meta) {
	const lines = ['---'];
	for (const [k, v] of Object.entries(meta)) {
		if (v === undefined || v === null) continue;
		if (Array.isArray(v)) {
			lines.push(`${k}:`);
			for (const item of v) lines.push(`  - ${item}`);
		} else {
			lines.push(`${k}: ${typeof v === 'string' && /[:#@\[\]&*?{}|>!%]/.test(v) ? JSON.stringify(v) : v}`);
		}
	}
	lines.push('---');
	return lines.join('\n');
}

export function renderComponentMdx({ pkg, story, props, sourceUrl, storybookUrl }) {
	const title = story.meta.title?.split('/').slice(-1)[0] || pkg.name;
	const componentName = story.meta.component || title;
	const argTypes = story.meta.argTypes || {};
	const defaultArgs = story.meta.args || {};
	const variants = story.variants || [];

	const fm = frontmatter({
		title,
		description: `${componentName} – komponent från ${pkg.name}.`,
		status: 'stabil',
		version: pkg.version,
		package: SK_REACT_PKG,
		source: sourceUrl,
		storybook: storybookUrl,
	});

	const propRows = props.length
		? ['| Prop | Typ | Standard | Beskrivning |', '|------|-----|----------|-------------|']
				.concat(props.map((p) => tableRow(p, argTypes)))
				.join('\n')
		: '_Inga publika props extraherade från källan._';

	const variantList = variants.length
		? variants.map((v) => `- **${v.name}** – ${Object.keys(v.args || {}).length ? `args: \`${JSON.stringify(v.args)}\`` : 'standardstory'}`).join('\n')
		: '_Inga storyvarianter._';

	const argOptions = Object.entries(argTypes)
		.filter(([, at]) => Array.isArray(at?.options) && at.options.length)
		.map(([name, at]) => `- **${name}**: ${at.options.map((o) => `\`${o === undefined ? 'undefined' : o}\``).join(', ')}`)
		.join('\n');

	const defaultArgsBlock = Object.keys(defaultArgs).length
		? `\n\n## Standardargs (från Meta.args)\n\n\`\`\`json\n${JSON.stringify(defaultArgs, null, 2)}\n\`\`\``
		: '';

	return `${fm}

{/* AUTO-GENERATED från @sk-web-gui/${pkg.shortName}@${pkg.version}. Manuella ändringar skrivs över vid nästa sync. */}

import { Aside } from '@astrojs/starlight/components';

<Aside type="tip" title="Källa">
\`${componentName}\` finns i [\`${pkg.name}\`](${sourceUrl}). Den exponeras också via paraply-paketet [\`${SK_REACT_PKG}\`](https://www.npmjs.com/package/${SK_REACT_PKG}).
</Aside>

## Installation

\`\`\`bash
npm install ${SK_REACT_PKG}
\`\`\`

## Användning

\`\`\`tsx
import { ${componentName} } from '${SK_REACT_PKG}';
\`\`\`

## API

${propRows}

${argOptions ? `## Enum-värden\n\n${argOptions}\n` : ''}
${defaultArgsBlock}

## Storyvarianter

${variantList}

## Källa

- Implementation: [${pkg.name}](${sourceUrl})
- Storybook: [${title}](${storybookUrl})
`;
}
