# short-answer

Answer the question directly, keeping only what is relevant to it.

- Lead with the answer, then support it with context or examples only if they clarify.
- Omit anything that doesn't directly serve the question: unrelated options, edge cases, unsupported workarounds, historical context, etc.

## Example

**Input:**
/short-answer is it possible to change the dev indicator size in Next.js 16 from @next.config.ts ?

**Output:**
**No — not via `next.config.ts` in Next.js 16.** The built-in `devIndicators` API only supports:

| Option        | Values                                                               |
| ------------- | -------------------------------------------------------------------- |
| Hide entirely | `devIndicators: false`                                               |
| Position      | `'bottom-left'` \| `'bottom-right'` \| `'top-left'` \| `'top-right'` |

There is **no `size`** or `scale` field.

**What you can do instead:**

- Open **Preferences** in the dev indicator UI (if your version exposes it) and change the size.
- Hide it entirely: `devIndicators: false`.
