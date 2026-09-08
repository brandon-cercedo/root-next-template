const chatSession = {
  messages: [
    {
      parts: [
        {
          type: "text",
          text: 'wdyt about the following theme feature flow:\n\n```mermaid\nflowchart TD\n  Layout["src/app/layout.tsx"] --> Provider["ThemeProvider"]\n  Provider --> Script["ThemeScript inline IIFE"]\n  Script -->|"read localStorage theme"| HTML["html.dark class"]\n  Toggle["ThemeToggle / ThemeSelector"] --> useTheme["useTheme"]\n  useTheme --> Provider\n  Provider -->|"setTheme + apply class"| HTML\n  Provider -->|"setItem theme"| LS["localStorage"]\n  LS -->|"storage event other tabs"| Provider\n```',
        },
      ],
      id: "2szLnvgbNiCgP5Ok",
      role: "user",
      metadata: {
        timestamp: "2026-09-08T05:58:53.832Z",
      },
    },
    {
      id: "4oWJnNd5HsEQu9BW",
      metadata: {
        timestamp: "2026-09-08T05:58:58.734Z",
        durationMs: 4902,
      },
      role: "assistant",
      parts: [
        {
          type: "step-start",
        },
        {
          type: "text",
          text: "Your flow captures the theme management logic well:\n\n- Reading `localStorage` inside an inline script before React renders ensures the initial theme is set without flicker.\n- Using a `ThemeProvider` to manage theme state and provide `setTheme` is good React practice.\n- Syncing with `localStorage` and listening to `storage` events for multi-tab support is robust.\n- Encapsulating theme toggling in a `useTheme` hook and exposing it to UI components like `ThemeToggle` is neat and declarative.\n\nIn sum, this pattern is solid and common in Next.js apps for smooth client and SSR theme hydration. Make sure your inline script runs early enough to avoid flash of wrong theme.",
          providerMetadata: {
            openai: {
              itemId: "msg_0d12cb8cc65f524e006a9fa4210f9c87d1b308e0e095e9758d",
            },
          },
          state: "done",
        },
      ],
    },
  ],
  status: "ready",
};

export default chatSession;
