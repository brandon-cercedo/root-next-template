const chatSession = {
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
              itemId: "fc_0e38a8ad6cb0e7e8006aa9c1e4cb9c87d1b02ef3f39add0953",
            },
          },
          resultProviderMetadata: {
            openai: {
              itemId: "fc_0e38a8ad6cb0e7e8006aa9c1e4cb9c87d1b02ef3f39add0953",
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
              itemId: "msg_08cdcef5a12d4cae006aa9c1e65c0887d1bc1b0152e990ff9a",
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
              itemId: "msg_08cdcef5a12d4cae006aa9c1ecff4487d1aa0f6b102da8cbb2",
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
              itemId: "msg_08cdcef5a12d4cae006aa9c1ffe97487d19df2d10da086a537",
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
              itemId: "fc_08cdcef5a12d4cae006aa9c21465c087d1a64e32f72ee31d16",
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
              itemId: "msg_08cdcef5a12d4cae006aa9c21590f487d1b717a76c60a88593",
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
