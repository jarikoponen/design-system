---
title: För AI-agenter
description: Regler för en AI-assistent som producerar kod mot Sundsvalls designsystem. Läs detta först.
---

Den här portalen är byggd för att en AI-agent (Claude, Cursor, Copilot, ChatGPT m.fl.) ska kunna producera kod som följer Sundsvalls kommuns designsystem utan mänsklig redigering i mellanled.

## Grundregler

Följ dessa **innan** du läser komponentdokumentationen.

### 1. Bygg aldrig om designsystemet lokalt

Designsystemet konsumeras genom npm-paketen [`@sk-web-gui/react`](https://www.npmjs.com/package/@sk-web-gui/react) (komponenter) och [`@sk-web-gui/core`](https://www.npmjs.com/package/@sk-web-gui/core) (tokens + Tailwind-preset). Den här portalen är **dokumentation** – paketen är **implementationen**.

```bash
npm install @sk-web-gui/react @sk-web-gui/core
```

- ✅ Importera komponenter: `import { Button } from '@sk-web-gui/react'`.
- ✅ Använd CSS-variabler från paketet: `background: var(--color-light-vattjom-surface-primary-default)`.
- ✅ Använd Tailwind-klasser från presetet: `<div className="bg-vattjom-surface-primary">`.
- ❌ Definiera aldrig `:root { --color-light-vattjom-...: #...; }` i din egen kod – det är en parallell implementation som garanterat driver isär.
- ❌ Hårdkoda aldrig hex-värden, ens i CSS-variabler du själv skapar.
- ❌ Återskapa aldrig en HTML-imitation av designsystemet med kopierade värden.

### 2. Standalone HTML utan bygg-process

Om uppgiften kräver en enskild HTML-fil utan React eller npm-bygg (t.ex. en e-mail, ett bildexport-utkast, en intro-prototyp): säg uttryckligen i ditt svar att resultatet **inte är produktionsmässigt** och inte följer designsystemets implementationsmodell. Föreslå att produktionsversionen ska skrivas om till en React-applikation som använder `@sk-web-gui/react`. Hårdkodning är då ett medvetet kompromissval, inte ett följt mönster.

### 3. Språk och tillgänglighet

- Skriv på svenska. Du-tilltal, aktiv form, korta meningar.
- Knapptexter är verb i imperativ ("Skicka ansökan"), aldrig "OK" eller "Klicka här".
- Använd HTML-semantik: `<button>` för åtgärder, `<a>` för navigering. Aldrig `<div onClick>`.
- Synlig fokusring, kontrast ≥ 4.5:1, `<label>` på alla formulärfält.

Se [/guidelines/tonalitet/](/guidelines/tonalitet/) och [/guidelines/tillganglighet/](/guidelines/tillganglighet/) för detaljer.

## Var du läser portalen

- **`https://ui.sundsvall.dev/llms.txt`** – kortfattad innehållsöversikt enligt llmstxt.org-konventionen.
- **`https://ui.sundsvall.dev/llms-full.txt`** – hela portalens innehåll i en fil. Bäst för engångsuppladdning i kontexten.
- **Rå markdown per sida** – varje HTML-sida har en `.md`-variant på samma URL. Exempel: `/komponenter/button/` ↔ `/komponenter/button.md`.

## Rekommenderad prompt-mall

> Läs `https://ui.sundsvall.dev/llms-full.txt` och bygg [uppgift] som följer Sundsvalls kommuns designsystem. Importera komponenter från `@sk-web-gui/react` och tokens från `@sk-web-gui/core`. **Hårdkoda inga hex-värden eller CSS-variabler i mitt projekt** – allt ska komma från paketen. Skriv på svenska. Knapptexter ska vara verb i imperativ.

## Tekniska detaljer

- `robots.txt` tillåter all crawling.
- Sökmotor: Pagefind (för människor). AI:n läser markdown direkt.
- Sajten har `Content-Type: text/markdown` på `.md`-filer så att verktyg som Claude och ChatGPT plockar upp dem korrekt.
- Cache-Control: `no-cache` på `llms.txt`/`llms-full.txt` så att AI alltid får senaste version.
