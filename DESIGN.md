# Design

Visual and UI conventions for this template. Read this before building or
restyling UI so new screens look like the rest of the app.

## Principles

- **Base:** always build UI with [Preline UI](https://preline.co) on
  Tailwind CSS v4.
- **Inspiration:** [Linear](https://linear.app) for UI/UX patterns and the
  overall calm, dense, keyboard-first feel.
- **Tokens:** plain Tailwind palette classes (no custom color tokens). Every
  color has a light and a `dark:` counterpart.
- **Icons:** [Lucide](https://lucide.dev) (`lucide-react`). Custom icons live
  in `src/components/ui/icons`.
- **Font:** Inter (`next/font/google`), `antialiased`.

## Theme

- Light / dark / system via `ThemeProvider` (see [docs/theme.md](docs/theme.md)).
- Dark mode uses the `.dark` class: `dark:` variants only, never
  `prefers-color-scheme` in CSS.
- Light mode uses the `gray-*` scale; dark mode uses the `neutral-*` scale.

## Color

### Background

| Role                     | Light         | Dark                  |
| ------------------------ | ------------- | --------------------- |
| App background (sidebar) | `bg-gray-100` | `dark:bg-neutral-950` |
| Page / content panel     | `bg-white`    | `dark:bg-neutral-900` |
| Raised (modal, dropdown) | `bg-white`    | `dark:bg-neutral-800` |
| Subtle (table header)    | `bg-gray-50`  | `dark:bg-neutral-800` |
| Backdrop                 | `bg-black/25` | `dark:bg-black/40`    |

The dashboard background always matches the sidebar color, and the page
content sits inside a rounded, bordered panel on top of it (Linear style).

### Text

| Role      | Classes                               |
| --------- | ------------------------------------- |
| Primary   | `text-gray-800 dark:text-neutral-200` |
| Secondary | `text-gray-600 dark:text-neutral-400` |
| Muted     | `text-gray-500 dark:text-neutral-500` |
| Heading   | `text-gray-800 dark:text-white`       |

### Borders and dividers

- `border-gray-200 dark:border-neutral-700`
- `divide-gray-200 dark:divide-neutral-700`

### Interactive states

| Context            | Hover / focus                                 |
| ------------------ | --------------------------------------------- |
| On white surface   | `hover:bg-gray-100 dark:hover:bg-neutral-700` |
| On sidebar surface | `hover:bg-gray-200 dark:hover:bg-neutral-800` |
| Secondary button   | `hover:bg-gray-50 dark:hover:bg-neutral-800`  |

- Always pair `hover:` with the same `focus:` style and add
  `focus:outline-hidden`.
- Disabled: add `disabled:pointer-events-none disabled:opacity-50`.

### Variants

| Meaning | Solid                               | Soft (bg / border / text)                  |
| ------- | ----------------------------------- | ------------------------------------------ |
| Primary | `bg-blue-600` → `hover:bg-blue-700` | —                                          |
| Info    | `bg-blue-600 dark:bg-blue-500`      | `blue-100` / `blue-200` / `blue-800`       |
| Success | `bg-teal-500`                       | `teal-100` / `teal-200` / `teal-800`       |
| Warning | `bg-yellow-500`                     | `yellow-100` / `yellow-200` / `yellow-800` |
| Danger  | `bg-red-500` → `hover:bg-red-600`   | `red-100` / `red-200` / `red-800`          |
| Debug   | `bg-indigo-600 dark:bg-indigo-500`  | —                                          |

Soft variants in dark mode use `dark:bg-<color>-500/20`,
`dark:border-<color>-900` and `dark:text-<color>-400`. See
`src/components/ui/Alert.tsx` and `src/components/ui/toasts/index.css`.

## Typography

| Use                               | Classes                       |
| --------------------------------- | ----------------------------- |
| Default UI text (sidebar, menus)  | `text-[13px] leading-5`       |
| Body, form inputs, large buttons  | `text-sm`                     |
| Small buttons, tooltips, captions | `text-xs`                     |
| Badges, micro labels              | `text-[10px]` / `text-[11px]` |
| Modal title                       | `text-lg font-medium`         |
| Page / card title                 | `text-2xl font-bold`          |

Weights: `font-medium` for buttons and labels, `font-semibold` for alert
titles, `font-bold` for page titles only. Monospace (`font-mono`) only for
`Kbd` and code.

## Shape and spacing

- **Radius:**
  - `rounded-md`: tooltips, `Kbd`, inline code.
  - `rounded-lg`: buttons, inputs, list items, dropdown menus.
  - `rounded-xl`: cards, modals, alerts, toasts, content panel.
  - `rounded-full`: icon-only close buttons, switches, badges.
- **Shadow:** `shadow-2xs` for cards, modals and tooltips; `shadow-xs` for the
  content panel; `shadow-md` for dropdowns and floating badges; `shadow-lg`
  for toasts.
- **Spacing:** use `gap-*` over margins. Common values: `gap-1`/`gap-2` inside
  controls, `gap-4` between blocks, `p-4` for page/modal padding, `p-3`
  around the dashboard panel.

## Icons

- `size-4` default; `size-3.5` in dense rows and small buttons; `size-3` in
  tiny close buttons and badges.
- Add `flex-none` so icons never shrink.
- Icon-only buttons need an `sr-only` label or `aria-label`.

## Layers (z-index)

Keep overlays on this scale. Do not invent new values; reuse the closest
layer.

| Layer             | z-index        | Source                                    |
| ----------------- | -------------- | ----------------------------------------- |
| Navbar            | `z-50`         | `components/layout/Navbar.tsx`            |
| Base navbar       | `z-50`         | `components/layout/navbar/BaseNavbar.tsx` |
| Sidebar           | `z-60`         | `components/layout/sidebar/Sidebar.tsx`   |
| Modal / offcanvas | `z-80`         | `components/ui/modal/Modal.tsx`           |
| Tooltip           | `z-9999`       | `components/ui/Tooltip.tsx`               |
| Toast             | `999999999`    | Sonner default (`Toasts.tsx`)             |
| Debug mode badge  | `z-1000000000` | `components/flags/FlagsBadge.tsx`         |
| Next dev toolbar  | `2147483647`   | Next.js (max 32-bit int)                  |

Dropdowns rendered inside the sidebar use `z-60` so they stay above it.
`z-10` / `z-20` are only for local stacking inside a component.

## Motion

- Default transition: `transition-all duration-300` (sidebar, collapse,
  accordion, layout padding).
- Modals: `slide-down` by default, `duration-500 ease-out`; `scale` uses
  `duration-200`.
- Dropdowns and tooltips fade with `transition-opacity`.
- Keep motion subtle; no bounce except the debug badge icon.

## Components

- Reuse the shared UI in `src/components/ui` before writing new markup.
- If nothing fits, copy the styles of the closest shared component.

## Layout

- **Dashboard:** fixed `w-60` sidebar on `bg-gray-100 dark:bg-neutral-950`;
  content in a `rounded-xl border` panel with `p-3` gutter
  (`app/dashboard/layout.tsx`).
- **Navbar:** sticky, `border-b`, `text-[13px]`, breadcrumbs on the left,
  actions on the right.
- **Pages:** `DashboardPageContainer` inside the dashboard,
  `PageContainer` (`max-w-3xl`, centered) for public pages.
- **Breakpoints:** mobile first. The sidebar becomes an overlay below `lg`.

## Class names

- Expose `*className` props for overrides.
- Only use `mergeClsx` or `clsx` for conditional or dynamic class names. DO NOT
  use it to split long static class strings across lines.
- Use `mergeClsx` when merging classes from outside to avoid clashes.
- Use `clsx` when all classes are known and don't clash. No need to merge.

## Accessibility

- Every interactive element has a visible `focus:` state.
- Icon-only controls carry `sr-only` text or `aria-label`.
- Use `role="status"` / `role="alert"` for live messages.
