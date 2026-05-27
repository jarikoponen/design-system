# intro-app — Sundsvalls designsystem förklarat genom att användas

En förklarande applikation som visar **vad** designsystemet är, **hur** det är arkitekturerat och **varför** man använder det — genom att själv vara byggd enligt det avsedda mönstret.

Inga hex-värden i koden. Inga lokala CSS-variabler. Bara `@sk-web-gui/react` + `@sk-web-gui/core`.

## Stack

- **Vite 6** + **React 19** + **TypeScript**
- **Tailwind 3** med `@sk-web-gui/core/preset`
- **`@sk-web-gui/react`** för komponenter
- **`GuiProvider`** wrappar appen för token-injection + dark mode
- **Raleway** via Google Fonts i `index.html`

## Kör lokalt

```bash
cd apps/intro
npm install
npm run dev      # http://localhost:5173/
```

Andra scripts:

```bash
npm run build       # tsc --noEmit && vite build → dist/
npm run preview     # serve dist/ lokalt
npm run typecheck   # tsc --noEmit
```

## Regel: inga hex

Appen är "bevis" för att designsystemet kan konsumeras helt utan kopierade värden. Verifiera själv:

```bash
grep -rEn '#[0-9a-fA-F]{6}\b' src/   # förväntat: 0 träffar
```

Om en hex-träff dyker upp har någon brutit principen — fixa innan merge.

## Deployment

Inte uppsatt ännu. När vi vill publicera:

1. Dockerfile + Caddyfile (samma mönster som portalen i repo-roten)
2. Egen `docker-compose.yml` i `apps/intro/` med port-expose
3. Dokploy: ny Application av typ "Docker Compose", peka mot `apps/intro/`, sätt en subdomän (t.ex. `intro.ui.sundsvall.dev`)
4. DNS A-record för subdomänen mot Dokploy-värdens IP

## Filstruktur

```
apps/intro/
├── package.json          # Vite + React + TS + Tailwind + @sk-web-gui/*
├── vite.config.ts
├── tailwind.config.ts    # presets: [preset()]
├── postcss.config.js
├── tsconfig.json
├── index.html            # Raleway-import + #root
└── src/
    ├── main.tsx          # ReactDOM-render
    ├── App.tsx           # GuiProvider + colorScheme-state + komposition
    ├── index.css         # Tailwind directives
    └── sections/
        ├── Hero.tsx
        ├── ArchitectureDiagram.tsx
        ├── HowToUse.tsx
        ├── LiveDemo.tsx
        ├── Benefits.tsx
        └── Footer.tsx
```

## Anti-mönster den här appen *inte* följer

❌ Att kopiera in CSS-variabler i `:root` lokalt — det är vad en testsida som Claude.ai byggde först gjorde, och varför vi byggde det här. Designsystemet får aldrig återskapas i mottagaren.

❌ Att hårdkoda hex-värden, ens som "demo".

❌ Att använda `<div onClick>` istället för `<button>`.

✅ Att importera `Button` från `@sk-web-gui/react` och låta paketet hantera färg, fokus, dark mode och tillgänglighet.
