export default {
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
          text: "To install the latest stable Next.js (v14.0.0), run:\n\n```bash\nnpx create-next-app@latest\n```\n\nOr, to add Next.js to an existing project with npm:\n\n```bash\nnpm install next@latest react react-dom\n```\n\nWith yarn:\n\n```bash\nyarn add next@latest react react-dom\n```",
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
