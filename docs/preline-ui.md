# Preline UI

High-level overview of Preline UI in this template.

## Overview

Client-side components with Preline UI, Tailwind CSS v4, and Next.js App Router:

- `preline` package for interactive components (dropdowns, overlays, etc.).
- Tailwind forms plugin and Preline variants for component styles.
- Dynamic client-only script so Preline never runs during SSR.

Styles come from `globals.css`. Behavior is loaded once in the browser via the
`usePreline` hook, then re-initialized when the route changes.

## Design choices

| Choice                         | Reason                                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| Preline v4                     | Matches Tailwind v4 / official Next.js install path                |
| Client-only dynamic import     | Preline needs `window`; SSR would break or hydrate poorly          |
| Root-layout `PrelineScript`    | One init path for the whole app; pages stay free of boilerplate    |
| `usePreline` + pathname effect | App Router does not remount the layout; route changes need re-init |
| Delayed `autoInit` (~100ms)    | Give the new route DOM time to paint before scanning               |

## Flow

The root layout mounts the `PrelineScriptDynamic` component, which calls the
`usePreline` hook. It loads the library once, then schedules
`window.HSStaticMethods.autoInit()` and on each pathname change.

```mermaid
flowchart TD
  Layout["src/app/layout.tsx"] --> Script["PrelineScriptDynamic"]
  Script -->|ssr: false| PrelineScript["PrelineScript"]
  PrelineScript --> Hook["usePreline"]
  Hook -->|first visit| Import["import('preline')"]
  Hook -->|pathname change| Init["autoInit after delay"]
  Import --> Init
  CSS["globals.css"] --> Variants["preline/variants.css"]
  CSS --> Source["@source preline/dist/*.js"]
  CSS --> Forms["@tailwindcss/forms"]
```

Some relevant details:

- **Styles:** `src/app/globals.css` imports Preline variants, scans Preline
  JS for class names, and enables `@tailwindcss/forms`.
- **Types:** `global.d.ts` augments `Window` with `HSStaticMethods`.

## Considerations

- **Initializing:**
  - Call `init()` (or `init(["dropdown", "overlay"])`) after client-only
    DOM inserts that do not change the pathname.
