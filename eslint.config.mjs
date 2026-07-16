import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import checkFile from "eslint-plugin-check-file";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * @see {@link https://nextjs.org/docs/app/api-reference/config/eslint#setup-eslint | ESLint Plugin}
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".agents/**",
  ]),
  {
    plugins: {
      "unused-imports": unusedImports,
      "check-file": checkFile,
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/newline-after-import": "error",
      "no-eval": "error",
      curly: "error",
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "off",
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/**/!(main|index|page|layout|loading|not-found|error|global-error|template|default|config|use*|*.test).{tsx,jsx}":
            "PASCAL_CASE",
          "src/**/use*.{ts,tsx}": "KEBAB_CASE",
          "src/**/*.{ts,js}": "KEBAB_CASE",
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "src/**/!(__tests__)": "KEBAB_CASE",
        },
      ],
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-namespace": [
        "error",
        {
          allowDeclarations: true,
        },
      ],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: false, skipComments: false },
      ],
      "max-params": ["error", { max: 2, countVoidThis: false }],
    },
  },
]);

export default eslintConfig;
