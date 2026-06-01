# 🎲 root-next-template

A base template to build `Next.js` applications.

## 👀 About

### 🎯 Features

- Pre-configured development tools: to ensure type checking, linting, formatting, testing and git hooks.

### 💻 Tech Stack

| Tool                                                                                       | Version | Description                          |
| ------------------------------------------------------------------------------------------ | ------- | ------------------------------------ |
| [Next.js](https://nextjs.org/)                                                             | 16.2.6  | App framework                        |
| [React](https://react.dev/)                                                                | 19.2.4  | UI library                           |
| [TypeScript](https://www.typescriptlang.org/)                                              | ^5.9.3  | Typed JavaScript                     |
| [Tailwind CSS](https://tailwindcss.com/)                                                   | ^4.3.0  | Styling library                      |
| [ESLint](https://eslint.org/)                                                              | ^9.39.4 | Linting tool                         |
| [Prettier](https://prettier.io/)                                                           | 3.8.3   | Formatting tool                      |
| [Vitest](https://vitest.dev/)                                                              | ^4.1.7  | Unit tests tool                      |
| [Husky](https://typicode.github.io/husky/)                                                 | ^9.1.7  | Git hooks tool                       |
| [lint-staged](https://github.com/lint-staged/lint-staged)                                  | ^17.0.5 | Run tasks against staged git files   |
| [Commitlint](https://commitlint.js.org/)                                                   | ^21.0.1 | Lint git commit messages             |
| [eslint-plugin-unused-imports](https://github.com/sweepline/eslint-plugin-unused-imports)  | ^4.4.1  | Remove unused imports                |
| [eslint-plugin-check-file](https://github.com/dukeluo/eslint-plugin-check-file)            | ^3.3.1  | Check file/folder naming conventions |
| [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | ^0.8.0  | Sort Tailwind CSS classes            |

## 🚀 Getting Started

### ❗ Prerequisites

- [Node.js v24.16.0](https://nodejs.org/en)
- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)
- [pnpm v10.33.4](https://pnpm.io/)

### ⚙️ Installation

1. Clone the repository.
2. Navigate to the project directory and set up Node.js with nvm:

    ```bash
    nvm install # based on .nvmrc file
    nvm use
    ```

3. Enable Corepack and install dependencies:

    ```bash
    corepack enable
    pnpm i
    ```

4. Start the development server:

    ```bash
    pnpm dev
    ```

5. Open <http://localhost:3000> in your browser.

You are ready to build your application! 🎉

## 🛠 Development

### 🪛 Scripts

| Script               | Description                             |
| -------------------- | --------------------------------------- |
| `pnpm dev`           | Start the development server            |
| `pnpm build`         | Build the production application        |
| `pnpm start`         | Start the production server             |
| `pnpm lint`          | Run linting                             |
| `pnpm lint:fix`      | Fix linting errors                      |
| `pnpm test`          | Run tests once                          |
| `pnpm test:watch`    | Run tests in watch mode                 |
| `pnpm test:coverage` | Run tests with coverage                 |
| `pnpm test:all`      | Typecheck, lint, test, and format check |
| `pnpm format`        | Run formatting                          |
| `pnpm format:check`  | Check formatting                        |
| `pnpm type:check`    | Check type definitions                  |

## ⚠️ License

[MIT](LICENSE)

## 💎 Acknowledgments

Check out these resources to learn more about writing clean code:

- [Naming cheatsheet](https://github.com/kettanaito/naming-cheatsheet)
- [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Programming Principles](https://github.com/webpro/programming-principles)

Thanks to these projects for the inspiration:

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
