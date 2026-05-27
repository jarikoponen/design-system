---
title: Översikt
description: Sundsvalls designsystem använder design tokens i W3C-format. Allt visuellt – färg, typografi, avstånd – kommer härifrån.
---

Tokens är källan till sanning för allt visuellt i Sundsvalls designsystem. De definieras i `tokens-src/*.json` (W3C Design Tokens-format) och kompileras med [Style Dictionary](https://styledictionary.com/) till CSS custom properties som komponenter konsumerar.

## Hur du använder dem

I CSS:

```css
.knapp-primary {
	background: var(--color-brand-primary);
	color: var(--color-semantic-text-on-brand);
	padding: var(--space-3) var(--space-4);
	border-radius: var(--radius-md);
	font-family: var(--font-family-sans);
	font-weight: var(--font-weight-medium);
}
```

**Aldrig** hårdkoda färger eller storlekar. Om värdet du behöver inte finns – lägg till en ny token, dokumentera den, och använd referensen.

## Tre nivåer

1. **Primitiver** – råa värden (`color.neutral.900`, `space.4`).
2. **Semantiska** – meningsbärande alias (`color.semantic.text.default`, `color.semantic.focus`). **Föredra dessa i komponentkod.**
3. **Komponent-specifika** – om en komponent behöver egna tokens, prefixa med komponentnamnet.

## Tokens som finns nu

### Färger

- **Varumärke**: `--color-brand-primary`, `--color-brand-primary-hover`, `--color-brand-accent`
- **Neutrala**: `--color-neutral-0` … `--color-neutral-900`
- **Status**: `--color-status-success`, `--color-status-warning`, `--color-status-error`, `--color-status-info`
- **Semantiska**: `--color-semantic-text-default`, `--color-semantic-text-muted`, `--color-semantic-text-on-brand`, `--color-semantic-surface-default`, `--color-semantic-surface-subtle`, `--color-semantic-border-default`, `--color-semantic-focus`

### Avstånd och radius

- **Avstånd**: `--space-0` … `--space-8` (skala 0 → 64 px)
- **Hörnradier**: `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`

### Typografi

- **Familjer**: `--font-family-sans`, `--font-family-mono`
- **Storlekar**: `--font-size-xs` … `--font-size-3xl`
- **Vikter**: `--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`
- **Radhöjder**: `--font-line-height-tight`, `--font-line-height-normal`
