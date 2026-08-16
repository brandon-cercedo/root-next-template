import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["src/testing/setup.ts"],
    include: ["src/**/*.{test,spec}.ts(x)?"],
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
    },
    env: {
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/test_db",
      SHADOW_DATABASE_URL:
        "postgres://postgres:postgres@localhost:5432/test_db_shadow",
      NEXTAUTH_URL: "http://localhost:3000",
      NEXTAUTH_SECRET: "test-secret",
      GOOGLE_CLIENT_ID: "test-google-client-id",
      GOOGLE_CLIENT_SECRET: "test-google-client-secret",
      NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
      NEXT_PUBLIC_APP_VERSION: "0.1.0",
    },
  },
  resolve: {
    tsconfigPaths: true,
  },
});
