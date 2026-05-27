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
const OUT_DIR = 'src/content/docs/komponenter';
const PACKAGES = ['button', 'link', 'alert', 'spinner', 'forms'];

/** Slugify a Meta.title for filename. */
function slugify(title) {
	return String(title)
		.toLowerCase()
		.replace(/[åä]/g, 'a')
		.replace(/ö/g, 'o')
		.replace(/^komponenter\//, '')
		.replace(/\./g, '-')
		.replace(/[^a-z0-9/-]+/g, '-')
		.replace(/^[/-]+|[/-]+$/g, '')
		.replace(/\//g, '-')
		.replace(/-+/g, '-');
}

/** Find the component source file in a package given the component name (e.g. "Button"). */
async function findComponentSource(pkgDir, componentName) {
	const srcDir = path.join(pkgDir, 'src');
	if (!existsSync(srcDir)) return null;
	const candidates = [];

	async function walk(dir) {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) await walk(full);
			else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) candidates.push(full);
		}
	}
	await walk(srcDir);

	// Heuristic: prefer file containing `export interface <Name>Props`
	const target = `${componentName}Props`;
	for (const f of candidates) {
		const content = await readFile(f, 'utf8');
		if (new RegExp(`export\\s+interface\\s+${target}\\b`).test(content)) return f;
	}
	// Fallback: file with same base name (kebab-case)
	const kebab = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
	for (const f of candidates) {
		if (path.basename(f, path.extname(f)) === kebab) return f;
	}
	return null;
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
				const srcFile = await findComponentSource(pkgDir, componentName);
				if (srcFile) {
					const result = parsePropsFromFile(project, srcFile, `${componentName}Props`);
					props = result.props;
				}
			}

			const storyIdSlug = slugify(story.meta.title);
			const storybookUrl = `https://stilguide.sundsvall.se/?path=/docs/${story.meta.title
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[åä]/g, 'a')
				.replace(/ö/g, 'o')
				.replace(/[/]/g, '-')}--dokumentation`;
			const sourceUrl = `https://github.com/Sundsvallskommun/web-shared-components/tree/main/packages/${pkgName}`;

			const mdx = renderComponentMdx({ pkg, story, props, sourceUrl, storybookUrl });

			const outFile = path.join(OUT_DIR, `${storyIdSlug}.mdx`);
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
	const allWritten = [];
	for (const pkgName of PACKAGES) {
		console.log(`[components:sync] Bearbetar ${pkgName}`);
		const written = await processPackage(project, pkgName);
		allWritten.push(...written);
	}
	console.log(`[components:sync] Klar – ${allWritten.length} MDX-filer skrivna i ${OUT_DIR}/`);
}

await main();
