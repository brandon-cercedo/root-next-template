# briefly

Answer briefly. Be direct. Use simple words.

## Rules

- Lead with the answer in the first sentence.
- Use plain language and short sentences.
- Cover everything the question needs — nothing more.
- Keep the full response to no more than 10 lines.
- Add an example only when nothing else makes the answer clear.
  - When you use an example, keep it to one short snippet or one brief illustration.

## Omit

- Tangents, unasked alternatives, edge cases, and background history.
- Extra sections when the core answer is already complete.

## Example

**Input:**
/briefly can I change the dev indicator size in next.config.ts?

**Output:**
**No — you can't change the size from `next.config.ts` in Next.js 16.** The `devIndicators` option only supports:

| Option        | Values                                                               |
| ------------- | -------------------------------------------------------------------- |
| Hide entirely | `devIndicators: false`                                               |
| Position      | `'bottom-left'` \| `'bottom-right'` \| `'top-left'` \| `'top-right'` |

There is no `size` or `scale` field.
