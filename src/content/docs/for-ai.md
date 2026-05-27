---
title: För AI-agenter
description: Hur en AI-assistent läser och använder Sundsvalls designsystem.
---

Den här portalen är byggd för att en AI-agent (Claude, Cursor, Copilot, ChatGPT m.fl.) ska kunna producera kod som följer Sundsvalls kommuns designsystem utan mänsklig redigering i mellanled.

## Vad du kan peka din AI mot

- **`https://ui.sundsvall.dev/llms.txt`** – kortfattad innehållsöversikt enligt llms.txt-konventionen.
- **`https://ui.sundsvall.dev/llms-full.txt`** – hela portalens innehåll i en fil. Bäst för en engångsuppladdning i kontexten.
- **Rå markdown per sida** – varje HTML-sida har en `.md`-variant på samma URL. Exempel: `/komponenter/button/` ↔ `/komponenter/button.md`.

## Rekommenderad prompt-mall

> Läs `https://ui.sundsvall.dev/llms-full.txt` och bygg [uppgift] som följer Sundsvalls kommuns designsystem. Använd endast tokens och komponenter som dokumenteras där. Skriv på svenska. Knapptexter ska vara verb i imperativ.

## Tekniska detaljer

- `robots.txt` tillåter all crawling.
- Sökmotor: Pagefind (för människor). AI:n läser markdown direkt.
- Sajten har `Content-Type: text/markdown` på `.md`-filer så att verktyg som Claude och ChatGPT plockar upp dem korrekt.
- Cache-Control: `no-cache` på `llms.txt`/`llms-full.txt` så att AI alltid får senaste version.
