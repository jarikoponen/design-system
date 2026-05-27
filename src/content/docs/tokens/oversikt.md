---
title: Översikt
description: Hur designtokens fungerar i Sundsvalls designsystem. Värdena hämtas live från @sk-web-gui/theme och kompileras till CSS-variabler.
---

Sundsvalls designsystem definierar alla visuella värden – färger, typografi, avstånd, hörnradier, breakpoints – som **designtokens**. Tokens är källan till sanning. **Aldrig hårdkoda färg eller storlek**, alltid använd CSS-variabel eller Tailwind-klass.

## Hur portalen läser tokens

Den här portalen importerar tokens från npm-paketet `@sk-web-gui/theme` vid sync, konverterar till W3C Design Tokens-format i `tokens-src/*.json`, och kompilerar till `src/styles/tokens.css` via [Style Dictionary](https://styledictionary.com/). Resultatet är CSS-variabler i `:root`.

## CSS-variabelnamn

Mönstret är `--<kategori>-<grupp>-<nyans>`:

| Mönster                                            | Exempel                                                 |
|----------------------------------------------------|---------------------------------------------------------|
| `--color-primitives-<kulör>-<steg>`                | `--color-primitives-blue-700` → `#005595`                |
| `--color-light-<tema>-<roll>-<variant>`            | `--color-light-vattjom-surface-primary-default`          |
| `--color-dark-<tema>-<roll>-<variant>`             | `--color-dark-vattjom-text-default`                      |
| `--font-family-<stack>`                            | `--font-family-header` → `Raleway, Arial, ...`           |
| `--font-size-<kategori>-<step>`                    | `--font-size-h-1-default` → `4rem`                       |
| `--space-<n>`                                      | `--space-16` → `1.6rem`                                  |
| `--radius-<roll>`                                  | `--radius-button-md` → `1.2rem`                          |

## I React-kod

Med `@sk-web-gui/react` får du tokens via komponent-props:

```tsx
import { Button } from '@sk-web-gui/react';

<Button color="vattjom" variant="primary">Skicka</Button>
<Button color="gronsta" variant="secondary">Spara</Button>
```

Eller via Tailwind (paketet `@sk-web-gui/core` exponerar en preset):

```html
<div class="bg-vattjom-surface-primary text-vattjom-text-DEFAULT p-4 rounded-button">
  ...
</div>
```

## Mer

- **[Färger](/identitet/farger/)** – fullständig palett inkl. de fyra varumärkesteman
- **[Typografi](/identitet/typografi/)** – Raleway + Arial, semantiska storlekar
- Source code: [packages/theme](https://github.com/Sundsvallskommun/web-shared-components/tree/main/packages/theme)
