// Postbuild: kopierar varje sida i src/content/docs/ som rå markdown till dist/.
// Resultat: /komponenter/button/ (HTML) får en granne /komponenter/button.md (rå källa).
//
// Detta är vad AI-verktyg som Claude och ChatGPT konsumerar – inte HTML.
// Vi konverterar .mdx -> .md genom att helt enkelt skriva ut innehållet som det är;
// frontmatter och markdown är kompatibla. JSX-anrop ignoreras av AI:n eller renderas
// som inline-text, vilket är acceptabelt eftersom semantiken finns i prosan.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const SRC_DIR = 'src/content/docs';
const OUT_DIR = 'dist';

const files = await glob(`${SRC_DIR}/**/*.{md,mdx}`);
let written = 0;

for (const file of files) {
	const rel = path.relative(SRC_DIR, file);
	const outRel = rel.replace(/\.mdx?$/, '.md');

	// Specialfall: index.mdx -> /index.md (inte /.md)
	const outPath = path.join(
		OUT_DIR,
		outRel === 'index.md' ? 'index.md' : outRel,
	);

	const dir = path.dirname(outPath);
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}

	const content = await readFile(file, 'utf8');
	await writeFile(outPath, content, 'utf8');
	written++;
}

console.log(`[postbuild] Skrev ${written} råa markdown-filer till ${OUT_DIR}/`);
