# CLAUDE.md

Denna fil läses av Claude Code automatiskt vid varje session. Här finns
projektets regler, konventioner och vanliga uppgifter.

## Vad är detta projekt?

Sundsvalls kommuns AI-vänliga designsystem-portal. Mål: vara en central plats
som AI-agenter (Claude, Cursor, Copilot m.fl.) kan peka mot för att förstå
kommunens UI-regler.

**Live URL:** https://ui.sundsvall.dev
**Status:** Prototyp parallellt med produktionsdokumentation på sundsvall.se
**Deployment:** Dokploy → Docker Compose → Caddy (statisk Astro-build)

## Stack

- **Astro Starlight** – SSG och dokumentationsramverk
- **Style Dictionary** – Tokens från JSON till CSS-variabler
- **Caddy 2** (alpine) – Statisk filserver i container
- **Pagefind** – Search (kommer med Starlight)

Använd **alltid** Starlights inbyggda komponenter (`<Card>`, `<CardGrid>`,
`<LinkCard>`, `<Tabs>`, `<Steps>`, `<Aside>`) framför att bygga egna.

## Kommandon

```bash
npm install              # Installera beroenden
npm run dev              # Lokal utveckling (port 4321)
npm run build            # Full build inkl. tokens + llms.txt
npm run preview          # Förhandsgranska produktionsbuild
npm run tokens:build     # Bara bygg tokens
npm run llms:build       # Bara generera llms.txt/llms-full.txt
docker build -t ui-sundsvall:local .   # Bygg container lokalt
docker compose up        # Testa hela stacken lokalt
```

## Filstruktur och konventioner

```
tokens-src/              ← KÄLLA för design tokens. JSON i W3C-format.
                           Ändra här, aldrig i src/styles/tokens.css.
src/content/docs/
  ├── index.mdx          ← Startsida
  ├── komponenter/       ← En .mdx per komponent. Frontmatter obligatorisk.
  ├── guidelines/        ← Riktlinjer i .md.
  └── tokens/            ← Auto-genererad dokumentation av tokens.
src/styles/
  ├── tokens.css         ← AUTOGENERERAD av Style Dictionary. Rör inte.
  └── site.css           ← Egna styles (override av Starlight).
scripts/                 ← Bygg-scripts (llms.txt, postbuild, etc.)
public/                  ← Statiska assets som kopieras orörda till dist/.
                           robots.txt, favicon, logotyper.
```

## Regler för innehåll

### Tokens-källan

- Allt nytt token måste ha `$description`. AI:n läser det.
- Använd referenser (`{color.brand.primary}`) framför hårdkodade värden.
- Semantiska tokens (`color.semantic.text.on-brand`) är att föredra över
  råa (`color.neutral.0`) i komponentkod.

### Komponent-MDX

- Frontmatter måste innehålla: `title`, `description`, `status`,
  `version`, `tokens-used` (lista).
- Struktur: Beskrivning → När använda → När inte använda → Varianter →
  API → Exempel → Do/Don't → Tillgänglighet → Implementation.
- Kodexempel är fullständiga och importerar från `@sundsvall/ui`
  (även om paketet inte finns än – det är referensformatet).

### Riktlinjer

- Vanliga `.md`, inte `.mdx`, om inga interaktiva komponenter behövs.
- Skriv på svenska. Hänvisa till lag/standard när relevant (WCAG, DOS-lagen,
  Språklagen).

## Deploy-flöde

- **Produktion:** `https://ui.sundsvall.dev` driftas av Dokploy som en
  Docker Compose-tjänst med **Isolated Deployment** aktiverat.
- **Auto-deploy:** En GitHub-webhook triggar Dokploy vid varje push till
  `main`. Push till main = produktionssläpp. För större ändringar – arbeta
  i feature branch och öppna PR.
- **Compose-filen** använder `expose` (inte `ports`) eftersom Dokploys
  Traefik redan binder host-portarna. Container-porten (8080) konfigureras
  i Dokploys *Domains*-UI där också HTTPS/Let's Encrypt sätts upp.
- **Felsökning:** Dokploy UI → Application → Logs. Trigga om manuellt om
  webhook hänger.

## Pre-deploy-checklista

Innan en PR mergas till `main`:

- [ ] `npm run build` går igenom utan fel eller varningar.
- [ ] `dist/llms.txt` och `dist/llms-full.txt` finns.
- [ ] Råa `.md`-versioner finns för alla nya sidor.
- [ ] Inga hårdkodade färger eller storlekar i CSS – endast `var(--...)`.
- [ ] Nya komponenter har `tokens-used`-lista i frontmatter.
- [ ] CHANGELOG.md uppdaterad.

## Vanliga uppgifter

### Lägg till en ny token

1. Öppna `tokens-src/<rätt fil>.json`.
2. Lägg till tokenen med `$value`, `$type`, `$description`.
3. `npm run tokens:build` – verifiera output i `src/styles/tokens.css`.
4. Om tokenen är "publik" (avsedd att användas), dokumentera den i
   `src/content/docs/tokens/`.

### Lägg till en ny komponent

1. Skapa `src/content/docs/komponenter/<namn>.mdx`.
2. Följ frontmatter-mallen (kopiera från `button.mdx`).
3. Implementera i ett fristående React-paket OM koden ska vara körbar.
   I prototypstadiet räcker det med dokumentation och kodexempel.
4. Lägg till i `astro.config.mjs` sidebar.

### Felsöka deploys

- Dokploy-loggar: Dokploy UI → Application → Logs.
- Caddy serverar inte rätt MIME → kontrollera `Caddyfile`.
- 404 på `.md`-route → kontrollera att `scripts/copy-markdown-sources.mjs`
  faktiskt körs i `postbuild`.
- Let's Encrypt-fel → DNS måste peka rätt **före** deploy.

## Vad du INTE ska göra

- Inte skapa egna UI-komponenter när Starlight har en motsvarighet.
- Inte hårdkoda färger/storlekar någonstans.
- Inte editera `src/styles/tokens.css` direkt – den genereras.
- Inte deploya direkt utan att testa Dockerfile lokalt först.
- Inte ändra `Caddyfile` utan att verifiera MIME-types efteråt.
