// AUTO-IMPORT av designtokens från @sk-web-gui/theme.
// Skriver tokens-src/*.json i W3C Design Tokens-format.
// Style Dictionary bygger sedan src/styles/tokens.css + src/data/tokens.json.

import { readFile, writeFile } from 'node:fs/promises';
import {
	primitives,
	colors,
	fonts,
	flagFonts,
	fontSizes,
	lineHeights,
	spacing,
	radius,
	breakpoints,
} from '@sk-web-gui/theme';

const themePkg = JSON.parse(
	await readFile(new URL('../node_modules/@sk-web-gui/theme/package.json', import.meta.url), 'utf8'),
);

const TOKENS_DIR = 'tokens-src';
const HEADER = `__auto-generated__ från @sk-web-gui/theme@${themePkg.version}. Ändra i upstream eller i descriptions-overlay/, aldrig direkt här.`;

// ---- helpers --------------------------------------------------------------

/** Detect $type from a token leaf value. */
function detectType(value) {
	if (typeof value !== 'string') return undefined;
	if (/^rgba?\(/i.test(value)) return 'color';
	if (/^#[0-9a-f]{3,8}$/i.test(value)) return 'color';
	if (/^\d+(\.\d+)?(rem|em|px|%|vh|vw|ch)$/i.test(value)) return 'dimension';
	if (/^\d+(\.\d+)?$/.test(value)) return 'number';
	return 'string';
}

/**
 * Recursively convert a plain JS object into W3C Design Tokens format.
 * Leaf primitive values become { $value, $type }; nested objects recurse.
 * Strings/numbers/booleans are treated as leaves. Arrays become string-joined values.
 */
function toW3C(obj) {
	if (obj === null || obj === undefined) return undefined;
	if (typeof obj !== 'object' || Array.isArray(obj)) {
		const value = Array.isArray(obj) ? obj.join(', ') : obj;
		const $type = detectType(String(value));
		return $type ? { $value: value, $type } : { $value: value };
	}
	const out = {};
	for (const [key, val] of Object.entries(obj)) {
		// W3C bans keys starting with $; rename DEFAULT to a friendlier alias for some categories.
		const safeKey = key.startsWith('$') ? `_${key.slice(1)}` : key;
		out[safeKey] = toW3C(val);
	}
	return out;
}

async function writeTokens(filename, payload) {
	const json = JSON.stringify(payload, null, 2) + '\n';
	const path = `${TOKENS_DIR}/${filename}`;
	await writeFile(path, json, 'utf8');
	console.log(`[tokens:sync] Skrev ${path}`);
}

// ---- color tokens ---------------------------------------------------------

const colorTokens = {
	$description: HEADER,
	primitives: toW3C(primitives),
	light: toW3C(colors.lightmode),
	dark: toW3C(colors.darkmode),
};

// ---- typography tokens ----------------------------------------------------

const typographyTokens = {
	$description: HEADER,
	family: toW3C({ ...fonts, ...flagFonts }),
	size: toW3C(fontSizes),
	'line-height': toW3C(lineHeights),
};

// ---- spacing tokens -------------------------------------------------------

const spacingTokens = {
	$description: HEADER,
	space: toW3C(spacing),
	radius: toW3C(radius),
};

// ---- screens / breakpoints -----------------------------------------------

const screenTokens = {
	$description: HEADER,
	screen: toW3C(breakpoints),
};

// ---- write all -------------------------------------------------------------

await writeTokens('color.json', { color: colorTokens });
await writeTokens('typography.json', { font: typographyTokens });
await writeTokens('spacing.json', spacingTokens);
await writeTokens('screens.json', screenTokens);

console.log(`[tokens:sync] OK – från @sk-web-gui/theme@${themePkg.version}`);
