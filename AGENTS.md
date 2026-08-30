# Agent Guidelines

Guidelines for AI agents and humans working on this codebase.

## Tech Stack

- Runtime: Node.js v24
- Package manager: pnpm v10
- Framework: Next.js v16, React v19, TypeScript v5, Tailwind CSS v4
- Testing: Vitest + Testing Library
- Linting: ESLint
- Formatting: Prettier
- Git hooks: Husky, lint-staged, Commitlint

> [!IMPORTANT]
> <!-- BEGIN:nextjs-agent-rules -->
> ### This is NOT the Next.js you know
>
> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
> <!-- END:nextjs-agent-rules -->

## Scripts

| Task      | Command                                                                  |
| --------- | ------------------------------------------------------------------------ |
| Dev       | `pnpm dev`                                                               |
| Lint      | `pnpm lint` / `pnpm lint:fix`                                            |
| Test      | `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` / `pnpm test:all` |
| Format    | `pnpm format` / `pnpm format:check`                                      |
| Typecheck | `pnpm type:check`                                                        |

## Code Style

Enforced by ESLint / Prettier / Commitlint — follow these over conflicting prose elsewhere.

- Naming:
  - Folders: kebab-case (except `__tests__`).
  - Files:
    - `.tsx`/`.jsx`: PascalCase (except `main|index|page|layout|loading|not-found|error|global-error|template|default|config|use*|*.test`).
    - `.ts`/`.js`: kebab-case (including `use*` hooks).
- File formatting:
  - Line length: max 79 characters.
  - File length: max 300 lines.
  - Semicolons: true.
  - Quotes: double quotes.
- Imports:
  - Import direction: app → features → shared.
    - App (`src/app`):
      - only import from features and shared.
      - `*View.tsx` lives in `_components` and are used to compose the page.
    - Features (`src/features`):
      - only import from shared.
      - each feature is self-contained.
    - Shared (`src/components`, `src/hooks`, `src/lib`, `src/actions`, `src/assets`,
      `src/testing`):
      - only import from other shared folders.
- Git and GitHub conventions:
  - Commits:
    - Use Conventional Commits.
    - Pattern: `<type>(<optional_scope>): <subject>`.
  - Pull requests:
    - Pattern: `<type>(<task_id>): <subject>`.
    - Example: `feat(123): add new feature`.
- Tests:
  - Framework: Vitest + Testing Library.
  - File naming: `src/**/*.{test,spec}.ts(x)?`.
  - Parent folder: prefer placing tests under `__tests__` folders.
  - Public and exported APIs: should be covered by tests.

### Folder Structure

<details>
<summary>Check out the below folder structure to understand how the project must be organized:</summary>

```sh
src/
+-- app/               # Next.js app router (pages, layouts)
+-- assets/            # Static files (images, fonts, icons)
+-- components/        # Shared UI components
    +-- ui/            # Reusable UI primitives and framework-agnostic (Button, Input, Modal)
    +-- layout/        # Layout components (Header, Sidebar, Footer)
+-- hooks/             # Shared custom hooks (useAuth, useLocalStorage)
+-- features/          # Feature-based modules
    +-- auth/
        +-- actions/     # Server actions only (login.ts, register.ts)
        +-- utils/       # Feature utils (generate-password.ts)
        +-- components/  # Feature components (LoginForm, SignupModal)
        +-- hooks/       # Feature hooks (useAuth, useSession)
        +-- types/       # Feature types (User, AuthState)
        +-- stores/      # Feature state (authStore.ts)
        +-- api/         # External API calls (oauth.ts, resetPassword.ts)
        +-- schema/      # Feature schemas (auth.ts)
+-- lib/               # Shared utilities and configurations
    +-- config/        # App config (env.ts, database.ts, auth.ts)
    +-- utils/         # Pure utilities (format.ts, validation.ts)
+-- actions/           # Shared server actions
    +-- db/            # DB utilities (user.ts, profile.ts)
+-- types/             # Global TypeScript types (api.ts, common.ts)
+-- stores/            # Global state stores (userStore.ts, appStore.ts)
+-- tests/             # Test utilities, mocks, and setup files
```

Also, use `__tests__` folders to colocate tests alongside the code they verify.

</details>

## Programming Principles

Ensure these programming principles are followed when writing code:

- KISS (Keep It Simple): Avoid unnecessary complexity and choose the simplest solution.
- DRY (Don't Repeat Yourself): Extract repeated logic into reusable functions.
- YAGNI (You Aren't Gonna Need It): Don't implement until necessary.
- SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion): Follow the SOLID principles.
- FIRST (Fast, Isolated, Repeatable, Self-validating, Timely): Follow the FIRST principles for testing.

Also, consider the following code guidelines:

- Max 2 function arguments; use an object if more.
- Put shared functions in shared folders; otherwise, keep them local.
- Avoid negative variable names.
- Only comment things that have business logic complexity.
- Prefer early returns over nesting. For example, prefer this:

```ts
const isValid = isValidInput();
if (!isValid) {
  return;
}

doSomething();
```

over this:

```ts
const isValid = isValidInput();
if (isValid) {
  doSomething();
}
```

- Only use `mergeClsx` or `clsx` for conditional or dynamic class names. DO NOT use it to split long static class strings across lines.

## Summary

- ALWAYS ask for clarification if requirements are unclear, incomplete, or ambiguous. NEVER make assumptions.
- ALWAYS write clean, readable and self-documenting code.
