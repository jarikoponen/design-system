---
title: Tillgänglighet
description: Sundsvalls kommun följer WCAG 2.2 AA. Detta är de praktiska reglerna utvecklare och designers ska följa.
---

Sundsvalls kommun är en offentlig aktör och omfattas av **Lagen om tillgänglighet till digital offentlig service (DOS-lagen, 2018:1937)**. Alla digitala tjänster ska uppfylla **WCAG 2.2 nivå AA**.

## Grundkrav

- **Tangentbordsnavigering** måste fungera för all interaktion. Inget ska kräva mus eller pekskärm.
- **Synligt fokus** på alla interaktiva element. Använd token `--color-semantic-focus` med minst 2 px ringbredd.
- **Färgkontrast**: brödtext ≥ 4.5:1 mot bakgrund, stor text (≥ 24 px regular eller ≥ 19 px bold) ≥ 3:1.
- **Formulärfält** har alltid en synlig `<label>`. Placeholder ersätter aldrig en label.
- **Felmeddelanden** är knutna till sitt fält med `aria-describedby` och har röd ikon + text – aldrig enbart färg som signal.
- **Bilder** har `alt`-attribut. Dekorbilder får `alt=""`.
- **Rörelse**: respektera `prefers-reduced-motion` – ingen autospelande animation över 5 sekunder.

## Specifikt för komponenter

- **Knappar**: använd `<button>` för åtgärder, `<a>` för navigering. Aldrig en `<div onClick>`.
- **Modaler**: fokus flyttas in vid öppning, fångas tills stängning, återgår till triggern vid stängning. Esc stänger.
- **Tabeller** har `<th scope="col">` eller `<th scope="row">`.
- **Ikon-knappar** har `aria-label` med den åtgärd ikonen utför ("Stäng", inte "X").

## Verifiering

Innan en sida publiceras:

1. Kör automatiserad granskning med axe DevTools eller Lighthouse – 0 fel på "Accessibility".
2. Tabba igenom hela sidan utan mus.
3. Testa med skärmläsare (NVDA på Windows eller VoiceOver på Mac).
4. Kör testet med 200 % zoom – inget innehåll får klippas eller överlappa.
