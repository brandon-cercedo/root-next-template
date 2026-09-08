const chatSession = {
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
              itemId: "msg_073727ec229bf88f006a9b80f37ba887d1af7669016a5525fc",
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
              itemId: "msg_073727ec229bf88f006a9b8112fd5c87d1851515b90adea3fe",
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
  ],
  status: "ready",
};

export default chatSession;
