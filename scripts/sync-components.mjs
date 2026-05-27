// AUTO-IMPORT av komponentdokumentation från web-shared-components.
// Parsar TypeScript-källor + Storybook autodocs och genererar Starlight-MDX.
//
// MVP-allowlist: button, link, alert, spinner, forms.
// 'forms' är ett samlingspaket med många komponenter; varje stories-fil blir en MDX.

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createProject, parseStoriesFile } from './lib/parse-stories.mjs';
import { parsePropsFromFile } from './lib/parse-props.mjs';
import { renderComponentMdx } from './templates/component.mdx.tmpl.mjs';

const VENDOR = 'vendor/sk-web-gui';
const OUT_DIR_COMPONENTS = 'src/content/docs/komponenter';
const OUT_DIR_AI = 'src/content/docs/ai-komponenter';

// Infrastruktur-paket – ingen story, ingen MDX.
const DENY = new Set([
	'core', 'theme', 'react', 'utils',
	'next', 'next-card', 'next-link',
	'toast', 'toasted-notes',
]);

/** Pick output dir + slug-prefix based on Meta.title. */
function routeFromTitle(title) {
	const t = String(title).toLowerCase();
	if (t.startsWith('ai/')) {
		return { dir: OUT_DIR_AI, stripPrefix: /^ai\/komponenter\// };
	}
	return { dir: OUT_DIR_COMPONENTS, stripPrefix: /^komponenter\// };
}

async function discoverPackages() {
	const entries = await readdir(path.join(VENDOR, 'packages'), { withFileTypes: true });
	const pkgs = [];
	for (const e of entries) {
		if (!e.isDirectory() || DENY.has(e.name)) continue;
		const storiesDir = path.join(VENDOR, 'packages', e.name, 'stories');
		if (existsSync(storiesDir)) pkgs.push(e.name);
	}
	return pkgs.sort();
}

/** Slugify a Meta.title for filename. */
function slugify(title, stripPrefix = /^komponenter\//) {
	return String(title)
		.toLowerCase()
		.replace(/[åä]/g, 'a')
		.replace(/ö/g, 'o')
		.replace(stripPrefix, '')
		.replace(/\./g, '-')
		.replace(/[^a-z0-9/-]+/g, '-')
		.replace(/^[/-]+|[/-]+$/g, '')
		.replace(/\//g, '-')
		.replace(/-+/g, '-');
}

/** Compound names like "Button.Group" become "ButtonGroup". */
function cleanComponentName(name) {
	return String(name).replace(/\./g, '').replace(/[^A-Za-z0-9]/g, '');
}

/** Candidate interface names to try in order. */
function propsCandidates(componentName) {
	const c = cleanComponentName(componentName);
	const last = c.replace(/^.*?([A-Z][a-z0-9]*)$/, '$1'); // last PascalCase segment
	return [
		`${c}Props`,
		`${c}ComponentProps`,
		`I${c}Props`,
		`${c}OwnProps`,
		// e.g. ButtonGroup -> GroupProps (for cases where compound suffix alone is used)
		c !== last ? `${last}Props` : null,
	].filter(Boolean);
}

/**
 * Find candidate source files in a package that might contain the props interface.
 * Returns an array of file paths ranked: regex-matches first, then filename match, then all src files.
 */
async function findComponentSources(pkgDir, componentName) {
	const srcDir = path.join(pkgDir, 'src');
	if (!existsSync(srcDir)) return [];
	const allFiles = [];

	async function walk(dir) {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) await walk(full);
			else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) allFiles.push(full);
		}
	}
	await walk(srcDir);

	const candidates = propsCandidates(componentName);
	const ranked = new Map(); // path -> rank (lower is better)

	for (const f of allFiles) {
		const content = await readFile(f, 'utf8');
		for (const [i, name] of candidates.entries()) {
			if (new RegExp(`export\\s+(interface|type)\\s+${name}\\b`).test(content)) {
				const existing = ranked.get(f);
				if (existing === undefined || i < existing) ranked.set(f, i);
			}
		}
	}

	const sorted = Array.from(ranked.entries())
		.sort((a, b) => a[1] - b[1])
		.map(([f]) => f);

	if (sorted.length) return sorted;

	// Fallback: filename matches kebab-case of componentName
	const kebab = cleanComponentName(componentName).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
	const exact = allFiles.find((f) => path.basename(f, path.extname(f)) === kebab);
	if (exact) return [exact, ...allFiles.filter((f) => f !== exact)];

	return allFiles;
}

async function processPackage(project, pkgName) {
	const pkgDir = path.join(VENDOR, 'packages', pkgName);
	const storiesDir = path.join(pkgDir, 'stories');
	if (!existsSync(storiesDir)) {
		console.warn(`[components:sync] HOPPAR ${pkgName} – ingen stories/-mapp`);
		return [];
	}
	const pkgJson = JSON.parse(await readFile(path.join(pkgDir, 'package.json'), 'utf8'));
	const pkg = { name: pkgJson.name, version: pkgJson.version, shortName: pkgName };

	const storyFiles = (await readdir(storiesDir, { withFileTypes: true }))
		.filter((e) => e.isFile() && /\.stories\.tsx$/.test(e.name))
		.map((e) => path.join(storiesDir, e.name));

	const written = [];
	for (const storyPath of storyFiles) {
		try {
			const story = parseStoriesFile(project, storyPath);
			if (!story.meta.title) {
				console.warn(`[components:sync]   ${path.basename(storyPath)}: saknar Meta.title`);
				continue;
			}
			const componentName = story.meta.component;
			let props = [];
			if (componentName) {
				const sources = await findComponentSources(pkgDir, componentName);
				const candidates = propsCandidates(componentName);
				for (const srcFile of sources) {
					const result = parsePropsFromFile(project, srcFile, candidates);
					if (result.props.length) {
						props = result.props;
						break;
					}
				}
			}

			const route = routeFromTitle(story.meta.title);
			const storyIdSlug = slugify(story.meta.title, route.stripPrefix);
			const storybookUrl = `https://stilguide.sundsvall.se/?path=/docs/${story.meta.title
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[åä]/g, 'a')
				.replace(/ö/g, 'o')
				.replace(/[/]/g, '-')}--dokumentation`;
			const sourceUrl = `https://github.com/Sundsvallskommun/web-shared-components/tree/main/packages/${pkgName}`;

			const mdx = renderComponentMdx({ pkg, story, props, sourceUrl, storybookUrl });

			const outFile = path.join(route.dir, `${storyIdSlug}.mdx`);
			await mkdir(path.dirname(outFile), { recursive: true });
			await writeFile(outFile, mdx, 'utf8');
			written.push(outFile);
			console.log(`[components:sync]   ✔ ${outFile} (${props.length} props, ${story.variants.length} varianter)`);
		} catch (err) {
			console.error(`[components:sync]   ✘ ${storyPath}: ${err.message}`);
		}
	}
	return written;
}

async function main() {
	const project = createProject();
	const packages = await discoverPackages();
	console.log(`[components:sync] Hittade ${packages.length} paket med stories: ${packages.join(', ')}`);
	const allWritten = [];
	for (const pkgName of packages) {
		const written = await processPackage(project, pkgName);
		allWritten.push(...written);
	}
	const inComponents = allWritten.filter((f) => f.startsWith(OUT_DIR_COMPONENTS)).length;
	const inAi = allWritten.filter((f) => f.startsWith(OUT_DIR_AI)).length;
	console.log(`[components:sync] Klar – ${allWritten.length} MDX-filer (${inComponents} komponenter + ${inAi} AI-komponenter)`);
}

await main();
