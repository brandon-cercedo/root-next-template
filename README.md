# 🎲 root-next-template

A base template to build `Next.js` applications.

## 👀 About

### 🎯 Features

- Pre-configured development tools: to ensure type checking, linting, formatting, testing and git hooks.

### 💻 Tech Stack

| Tool                                                                                       | Description                          |
| ------------------------------------------------------------------------------------------ | ------------------------------------ |
| [Next.js v16](https://nextjs.org/)                                                         | App framework                        |
| [React v19](https://react.dev/)                                                            | UI library                           |
| [TypeScript v5](https://www.typescriptlang.org/)                                           | Typed JavaScript                     |
| [Tailwind CSS v4](https://tailwindcss.com/)                                                | Styling library                      |
| [ESLint v9](https://eslint.org/)                                                           | Linting tool                         |
| [Prettier](https://prettier.io/)                                                           | Formatting tool                      |
| [Vitest](https://vitest.dev/)                                                              | Unit tests tool                      |
| [Husky](https://typicode.github.io/husky/)                                                 | Git hooks tool                       |
| [lint-staged](https://github.com/lint-staged/lint-staged)                                  | Run tasks against staged git files   |
| [Commitlint](https://commitlint.js.org/)                                                   | Lint git commit messages             |
| [eslint-plugin-unused-imports](https://github.com/sweepline/eslint-plugin-unused-imports)  | Remove unused imports                |
| [eslint-plugin-check-file](https://github.com/dukeluo/eslint-plugin-check-file)            | Check file/folder naming conventions |
| [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) | Sort Tailwind CSS classes            |

## 🚀 Getting Started

### ❗ Prerequisites

- [Node.js v24.16.0](https://nodejs.org/en)
- [nvm (Node Version Manager)](https://github.com/nvm-sh/nvm)
- [pnpm v10.34.3](https://pnpm.io/)

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

4. (Optional) Install agent skills:

    ```bash
    pnpm skills:install
    ```

5. Start the development server:

    ```bash
    pnpm dev
    ```

6. Open <http://localhost:3000> in your browser.

You are ready to build your application! 🎉

## 🛠 Development

### 🪛 Scripts

| Script                | Description                             |
| --------------------- | --------------------------------------- |
| `pnpm dev`            | Start the development server            |
| `pnpm build`          | Build the production application        |
| `pnpm start`          | Start the production server             |
| `pnpm lint`           | Run linting                             |
| `pnpm lint:fix`       | Fix linting errors                      |
| `pnpm test`           | Run tests once                          |
| `pnpm test:watch`     | Run tests in watch mode                 |
| `pnpm test:coverage`  | Run tests with coverage                 |
| `pnpm test:all`       | Typecheck, lint, test, and format check |
| `pnpm format`         | Run formatting                          |
| `pnpm format:check`   | Check formatting                        |
| `pnpm type:check`     | Check type definitions                  |
| `pnpm skills:install` | Install agent skills                    |

## ⚠️ License

[MIT](LICENSE)

## 💎 Acknowledgments

Check out these resources to learn more about writing clean code:

- [Naming cheatsheet](https://github.com/kettanaito/naming-cheatsheet)
- [clean-code-javascript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Programming Principles](https://github.com/webpro/programming-principles)

Thanks to these projects for the inspiration:

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
