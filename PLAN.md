# PLAN.md – Sundsvalls designsystem-portal

> Detta är en exekverbar plan för Claude Code. Följ faserna i ordning.
> Stanna efter varje fas, kör verifieringen, vänta på OK innan du går vidare.

## Mål

Deploya en AI-vänlig designsystem-portal på `ui.sundsvall.dev` via Dokploy
i Docker. Portalen serverar:

- Mänsklig HTML-version (Astro Starlight – sökbar, tillgänglig, snabb)
- Rå markdown på predikterbar URL (`*.md` per sida)
- `llms.txt` och `llms-full.txt` på rotnivå för AI-agenter
- `robots.txt` som tillåter AI-crawling
- HTTPS via Let's Encrypt (hanteras av Dokploy/Traefik)

## Stack (allt är färdiga komponenter – ingen egenkod där det går)

| Lager           | Verktyg                       | Varför                                                           |
|-----------------|-------------------------------|------------------------------------------------------------------|
| SSG             | Astro Starlight               | Markdown/MDX-native, sökbar, tillgänglig, sitemap inbyggt        |
| Tokens          | Style Dictionary              | Standard inom designsystem, bygger till CSS/SCSS/JS              |
| Statisk server  | Caddy 2 (Alpine-image)        | Automatiska MIME-types, gzip, noll-konfig                        |
| Container       | Multi-stage Dockerfile        | Liten produktionsbild (~30 MB)                                   |
| Orkestrering    | Docker Compose (för Dokploy)  | Standardformat som Dokploy konsumerar                            |
| Reverse proxy   | Traefik (i Dokploy)           | Inget vi konfigurerar – Dokploy sköter det via labels            |
| CI              | GitHub Actions                | Build-verifiering. Dokploy hanterar själva deployen via webhook  |
| llms.txt-build  | gray-matter + glob (Node)     | Färdiga npm-paket. Inget eget parseri.                           |

## Förkrav att klargöra innan start

Be användaren bekräfta:

1. **Repo-URL** – Git-repo som Dokploy ska peka mot (t.ex.
   `github.com/sundsvalls-kommun/designsystem-portal`)
2. **Domän** – `ui.sundsvall.dev` (bekräftat). DNS A-record ska peka på
   Dokploy-värdens IP innan deploy.
3. **Befintliga assets** – Har de redan färger/typografi i strukturerat
   format någonstans, eller bygger vi från grunden med platshållare?
4. **Starterfiler** – Användaren har en prototypstruktur (från tidigare
   konversation) som ska seedas in. Be om zip-filen eller hänvisning.

---

## Fas 1: Projekt-bootstrap

**Mål:** Tomt Starlight-projekt som bygger lokalt.

### Steg

1. Initiera projektet:
   ```bash
   npm create astro@latest -- --template starlight --no-install --no-git \
     --typescript strict ui-sundsvall-dev
   cd ui-sundsvall-dev
   npm install
   ```

2. Installera extra beroenden:
   ```bash
   npm install -D style-dictionary gray-matter glob
   ```

3. Skapa katalogstruktur (utöver det Starlight redan skapar):
   ```
   src/content/docs/        ← Starlight har detta
   ├── tokens/              ← Token-dokumentation (genereras dels)
   ├── components/          ← Komponent-MDX
   └── guidelines/          ← Riktlinjer
   tokens-src/              ← Källan: W3C JSON tokens (Style Dictionary input)
   scripts/                 ← Bygg-scripts (llms.txt, token-sync)
   public/                  ← Statiska assets som ska serveras orörda
   ```

4. Uppdatera `astro.config.mjs` med Sundsvall-branding och sitemap-config.
   Se mallen i `astro.config.mjs` i detta paket.

### Verifiering

```bash
npm run dev   # ska starta på http://localhost:4321
npm run build # ska producera dist/ utan fel
```

Stanna och rapportera resultat.

---

## Fas 2: Token-pipeline med Style Dictionary

**Mål:** JSON-tokens i `tokens-src/` kompileras till CSS-variabler som
Starlight använder.

### Steg

1. Kopiera in tokens från prototypen till `tokens-src/`:
   - `color.json`
   - `typography.json`
   - `spacing.json`

2. Skapa `style-dictionary.config.mjs` (se mall i paketet). Pipeline:
   `tokens-src/*.json` → `src/styles/tokens.css` (CSS custom properties)
   + `src/data/tokens.json` (för MDX-import).

3. Lägg till npm-scripts i `package.json`:
   ```json
   {
     "scripts": {
       "tokens:build": "style-dictionary build --config style-dictionary.config.mjs",
       "prebuild": "npm run tokens:build && npm run llms:build",
       "predev": "npm run tokens:build"
     }
   }
   ```

4. Importera `tokens.css` i Starlights custom CSS via `astro.config.mjs`:
   ```js
   starlight({
     customCss: ["./src/styles/tokens.css", "./src/styles/site.css"],
   })
   ```

### Verifiering

```bash
npm run tokens:build
# ska skapa src/styles/tokens.css med --color-brand-primary etc.

npm run dev
# inspect: <html> ska ha --color-brand-primary tillgänglig i devtools
```

---

## Fas 3: Seed innehåll från prototypen

**Mål:** Riktlinjer och komponentdokumentation finns på sajten.

### Steg

1. Konvertera prototypens markdown-filer till Starlight-format:
   - `guidelines/accessibility.md` → `src/content/docs/guidelines/tillganglighet.md`
   - `guidelines/tone-of-voice.md` → `src/content/docs/guidelines/tonalitet.md`
   - `components/button/button.mdx` → `src/content/docs/komponenter/button.mdx`

2. Justera frontmatter till Starlight-format (lägg till `title`, `description`).
   Behåll övrig frontmatter som extra metadata.

3. Konfigurera navigation i `astro.config.mjs` under `sidebar`.

4. Skapa en startsida på `src/content/docs/index.mdx` med Sundsvall-branding,
   snabblänkar och info om att portalen är AI-vänlig.

### Verifiering

```bash
npm run dev
# besök http://localhost:4321 – navigation och innehåll ska synas
```

---

## Fas 4: AI-publicering (.md-routes + llms.txt)

**Mål:** Varje sida nåbar som rå markdown, `llms.txt` och `llms-full.txt`
genereras vid build.

### Steg

1. **Markdown-routes:** Installera Starlights officiella `markdown-content-source`-plugin
   eller skapa ett eget Astro-integration som kopierar källfiler:

   ```bash
   # Enklast: skapa scripts/copy-markdown-sources.mjs som postbuild-steg
   # som kopierar src/content/docs/**/*.{md,mdx} till dist/ med .md-suffix
   ```

   Mallen finns i `scripts/copy-markdown-sources.mjs`.

2. **llms.txt-generering:** Kopiera in `scripts/build-llms-txt.mjs` från
   prototyp-paketet. Justera `BASE_URL` till `https://ui.sundsvall.dev`.

3. Uppdatera `package.json`:
   ```json
   {
     "scripts": {
       "llms:build": "node scripts/build-llms-txt.mjs",
       "postbuild": "node scripts/copy-markdown-sources.mjs"
     }
   }
   ```

4. Lägg `public/robots.txt`:
   ```
   User-agent: *
   Allow: /

   Sitemap: https://ui.sundsvall.dev/sitemap-index.xml
   ```

### Verifiering

```bash
npm run build
# Verifiera att dessa filer finns i dist/:
ls dist/llms.txt dist/llms-full.txt dist/robots.txt
ls dist/komponenter/button.md   # rå markdown-version
ls dist/guidelines/tillganglighet.md
```

---

## Fas 5: Containerisering

**Mål:** Multi-stage Dockerfile + Caddyfile som serverar `dist/` korrekt.

### Steg

1. Kopiera filerna från detta paket till repots rot:
   - `Dockerfile`
   - `Caddyfile`
   - `docker-compose.yml` (för Dokploy och lokal testning)
   - `.dockerignore`

2. Verifiera att `Caddyfile` sätter rätt MIME-types för `.md`-filer
   (Content-Type: text/markdown) – detta är **kritiskt** för AI-verktyg.

3. Lokal byggtest:
   ```bash
   docker build -t ui-sundsvall:local .
   docker run --rm -p 8080:8080 ui-sundsvall:local
   curl -I http://localhost:8080/llms.txt
   # Förvänta: 200 OK, Content-Type: text/plain
   curl -I http://localhost:8080/komponenter/button.md
   # Förvänta: 200 OK, Content-Type: text/markdown
   ```

### Verifiering

Alla curl-anrop ger 200 och rätt Content-Type. Bilden är < 50 MB
(`docker images ui-sundsvall:local`).

---

## Fas 6: Dokploy-deployment

**Mål:** Sajten live på `https://ui.sundsvall.dev`.

### Steg

1. Pusha repot till GitHub.
2. I Dokploys UI:
   - Skapa ny **Application** av typ "Docker Compose"
   - Anslut till Git-repot
   - Branch: `main`
   - Build path: `/`
   - Docker Compose file: `docker-compose.yml`
3. Konfigurera domän:
   - Lägg till `ui.sundsvall.dev` under Domains
   - Aktivera HTTPS/Let's Encrypt
   - Container port: `8080`
4. Sätt webhook i Dokploy och konfigurera i GitHub repo-settings →
   Webhooks så att push till main triggar auto-deploy.
5. Klicka **Deploy** första gången.

### DNS-checklista (innan deploy)

```
ui.sundsvall.dev.   A   <dokploy-host-ip>
```
Vänta tills `dig ui.sundsvall.dev` returnerar rätt IP innan ni klickar Deploy
första gången, annars misslyckas Let's Encrypt-utfärdandet.

### Verifiering

```bash
curl -I https://ui.sundsvall.dev/
curl https://ui.sundsvall.dev/llms.txt | head -20
curl -I https://ui.sundsvall.dev/komponenter/button.md
```

---

## Fas 7: AI-acceptanstest

**Mål:** Visa att portalen faktiskt fungerar för det den är till för.

### Steg

1. Öppna Claude.ai (eller annan AI med web-access).
2. Promta:

   > "Läs https://ui.sundsvall.dev/llms-full.txt och bygg sedan en
   > React-komponent för en kontaktformulär (namn, e-post, meddelande,
   > skicka-knapp) som följer Sundsvalls kommuns designsystem. Använd
   > endast tokens och komponenter som dokumenteras där."

3. Bedöm resultatet mot:
   - Använder den `Button` med `variant="primary"`?
   - Är knapptexten ett verb i imperativ?
   - Är formuläret tillgängligt (labels, aria-attribut)?
   - Använder den Lucide-ikoner om någon ikon visas?
   - Använder den CSS-variabler från tokens?

4. För varje miss: identifiera vad i dokumentationen som behöver
   förbättras och iterera.

---

## Driftrutin

Efter Fas 6 är det löpande arbetet:

- Ändringar i `tokens-src/` eller `src/content/docs/` → commit → push →
  Dokploy bygger om och deployar automatiskt (~2 minuter).
- Changelog uppdateras manuellt i `CHANGELOG.md` per release.
- För större ändringar: arbeta i feature branch, öppna PR, granska i
  preview om Dokploy är konfigurerat för det.

## Att akta sig för

1. **Inte glöm `.dockerignore`** – utan den kopieras `node_modules` in i
   buildkontexten och allt blir långsamt.
2. **Caddy-MIME för markdown** – default ger Caddy `application/octet-stream`
   för `.md`. Måste sättas explicit i `Caddyfile`.
3. **`prebuild`/`postbuild`-hooks i package.json** – körs automatiskt vid
   `npm run build`, men *inte* om någon kör `astro build` direkt. Säkerställ
   att Dockerfile kallar `npm run build`, inte `astro build`.
4. **Cachning av llms.txt** – sätt `Cache-Control: no-cache` på dessa filer
   så AI-agenter alltid får senaste version.
5. **Pagefind (Starlights sökning)** behöver inget extra för basal sök, men
   indexering körs som postbuild – kontrollera att den faktiskt kör.
