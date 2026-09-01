# Keyboard shortcuts

High-level overview of dashboard keyboard shortcuts and the command palette.

## Overview

Dashboard-only shortcuts powered by `tinykeys`, plus a action search built
with `cmdk` inside the existing Preline `Modal` overlay:

- Global chords bind on `window` via `KeyboardCommands`.
- `⌘K` / `Ctrl+K` toggles the command palette (always active).
- `/` opens the palette when focus is not in an editable field.

## Design choices

| Choice              | Reason                                             |
| ------------------- | -------------------------------------------------- |
| `tinykeys` + `$mod` | Cross-platform ⌘ / Ctrl without custom key parsing |
| Preline `Modal`     | Reuses existing overlay stack and z-index behavior |

## Bindings

| Chord                  | Action                                   |
| ---------------------- | ---------------------------------------- |
| `⌘K` / `Ctrl+K`        | Toggle command palette                   |
| `/`                    | Open palette (non-editable targets only) |
| `⌘⇧,` / `Ctrl+Shift+,` | Toggle resolved light / dark theme       |
| `⌘B` / `Ctrl+B`        | Toggle sidebar overlay                   |
| `⌘⇧.` / `Ctrl+Shift+.` | Confetti                                 |
| `⌘⇧/` / `Ctrl+Shift+/` | Open flag toolbar (admin)                |

Modifier chords still run while focused in inputs; `/` does not.
Esc closes the palette via Preline (not `tinykeys`).
Shortcut labels show Mac or Windows, not both, via `getIsMac`.

## Flow

`KeyboardCommands` mounts as a sibling inside `DashboardProviders` on the
dashboard layout. It binds shortcuts, renders `CommandPalette`, and executes
shared actions for both chords and palette selections.

```mermaid
flowchart TD
  Layout["src/app/dashboard/layout.tsx"] --> Commands["KeyboardCommands"]
  Commands --> Tinykeys["tinykeys on window"]
  Commands --> Palette["CommandPalette"]
  Tinykeys --> Overlay["useOverlay toggle/open"]
  Palette --> Cmdk["cmdk Command in Modal"]
  Cmdk --> Actions["theme / sidebar / nav / confetti"]
  Overlay --> Preline["Preline HSOverlay"]
```

Some relevant details:

- **Registry:** `src/components/keyboard/config.tsx` lists ids, labels, groups,
  optional chords, keywords, and optional palette `icon` nodes. Chord-only
  commands skip the palette via `inPalette: false`. `getKeyboardCommands`
  attaches `run` in `KeyboardCommands`.
- **Editable guard:** `isEditableTarget` in `src/lib/utils/html.ts` blocks `/`
  inside inputs, textareas, selects, and common ARIA text roles.

## Considerations

- **Scope:** Shortcuts are dashboard-only; marketing and auth pages are
  unchanged.
- **Preline vs cmdk:** Arrow keys and typing stay on cmdk while the palette
  is open; other chords pause except `⌘K` / `Ctrl+K`.
