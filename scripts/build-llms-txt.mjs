// Genererar llms.txt (kort innehållsöversikt) och llms-full.txt (fullständigt innehåll)
// enligt llmstxt.org-konventionen. Körs som prebuild så att filerna hamnar i dist/ via Astro.
//
// Output:
//   public/llms.txt      – innehållsförteckning med titel, beskrivning, länkar
//   public/llms-full.txt – varje sidas markdown i sin helhet, separerat med ---

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';
import matter from 'gray-matter';

const SRC_DIR = 'src/content/docs';
const PUBLIC_DIR = 'public';
const BASE_URL = 'https://ui.sundsvall.dev';
const SITE_TITLE = 'Sundsvalls designsystem';
const SITE_SUMMARY =
	'AI-vänlig designsystem-portal för Sundsvalls kommun. Tokens, komponenter och riktlinjer på predikterbara URL:er.';

const files = (await glob(`${SRC_DIR}/**/*.{md,mdx}`)).sort();

const pages = [];
for (const file of files) {
	const raw = await readFile(file, 'utf8');
	const { data, content } = matter(raw);
	const rel = path.relative(SRC_DIR, file).replace(/\.mdx?$/, '');
	const slug = rel === 'index' ? '' : rel.replace(/\\/g, '/');
	const url = `${BASE_URL}/${slug}${slug ? '/' : ''}`;
	const mdUrl = `${BASE_URL}/${rel === 'index' ? 'index' : rel}.md`;
	pages.push({
		title: data.title ?? rel,
		description: data.description ?? '',
		slug,
		url,
		mdUrl,
		content,
		frontmatter: data,
	});
}

// Gruppera per top-mapp för llms.txt
const groups = new Map();
for (const p of pages) {
	const top = p.slug.split('/')[0] || 'översikt';
	const groupLabel =
		{
			'': 'Översikt',
			'översikt': 'Översikt',
			'for-ai': 'För AI-agenter',
			guidelines: 'Riktlinjer',
			tokens: 'Tokens',
			komponenter: 'Komponenter',
		}[top] ?? top;
	if (!groups.has(groupLabel)) groups.set(groupLabel, []);
	groups.get(groupLabel).push(p);
}

// --- llms.txt -------------------------------------------------------------
let llms = `# ${SITE_TITLE}\n\n> ${SITE_SUMMARY}\n\n`;
llms += `Den här filen följer llmstxt.org-konventionen. Varje länk pekar på sidans HTML-version; varje sida finns även som rå markdown via samma URL med suffixet \`.md\`.\n\n`;
for (const [label, items] of groups) {
	llms += `## ${label}\n\n`;
	for (const p of items) {
		const desc = p.description ? `: ${p.description}` : '';
		llms += `- [${p.title}](${p.url})${desc}\n`;
	}
	llms += '\n';
}

// --- llms-full.txt --------------------------------------------------------
let llmsFull = `# ${SITE_TITLE}\n\n${SITE_SUMMARY}\n\n`;
llmsFull += `Hela portalens innehåll i en fil. Bäst för att klistra in i en AI-assistent som engångskontext.\n\n`;
for (const p of pages) {
	llmsFull += `\n\n---\n\n`;
	llmsFull += `# ${p.title}\n\n`;
	if (p.description) llmsFull += `> ${p.description}\n\n`;
	llmsFull += `URL: ${p.url}\n`;
	llmsFull += `Källa (markdown): ${p.mdUrl}\n\n`;
	llmsFull += p.content.trim() + '\n';
}

await writeFile(path.join(PUBLIC_DIR, 'llms.txt'), llms, 'utf8');
await writeFile(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFull, 'utf8');

console.log(
	`[llms:build] Genererade llms.txt (${pages.length} sidor i ${groups.size} grupper) och llms-full.txt`,
);
