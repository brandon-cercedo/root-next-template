/* eslint-disable max-lines */
import { ChatSessionStatus } from "@/prisma/types/client";

type SeedChatSession = {
  title: string;
  status: ChatSessionStatus;
  messages: PrismaJson.ChatUIMessageType[];
};

export const SEED_CHAT_SESSIONS: { sessions: SeedChatSession[] } = {
  sessions: [
    {
      title: "Markdown: full assistant message",
      status: ChatSessionStatus.ready,
      messages: [
        {
          parts: [
            {
              type: "text",
              text: "What is the latest stable version of Next.js?",
            },
          ],
          id: "59IfnqrdJLLkk0LV",
          role: "user",
          metadata: {
            timestamp: "2026-09-05T02:39:44.022Z",
          },
        },
        {
          id: "o4YqsnV7Ozy4SsVo",
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "text",
              text: "As of June 2024, the latest stable version of Next.js is 14.0.0.",
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_073727ec229bf88f006a9b80f37ba887d1af7669016a5525fc",
                },
              },
              state: "done",
            },
          ],
          metadata: {
            timestamp: "2026-09-05T02:39:47.413Z",
            durationMs: 3861,
          },
        },
        {
          parts: [
            {
              type: "text",
              text: "How could I install it?",
            },
          ],
          id: "a9sVrVO3qoaeus0q",
          role: "user",
          metadata: {
            timestamp: "2026-09-05T02:40:16.939Z",
          },
        },
        {
          id: "tTgmWplQo5ZxRC1r",
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "text",
              text: 'To install the latest stable Next.js (v14.0.0), run:\n\n```bash\nnpx create-next-app@latest\n```\n\nOr, to add Next.js to an existing project with npm:\n\n```bash\nnpm install next@latest react react-dom\n```\n\nWith yarn:\n\n```bash\nyarn add next@latest react react-dom\n```\n\n---\n\n## Markdown elements\n\n### Emphasis\n\n**Bold**, *italic*, ***bold italic***, ~~strikethrough~~, and `inline code`.\n\n### Links & quote\n\nSee the [Next.js docs](https://nextjs.org/docs) for details.\n\n> Tip: use App Router for new projects.\n\n### Lists\n\nUnordered:\n\n- App Router\n- Server Components\n  - Nested item\n- Streaming\n\nOrdered:\n\n1. Install\n2. Configure\n3. Deploy\n\nTask list:\n\n- [x] Install Next.js\n- [ ] Add auth\n- [ ] Ship to production\n\n### Table\n\n| Package | Role |\n| --- | --- |\n| `next` | Framework |\n| `react` | UI library |\n| `react-dom` | DOM renderer |\n\n### Code (syntax highlighting)\n\n```ts\nimport { NextConfig } from "next";\n\nconst config: NextConfig = {\n  reactStrictMode: true,\n};\n\nexport default config;\n```\n\n### Mermaid (diagram plugin)\n\n```mermaid\ngraph LR\n  A[create-next-app] --> B[Install deps]\n  B --> C[pnpm dev]\n  C --> D[App running]\n```\n\n### Math (KaTeX plugin)\n\nInline: the quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$.\n\nBlock:\n\n$$\nE = mc^2\n$$\n\n### CJK (East Asian text plugin)\n\n中文：**你好，世界** — Next.js 是一个 React 框架。\n\n日本語：**こんにちは** — Next.jsでアプリを作ります。\n\n한국어：**안녕하세요** — Next.js로 앱을 만듭니다。',
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_073727ec229bf88f006a9b8112fd5c87d1851515b90adea3fe",
                },
              },
              state: "done",
            },
          ],
          metadata: {
            timestamp: "2026-09-05T02:40:18.868Z",
            durationMs: 3135,
          },
        },
      ] as PrismaJson.ChatUIMessageType[],
    },
    {
      title: "Tools: Server + client",
      status: ChatSessionStatus.ready,
      messages: [
        {
          parts: [
            {
              type: "text",
              text: "Summarize my signed-in profile.",
            },
          ],
          id: "WDsp1AkbU2gjNbOO",
          role: "user",
          metadata: {
            timestamp: "2026-09-15T22:08:35.478Z",
          },
        },
        {
          id: "lrzzzinA1PqcLEA8",
          metadata: {
            timestamp: "2026-09-15T22:08:38.904Z",
            durationMs: 3426,
          },
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "tool-getCurrentUser",
              toolCallId: "call_nbTOz8ALFqc7fkLrzEV99xpU",
              state: "output-available",
              input: {},
              output: {
                name: "John Doe",
                email: "john.doe@example.com",
                image: null,
                createdAt: "2026-09-09T02:28:58.956Z",
                updatedAt: "2026-09-09T02:28:58.956Z",
                accounts: [],
              },
              callProviderMetadata: {
                openai: {
                  itemId:
                    "fc_0e38a8ad6cb0e7e8006aa9c1e4cb9c87d1b02ef3f39add0953",
                },
              },
              resultProviderMetadata: {
                openai: {
                  itemId:
                    "fc_0e38a8ad6cb0e7e8006aa9c1e4cb9c87d1b02ef3f39add0953",
                },
              },
            },
            {
              type: "step-start",
            },
            {
              type: "text",
              text: "Your profile summary:\n\n- **Name:** John Doe\n- **Email:** john.doe@example.com\n- **Created At:** September 9, 2026\n- **Updated At:** September 9, 2026",
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_08cdcef5a12d4cae006aa9c1e65c0887d1bc1b0152e990ff9a",
                },
              },
              state: "done",
            },
          ],
        },
        {
          parts: [
            {
              type: "text",
              text: "Need my signed-in profile as json:\n- include all fields even thought its value is empty or absent.",
            },
          ],
          id: "gbhloyTYbb1evy4H",
          role: "user",
          metadata: {
            timestamp: "2026-09-15T22:08:43.965Z",
          },
        },
        {
          id: "iopkYVTBac2FkTOH",
          metadata: {
            timestamp: "2026-09-15T22:08:46.033Z",
            durationMs: 2068,
          },
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "text",
              text: 'Here\'s your signed-in profile in JSON format:\n\n```json\n{\n  "name": "John Doe",\n  "email": "john.doe@example.com",\n  "image": null,\n  "createdAt": "2026-09-09T02:28:58.956Z",\n  "updatedAt": "2026-09-09T02:28:58.956Z",\n  "accounts": []\n}\n```',
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_08cdcef5a12d4cae006aa9c1ecff4487d1aa0f6b102da8cbb2",
                },
              },
              state: "done",
            },
          ],
        },
        {
          parts: [
            {
              type: "text",
              text: "Lists UI actions with full details.",
            },
          ],
          id: "t1xBdlZEG9oPZZwq",
          role: "user",
          metadata: {
            timestamp: "2026-09-15T22:09:01.073Z",
          },
        },
        {
          id: "bUYS0ffcBItqYf7U",
          metadata: {
            timestamp: "2026-09-15T22:09:05.987Z",
            durationMs: 4914,
          },
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "text",
              text: "Here are the available UI actions with full details:\n\n1. **Toggle command palette**\n   - **Group:** Navigation\n   - **Shortcut:** ⌘K (Mac), Ctrl+K (Windows)\n\n2. **Open command palette**\n   - **Group:** Navigation\n   - **Shortcut:** / (Mac and Windows)\n\n3. **Toggle theme**\n   - **Group:** Theme\n   - **Shortcut:** ⌘⇧, (Mac), Ctrl+Shift+, (Windows)\n\n4. **Theme: Light**\n   - **Group:** Theme\n\n5. **Theme: Dark**\n   - **Group:** Theme\n\n6. **Theme: System**\n   - **Group:** Theme\n\n7. **Toggle sidebar**\n   - **Group:** Navigation\n   - **Shortcut:** ⌘B (Mac), Ctrl+B (Windows)\n\n8. **Open keyboard shortcuts**\n   - **Group:** Navigation\n   - **Shortcut:** ⌘/ (Mac), Ctrl+/ (Windows)\n\n9. **Go to Home**\n   - **Group:** Navigation\n\n10. **Log out**\n    - **Group:** Actions\n\n11. **Confetti**\n    - **Group:** Actions\n    - **Shortcut:** ⌘⇧. (Mac), Ctrl+Shift+. (Windows)\n\n12. **Open flag toolbar**\n    - **Group:** Admin\n    - **Shortcut:** ⌘⇧/ (Mac), Ctrl+Shift/ (Windows)",
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_08cdcef5a12d4cae006aa9c1ffe97487d19df2d10da086a537",
                },
              },
              state: "done",
            },
          ],
        },
        {
          parts: [
            {
              type: "text",
              text: "Celebrate with confetti.",
            },
          ],
          id: "JnE9Q2ZfNVNd24Af",
          role: "user",
          metadata: {
            timestamp: "2026-09-15T22:09:23.031Z",
          },
        },
        {
          id: "XwtU9ikTIcY6jaQz",
          metadata: {
            timestamp: "2026-09-15T22:09:26.203Z",
            durationMs: 3172,
          },
          role: "assistant",
          parts: [
            {
              type: "step-start",
            },
            {
              type: "tool-runKeyboardCommand",
              toolCallId: "call_m2SrvS7q0OJw0QG2hO2DaTpp",
              state: "output-available",
              input: {
                commandId: "confetti",
              },
              output: {
                success: true,
                commandId: "confetti",
              },
              callProviderMetadata: {
                openai: {
                  itemId:
                    "fc_08cdcef5a12d4cae006aa9c21465c087d1a64e32f72ee31d16",
                },
              },
            },
            {
              type: "step-start",
            },
            {
              type: "text",
              text: "Confetti celebration activated! 🎉 Enjoy!",
              providerMetadata: {
                openai: {
                  itemId:
                    "msg_08cdcef5a12d4cae006aa9c21590f487d1b717a76c60a88593",
                },
              },
              state: "done",
            },
          ],
        },
      ] as PrismaJson.ChatUIMessageType[],
    },
    {
      title: "Markdown: input and output messages",
      status: ChatSessionStatus.ready,
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
                  itemId:
                    "msg_0d12cb8cc65f524e006a9fa4210f9c87d1b308e0e095e9758d",
                },
              },
              state: "done",
            },
          ],
        },
      ] as PrismaJson.ChatUIMessageType[],
    },
  ],
};
