# Chatbot

High-level overview of the dashboard Q&A chatbot in this template.

## Overview

Streaming chat on `/dashboard/chats` (and `/dashboard/chats/[id]`) for
**JavaScript, TypeScript, Node.js, and Next.js**, plus **App/DB**
answers and **UI keyboard commands** via tools:

- OpenAI via `@ai-sdk/openai` and the Vercel AI SDK (no AI Gateway).
- Sessions persist in `ChatSession` (save the user message before each
  send; update on stream end).

### Defaults

| Constant             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| `CHAT_MODEL`         | `gpt-4o-mini`                                                |
| `CHAT_SYSTEM_PROMPT` | JS/TS/Node/Next + App/DB + UI commands; concise; refuse else |

### Tools

| Tool                 | Where  | Behavior                                              |
| -------------------- | ------ | ----------------------------------------------------- |
| `getCurrentUser`     | Server | Prisma profile for closed-over session `userId`       |
| `runKeyboardCommand` | Client | Schema only on server; `onToolCall` runs via keyboard |

## Design choices

| Choice                           | Reason                                                      |
| -------------------------------- | ----------------------------------------------------------- |
| Direct `@ai-sdk/openai`          | Single `OPENAI_API_KEY`; no Gateway routing                 |
| Session-scoped tools             | Never trust client-supplied user ids                        |
| Client keyboard tool             | UI commands must run in the browser via `useKeyboard`       |
| `commandsByIdRef`                | Long-lived keyboard Map for off-screen streaming chats      |
| `ChatInstancesProvider`          | Keep `Chat` instances across route changes (keep streams)   |
| `beforeunload` guard             | Tab close/reload aborts streams; warn while a chat works    |
| Client-sent `keyboardCommandIds` | Tool enum = registry ids with `run`; server allowlists them |
| Server message metadata          | Assistant `timestamp` / `durationMs` stamped in the API     |
| Client user timestamp            | User `timestamp` stamped on send for immediate UI           |

## Flow

Chat mounts from routes `/dashboard/chats` and `/dashboard/chats/[id]` →
`ChatView` → `ChatSection` → `useAgent` → `/api/chat`.

- ChatSession persistence

```mermaid
flowchart TD
  NewChat["/dashboard/chats"] --> FirstSend["First send"]
  Existing["/dashboard/chats/id"] --> Load["getChatSession"]
  Load --> Seed["useAgent seeds initialMessages if no live Chat"]
  Seed --> LaterSend["Later send"]
  FirstSend --> Compose["composeUserMessage id + timestamp"]
  LaterSend --> Compose
  Compose -->|first send| Create["handleCreateChatSession status submitted"]
  Compose -->|later send| Update["handleUpdateChatMessage status submitted + all messages"]
  Create --> Send["await sendMessage(message) POST /api/chat"]
  Update --> Send
  Send --> OnStart["streamText onStart → status streaming"]
  OnStart --> OnEnd["toUIMessageStream onEnd"]
  OnEnd --> Persist["updateChatSession messages + status"]
  Persist --> Refresh["useAgent onFinish → router.refresh"]
  Refresh -->|first send| Push["router.push /dashboard/chats/id"]
  Push --> Reuse["ChatInstancesProvider reuses live Chat"]
  Reuse --> LaterSend
```

- Chat lifecycle

```mermaid
flowchart TD
  View["ChatView"] --> Section["ChatSection"]
  Section --> Hook["useAgent"]
  Hook --> Provider["ChatInstancesProvider Map"]
  Provider --> UseChat["useChat chat instance"]
  UseChat --> Transport["DefaultChatTransport /api/chat"]
  Transport --> Route["POST /api/chat"]
  Route --> Auth["getUserId"]
  Auth -->|401| Unauthorized
  Auth --> Parse["ChatRequestSchema"]
  Parse -->|400| Invalid
  Parse --> Owner["getChatSession"]
  Owner -->|404| NotFound
  Owner --> Stream["streamText + createChatTools"]
  Stream -->|server execute| GetUser["getCurrentUser Prisma"]
  Stream -->|no execute| KbSchema["runKeyboardCommand schema"]
  Stream --> UI["createUIMessageStreamResponse"]
  UI --> UseChat
  UseChat -->|onToolCall| KbRun["commandsByIdRef.run"]
  KbRun -->|addToolOutput| UseChat
  UseChat -->|sendAutomaticallyWhen| Transport
  UseChat --> Messages["ChatMessages + ChatInput"]
```

Some relevant details:

- **Auth:** Dashboard is gated; the route still returns `401` without a
  session.
- **Errors:** Request parse failures and stream errors are logged;
  soft danger `Alert` shows the client error message. Tool failures use
  `addToolOutput({ state: "output-error", errorText })`. `ChatSession.status`
  is updated to `error` or `aborted` in `toUIMessageStream.onEnd`.
- **`useAgent`:** creates `Chat` instance; sends the pre-composed user
  message (metadata `timestamp`); skips dynamic tools; sends `keyboardCommandIds`
  and `chatId`; runs `runKeyboardCommand` via `commandsByIdRef`.
- **Streams across pages:** `ChatInstancesProvider` keeps each `Chat` by id; so
  moving between `/dashboard` pages doesn't stop a response; reopening the chat
  reuses the live instance.
- **Leave-site prompt:** shown while any chat is `submitted` or `streaming` by
  the `beforeunload` listener in `ChatInstancesProvider`.
- **Agent loop:** `stopWhen: stepCountIs(5)`, `maxRetries: 2`,
  `temperature: 0.2`, `repairToolCall` (re-ask; no `Output.object`).
- **Input:** Enter sends; Shift+Enter inserts a newline.
- **`client-debug`:** Logs section state and shows non-text **Steps**
  under assistant bubbles.
- **`server-debug`:** Logs chat input and `streamText` `onEnd` output in
  the API route.
- **`user-message-markdown`:** When on, user bubbles render via
  `MessageMarkdown`; when off, user text is plain
  `whitespace-pre-wrap`.
- **Env:** `OPENAI_API_KEY` in `envs.ts` / `.env.example`;
  required at runtime to chat (SDK reads it by default).
- **`lastMessageAt`:** Timestamp of the last persisted message: user
  message on send, then reply in `onEnd`.

### Server tool (`getCurrentUser`)

Runs on the server via `execute` inside one `streamText` loop — no
client `onToolCall` or auto-POST. `inputSchema` only checks empty
args (`{}`); `userId` is closed over from the session, not tool
input.

```mermaid
flowchart TD
  user["User asks about their profile"]
  post["POST /api/chat"]
  auth["Auth + request parse"]
  tools["createChatTools({ userId })"]
  stream["streamText + tools"]
  validate["Validate tool-call input"]
  execute["execute runs on the server"]
  result["Tool result returns to the model"]
  answer["Assistant text streams back"]

  user --> post --> auth --> tools --> stream --> validate
  validate --> execute --> result --> answer
```

**Step-by-step:**

1. **User asks about their profile** (Client) — ChatSection /
   `useAgent.sendMessage`
2. **POST /api/chat** (Client) — `DefaultChatTransport` sends UI
   messages
3. **Auth + request parse** (Server) — `getUserId()`, then
   `ChatRequestSchema`, then `getChatSession`; 401 / 400 / 404 on failure
4. **createChatTools({ userId })** (Server) — Session `userId`
   closed over — never taken from tool args
5. **streamText + tools** (Model) — Model may emit a
   `getCurrentUser` tool call (input `{}`)
6. **Validate tool-call input** (Server) —
   `UserProfileInputSchema = z.object({})` — empty args only
7. **execute runs on the server** (Server) —
   `getCurrentUserProfile(userId)` via Prisma; dates → ISO
8. **Tool result returns to the model** (Model) — Same
   `streamText` loop; `stopWhen: stepCountIs(5)`
9. **Assistant text streams back** (Client) —
   `createUIMessageStreamResponse` → `ChatMessages`

### Client tool (`runKeyboardCommand`)

No server `execute` — only `inputSchema` (`commandId`). The model
call is streamed to the client; `useAgent` runs it via `useKeyboard`,
then `addToolOutput` + auto-POST continues the loop.

```mermaid
flowchart TD
  user["User asks for a UI action"]
  post["POST /api/chat"]
  auth["Auth + request parse"]
  tools["createChatTools registers schema only"]
  stream["Model produces tool call"]
  validate["Validate tool-call input"]
  streamOut["Stream tool call to client (no execute)"]
  onToolCall["useAgent onToolCall"]
  run["commandsById.get(commandId).run()"]
  output["addToolOutput"]
  auto["sendAutomaticallyWhen fires"]
  continue["Model continues with tool result"]

  user --> post --> auth --> tools --> stream --> validate
  validate --> streamOut --> onToolCall --> run --> output --> auto
  auto --> continue
  auto -.->|auto-continue| post
```

**Step-by-step:**

1. **User asks for a UI action** (Client) — e.g. “switch to dark
   mode” via `useAgent`
2. **POST /api/chat** (Client) — `DefaultChatTransport` sends UI
   messages
3. **Auth + request parse** (Server) — `getUserId()`, then
   `ChatRequestSchema`, then `getChatSession`
4. **createChatTools registers schema only** (Server) —
   `runKeyboardCommand` has `inputSchema`, no `execute`
5. **Model produces tool call** (Model) — Args: `{ commandId }`
   from the request-scoped enum
6. **Validate tool-call input** (Server) — dynamic
   `inputSchema` checks `commandId`
7. **Stream tool call to client (no execute)** (Server) —
   `createUIMessageStreamResponse` carries the pending tool call
8. **useAgent onToolCall** (Client) — Skip dynamic tools; handle
   `runKeyboardCommand` only
9. **commandsById.get(commandId).run()** (Client) — Browser UI
   side effect via `useKeyboard` registry
10. **addToolOutput** (Client) — `{ success: true, commandId }` or
    `output-error` + `errorText`
11. **sendAutomaticallyWhen fires** (Client) —
    `lastAssistantMessageIsCompleteWithToolCalls` → new POST
12. **Model continues with tool result** (Model) — May answer in
    text; `stopWhen: stepCountIs(5)`

## Considerations

- **Extending:**
  - Keep request shape in `ChatRequestSchema` and metadata on
    `ChatUIMessage`.
  - Add more tools under `schema/tools.ts` + `createChatTools`.
  - Debug fixtures live under `scripts/seed/data/` (for example
    `chat-session.ts`, `chat-request.json`).
