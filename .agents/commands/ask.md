# ask

Answer the question in $ARGUMENTS. Do not change anything.

## Input

It is required. The user must ask a question.

If no question is given, stop and ask for it. DO NOT guess one.

## Rules

- Answer only the question asked.
- Read and search the code as needed to give a correct answer.
- Never edit, create, move, or delete files.
- Never run commands that change anything (installs, builds, git
  commits, formatters, migrations, writes to a database).
- When a change would help, show it as a snippet in the reply. DO NOT
  apply it.
  - Name the file and the place the snippet goes.

## Omit

- Changes or fixes the user did not ask about.
- Offers to apply the suggested changes.

## Example

**Input:**
/ask how do I move the dev indicator to the left?

**Output:**
**Change `devIndicators.position` in `next.config.ts`.** It is set to
`"bottom-right"` now.

```ts
devIndicators: {
  position: "bottom-left",
},
```
