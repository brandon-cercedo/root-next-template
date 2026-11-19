# RNT-52: Edit, Retry, Fork message actions

## Context

Today a user can't revise a message, re-roll a reply, or branch a chat. Their
only option is to start over. RNT-52 adds hover actions on each message:
**Edit** (user), **Retry** (assistant) and **Fork** (both). It also unblocks
RNT-73 and RNT-83. These decisions were settled in the idea-refine session:

- Edit happens inline in the bubble. Enter or the send arrow saves; Esc or a
  click outside always cancels. Saving unchanged text just exits edit mode.
- Edit and retry are destructive: everything after the message is dropped.
- Retry works on every assistant message, not only the last one.
- While a message is being edited, Edit/Retry/Fork are disabled on all
  messages and `ChatInput` is disabled. Copy stays enabled.
- A single JSON field, `ChatSession.actions`, stores the last fork, edit and
  retry, each as `{ …, timestamp }`. `parentId` lives inside it, not in a
  column. The only reader is the "Forked from" link, which looks the parent
  up in `user.chatSessions` and hides itself when the parent is gone.
- Fork copies the prefix from the DB on the server and stores
  `actions.fork`. The title becomes `"<title> (fork)"`.
  - From an assistant message: the prefix includes it, and the input starts
    empty.
  - From a user message: the prefix stops before it, and its text is
    prefilled in `ChatInput`.
  - From the first user message: no session is created. A new chat opens
    with the draft prefilled.
  - From the page, it opens in the page. From the side panel, it opens in the
    side panel.
- `ChatCreatedAt` shows `… · Forked from <parent title>` as a link.
- A small note in `TimestampTooltip`'s style goes after the actions row:
  "Edited here · 5m ago" (right-aligned) under the last edited user
  message, and "Retried here · 5m ago" (left-aligned) under the last
  retried reply.
  Hovering it shows the full date and time.
- On archived chats, Edit, Retry and Fork are hidden. Copy and the timestamp
  stay.
- "Worked for Xs" is fixed for retries. The route measures from
  `max(actions.retry.timestamp, last user message timestamp)`.
- Out of scope: keyboard shortcuts and palette actions, version history, an
  undo toast, server-side truncation (tracked in RNT-106), and React
  component tests.

## Approach

The client drives edit and retry through one shared **resend** path:

1. Persist the new message array, plus the action, with
   `handleUpdateChatMessage`, the same pattern as `handleSend`.
2. Call `setMessages(next)`.
3. Call `sendMessage()` with no arguments. The SDK then sends the current
   messages as `submit-message`; this is confirmed in
   `node_modules/ai/dist/index.js:17705`.

This gives one code path for both actions. `actions.retry` is in the DB
before POST 1. The route already loads `chat` on every request, including
the automatic POSTs after client tools, so every request reads the same
retry timestamp.

`lastMessageId` is the id of the last message kept; everything after it was
deleted. For an edit, it's the edited message, which keeps its id: only its
text and `timestamp` change. For a retry, it's the user message before the
retried reply. For a fork, it's the last message of the copied prefix. A
later edit or retry on an earlier message can delete the
message `lastMessageId` points to. That's acceptable because `actions`
holds only the latest fork, edit and retry, and nothing reads `edit`.

## Phases

| Phase | Scope | Ships on its own? |
| -- | -- | -- |
| **P0** | Schema change and migration: `ChatSession.actions` plus its JSON type. | Yes. The column is nullable and nothing reads it yet. |
| **P1** | Feature changes: validation, utils, server, client state, UI, tests. | Needs P0. |

## P0: Schema changes (migration)

`prisma/schema.prisma`, on `model ChatSession`:

```prisma
  /// [ChatSessionActions]
  actions       Json?
```

Then run `pnpm migrate --name add_chat_session_actions`. This regenerates
the types and `prisma/utils/fake-data.ts`.

`prisma/types.ts`, inside `namespace PrismaJson`:

```ts
    type ChatSessionAction = {
      lastMessageId: string; // last message kept; later ones were deleted
      timestamp: string; // ISO
    };

    type ChatSessionActions = {
      fork?: ChatSessionAction & { parentId: string };
      edit?: ChatSessionAction;
      retry?: ChatSessionAction;
    };
```

**P0 verification:**
- `pnpm migrate --name add_chat_session_actions` creates the migration
  under `prisma/migrations/`, and it only adds a nullable `actions` column.
- `pnpm type:check`, `pnpm lint` and `pnpm test` pass, with no feature code
  changed.
- `prisma/utils/fake-data.ts` is regenerated and the existing fixtures still
  work.

## P1: Feature changes

### 1. Validation: `src/features/chat/schema/chat.ts`

```ts
// AI SDK `generateId` makes 16-char ids for user and assistant messages
const MessageIdSchema = z.string().min(16);

// ChatUIMessageSchema: id: MessageIdSchema (was z.string())

export const ForkChatSessionSchema = z.object({
  parentId: z.uuidv7(),
  messageId: MessageIdSchema,
});

const ChatMessageActionSchema = z.object({
  type: z.enum(["edit", "retry"]),
  lastMessageId: MessageIdSchema,
  timestamp: z.string(),
});

export const UpdateChatMessageSchema = z.object({
  id: z.uuidv7(),
  status: z.enum(ChatSessionStatus),
  messages: z.array(ChatUIMessageSchema),
  action: ChatMessageActionSchema.optional(),
});
```

The client sets the action `timestamp`, the same clock as message
timestamps, so `getCurrentRetry` compares like with like. Every message id
field uses `MessageIdSchema`. Test fixtures with short message ids (for
example in `route.test.ts` and `actions.update.test.ts`) need 16-char ids.

### 2. Utils: `src/features/chat/utils.ts`

```ts
const FORK_SUFFIX = " (fork)";

// Same lodash `truncate` options as `getChatTitle`: whole words only
export function getForkTitle(title: string) {
  const base = truncate(title, {
    length: TITLE_MAX_LENGTH - FORK_SUFFIX.length,
    omission: "",
    separator: " ",
  });
  return `${base.trimEnd()}${FORK_SUFFIX}`;
}

/**
 * Messages a fork starts with.
 * - Assistant: keeps the message, so the fork continues after it.
 * - User: drops the message and returns its text as a draft to reword.
 */
export function getForkMessages({
  messages,
  messageId,
}: {
  messages: ChatUIMessage[];
  messageId: string;
}) {
  const index = messages.findIndex((message) => message.id === messageId);
  if (index === -1) {
    return null;
  }

  const message = messages[index];
  if (message.role === "assistant") {
    return { messages: messages.slice(0, index + 1) };
  }

  return {
    messages: messages.slice(0, index),
    draft: getMessageText(message),
  };
}

/**
 * The stored retry, if it still applies to this user message.
 * - Same id: the retry was on this message.
 * - Not older: an edit keeps the id but gets a newer timestamp, which
 *   replaces the retry.
 */
export function getCurrentRetry({
  actions,
  userMessage,
}: {
  actions?: PrismaJson.ChatSessionActions | null;
  userMessage?: ChatUIMessage;
}) {
  const retry = actions?.retry;
  if (!retry || !userMessage || retry.lastMessageId !== userMessage.id) {
    return undefined;
  }

  const sentAt = new Date(userMessage.metadata.timestamp).getTime();
  const retriedAt = new Date(retry.timestamp).getTime();
  return retriedAt >= sentAt ? retry : undefined;
}
```

The route's duration and the "Retried" note both use `getCurrentRetry`, so
they always agree.

### 3. Server

`src/features/chat/actions.ts`: `handleUpdateChatMessage` merges the action
into the stored `actions`, so an edit or retry keeps the existing `fork`:

```ts
  const { id, status, action } = parsed.data;
  const messages = parsed.data.messages as ChatUIMessage[];
  const data: Prisma.ChatSessionUpdateInput = {
    status,
    messages,
    lastMessageAt: getLastMessageAt(messages),
  };

  if (action) {
    const chat = await getChatSession({ id, userId });
    if (!chat) {
      console.error(`[handleUpdateChatMessage] Chat not found: ${id}`);
      return { success: false, message: "Chat not found" };
    }

    const { type, ...entry } = action;
    data.actions = { ...chat.actions, [type]: entry };
  }
```

The existing `try { await updateChatSession(...) }` block then uses `data`.
A missing chat returns a failure, like every other error in `actions.ts`,
so `resend` shows its error and leaves the messages untouched.

`handleForkChatSession`, following `toggleArchivedChatSession`:

```ts
export async function handleForkChatSession(input: {
  parentId: string;
  messageId: string;
}) {
  const user = await getUser();
  if (!user) {
    console.error("[handleForkChatSession] User not authenticated");
    return { success: false, message: "Unauthorized" };
  }

  const parsed = ForkChatSessionSchema.safeParse(input);
  if (!parsed.success) {
    console.error("[handleForkChatSession] Invalid data", parsed.error);
    return { success: false, message: "Invalid fork data" };
  }

  const { parentId, messageId } = parsed.data;
  const parent = await getChatSession({ id: parentId, userId: user.id });
  if (!parent || parent.isArchived) {
    return { success: false, message: "Chat not available" };
  }

  const fork = getForkMessages({
    messages: parent.messages as ChatUIMessage[],
    messageId,
  });
  if (!fork || fork.messages.length === 0) {
    return { success: false, message: "Nothing to fork" };
  }

  // `id` comes from the schema default: @default(uuid(7))
  let chatId: string;
  try {
    const chat = await createChatSession({
      title: getForkTitle(parent.title),
      userId: user.id,
      messages: fork.messages,
      status: "ready",
      lastMessageAt: getLastMessageAt(fork.messages),
      actions: {
        fork: {
          parentId,
          lastMessageId: fork.messages[fork.messages.length - 1].id,
          timestamp: new Date().toISOString(),
        },
      },
    });
    chatId = chat.id;
  } catch (error) {
    console.error("[handleForkChatSession] Failed to create", error);
    return { success: false, message: "Failed to fork chat" };
  }

  revalidatePath(paths.dashboard.home(), "layout");

  return { success: true, id: chatId, draft: fork.draft };
}
```

`src/app/api/chat/route.ts`: `getInputAt` takes the stored actions, and
`POST` passes `chat.actions` through `getOutputMetadata`:

```ts
function getInputAt({
  messages,
  actions,
}: {
  messages: ChatUIMessage[];
  actions: PrismaJson.ChatSessionActions | null;
}) {
  const userMessage = messages.findLast((message) => message.role === "user");
  const retry = getCurrentRetry({ actions, userMessage });
  const timestamp = retry?.timestamp ?? userMessage?.metadata?.timestamp;
  return timestamp ? new Date(timestamp) : undefined;
}
```

`getCurrentRetry` covers both safeguards: the `lastMessageId` match, and an
edit after a retry winning because its timestamp is newer.

### 4. Client state

`src/features/chat/hooks/use-agent.ts`: also return
`setMessages: chat.setMessages`.

`src/features/chat/hooks/use-chat-session.tsx`. The draft is handed across
navigation here and never put in the URL:

```ts
export type ChatDraft = {
  chatId?: string; // undefined = a new, unsaved chat
  variant: "page" | "sidebar";
  text: string;
};

// in the context type
draft?: ChatDraft;
setDraft: (draft?: ChatDraft) => void;

// in the provider
const [draft, setDraft] = useState<ChatDraft>();
```

New file `src/features/chat/hooks/use-message-actions.ts` keeps `ChatSection`
under 300 lines:

```ts
export function useMessageActions(options: UseMessageActionsOptions) {
  const { chatId, messages, variant, setMessages, sendMessage } = options;
  const router = useRouter();
  const { openChat, setDraft } = useChatSession();
  const [editingId, setEditingId] = useState<string>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (id?: string) => {
    if (variant === "sidebar") {
      openChat(id);
      return;
    }
    router.push(id ? paths.dashboard.chat(id) : paths.dashboard.chats());
  };

  const resend = async ({
    messages: next,
    type,
    lastMessageId,
  }: {
    messages: ChatUIMessage[];
    type: "edit" | "retry";
    lastMessageId: string;
  }) => {
    setError(null);
    setIsPending(true);
    const result = await handleUpdateChatMessage({
      id: chatId,
      status: "submitted",
      messages: next,
      action: { type, lastMessageId, timestamp: new Date().toISOString() },
    });
    setIsPending(false);
    if (!result.success) {
      setError("Failed to save chat. Please try again.");
      return false;
    }
    setMessages(next);
    void sendMessage();
    return true;
  };

  const edit = async ({
    messageId,
    text,
  }: {
    messageId: string;
    text: string;
  }) => {
    const index = messages.findIndex((message) => message.id === messageId);
    if (index === -1) {
      setEditingId(undefined);
      return;
    }

    const trimmed = text.trim();
    // Empty: nothing to send, so stay in edit mode
    if (!trimmed) {
      return;
    }

    const isUnchanged = trimmed === getMessageText(messages[index]);
    if (isUnchanged) {
      setEditingId(undefined);
      return;
    }

    const message = { ...composeUserMessage(trimmed), id: messageId };
    const isSaved = await resend({
      messages: [...messages.slice(0, index), message],
      type: "edit",
      lastMessageId: messageId,
    });
    // On failure the editor stays open, so the rewrite isn't lost
    if (isSaved) {
      setEditingId(undefined);
    }
  };

  const retry = async (messageId: string) => {
    const index = messages.findIndex((message) => message.id === messageId);
    const prefix = messages.slice(0, index);
    const userMessage = prefix.at(-1);
    if (index === -1 || userMessage?.role !== "user") {
      return;
    }

    await resend({
      messages: prefix,
      type: "retry",
      lastMessageId: userMessage.id,
    });
  };

  const fork = async (messageId: string) => {
    const forkMessages = getForkMessages({ messages, messageId });
    if (!forkMessages) {
      return;
    }

    // First user message: nothing to copy, so open a new chat with the draft
    if (forkMessages.messages.length === 0) {
      setDraft({ variant, text: forkMessages.draft ?? "" });
      open();
      return;
    }

    setIsPending(true);
    const result = await handleForkChatSession({
      parentId: chatId,
      messageId,
    });
    setIsPending(false);
    if (!result.success || !result.id) {
      setError("Failed to fork chat. Please try again.");
      return;
    }
    if (result.draft) {
      setDraft({ chatId: result.id, variant, text: result.draft });
    }
    open(result.id);
  };

  return {
    editingId,
    isPending,
    error,
    startEdit: setEditingId,
    cancelEdit: () => setEditingId(undefined),
    edit,
    retry,
    fork,
  };
}
```

`UseMessageActionsOptions` is
`{ chatId, messages, variant, setMessages, sendMessage }`.

### 5. UI

New file `src/features/chat/components/MessageEditor.tsx`:

```tsx
type MessageEditorProps = {
  text: string;
  onSave: (text: string) => void;
  onCancel: () => void;
};

export default function MessageEditor({
  text,
  onSave,
  onCancel,
}: MessageEditorProps) {
  const [value, setValue] = useState(text);
  const formRef = useRef<HTMLFormElement>(null);

  // A pointer listener, not onBlur: switching tabs must not cancel the edit.
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const isInside = formRef.current?.contains(event.target as Node);
      if (isInside) {
        return;
      }
      onCancel();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onCancel]);

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        onSave(value);
      }}
      className="flex w-full flex-col gap-2 rounded-2xl border ..."
    >
      <TextareaAutoHeight
        autoFocus
        value={value}
        rows={1}
        aria-label="Edit message"
        onFocus={(event) => {
          const end = event.currentTarget.value.length;
          event.currentTarget.setSelectionRange(end, end);
        }}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
            return;
          }
          if (event.key !== "Enter" || event.shiftKey) {
            return;
          }
          event.preventDefault();
          onSave(value);
        }}
        className="max-h-106 min-h-8 w-full resize-none ..."
      />
      <button
        type="submit"
        aria-label="Save and resend"
        className="ms-auto inline-flex size-8 ..."
      >
        <LucideArrowUp className="size-4" />
      </button>
    </form>
  );
}
```

The textarea and button classes are copied from `ChatInput.tsx`.

`src/features/chat/components/MessageActions.tsx`:

```tsx
type MessageActionsProps = {
  role: UIMessage["role"];
  text: string;
  metadata?: ChatMessageMetadata;
  isDisabled?: boolean;
  onEdit?: () => void;
  onRetry?: () => void;
  onFork?: () => void;
};

type ActionButtonInfo = {
  label: string;
  description: string;
  icon: ReactNode;
};

const ACTION_BUTTONS = {
  fork: {
    label: "Fork chat",
    description:
      "Start a new chat from this message. This chat stays as it is.",
    icon: <LucideGitBranch className="size-3.5" />,
  },
  retry: {
    label: "Retry",
    description:
      "Generate a new reply. This reply and every message after it will " +
      "be deleted.",
    icon: <LucideRefreshCw className="size-3.5" />,
  },
  edit: {
    label: "Edit message",
    description:
      "Change this message and resend it. Every message after it will be " +
      "deleted.",
    icon: <LucidePencil className="size-3.5" />,
  },
} satisfies Record<string, ActionButtonInfo>;

function ActionTooltipContent({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex max-w-56 flex-col gap-1">
      <span className="font-medium">{label}</span>
      <span className="text-[11px] text-gray-500 dark:text-neutral-400">
        {description}
      </span>
    </div>
  );
}

type ActionButtonProps = ActionButtonInfo & {
  isDisabled?: boolean;
  onClick: () => void;
};

function ActionButton({
  label,
  description,
  icon,
  isDisabled,
  onClick,
}: ActionButtonProps) {
  return (
    <Tooltip
      content={
        <ActionTooltipContent label={label} description={description} />
      }
    >
      <button
        type="button"
        aria-label={label}
        disabled={isDisabled}
        onClick={onClick}
        className="inline-flex size-6 items-center justify-center rounded-md
          hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-50
          dark:hover:bg-neutral-800"
      >
        {icon}
      </button>
    </Tooltip>
  );
}

// inside MessageActions. Order: fork, retry, edit, copy, timestamp
{onFork && (
  <ActionButton
    label={ACTION_BUTTONS.fork.label}
    description={ACTION_BUTTONS.fork.description}
    icon={ACTION_BUTTONS.fork.icon}
    isDisabled={isDisabled}
    onClick={onFork}
  />
)}
{onRetry && (
  <ActionButton
    label={ACTION_BUTTONS.retry.label}
    description={ACTION_BUTTONS.retry.description}
    icon={ACTION_BUTTONS.retry.icon}
    isDisabled={isDisabled}
    onClick={onRetry}
  />
)}
{onEdit && (
  <ActionButton
    label={ACTION_BUTTONS.edit.label}
    description={ACTION_BUTTONS.edit.description}
    icon={ACTION_BUTTONS.edit.icon}
    isDisabled={isDisabled}
    onClick={onEdit}
  />
)}
<Clipboard … />
{metadata && <TimestampTooltip metadata={metadata} role={role} />}
```

The tooltip layout matches `TimestampTooltip`: a main line plus a muted
11px line. `aria-label` is the short `label`; the `description` is only in
the tooltip.

New file `src/features/chat/components/MessageActionAt.tsx`. It mirrors
`TimestampTooltip` in `MessageActions.tsx`: a relative time from
`humanizeDate` (for example "Edited here · 5m ago"), with the full date and
time in a `Tooltip`. It aligns with its message: right for an edited user
message, left for a retried reply:

```tsx
const MESSAGE_ACTION_AT = {
  edit: { text: "Edited", className: "self-end" },
  retry: { text: "Retried", className: "self-start" },
} as const;

type MessageActionAtProps = {
  type: keyof typeof MESSAGE_ACTION_AT;
  timestamp: string;
};

export default function MessageActionAt({
  type,
  timestamp,
}: MessageActionAtProps) {
  const { text, className } = MESSAGE_ACTION_AT[type];
  const fullTimestamp = moment(timestamp).format("MMM D, YYYY h:mm A");

  return (
    <Tooltip content={fullTimestamp} className={className}>
      <span className="text-xs text-gray-500 select-none dark:text-neutral-400">
        {`${text} here · ${humanizeDate(timestamp, "xs")}`}
      </span>
    </Tooltip>
  );
}
```

`humanizeDate(timestamp, "xs")` uses the `en-xs` locale in
`src/lib/utils/date.ts`, so the note reads "Edited here · 5m ago". The
alignment class goes on the `Tooltip` root, and there's no wrapper `div`.

`src/features/chat/components/ChatMessages.tsx`. `ChatMessages` receives
the `useMessageActions` return value as `actions`, `isArchived`, and
`chatActions` (the stored `chat.actions`). It passes both `messages` and
`chatActions` to `ChatMessage`, so each message works out its own notes:

```tsx
// in ChatMessages, inside messages.map(…)
<ChatMessage
  …
  messages={messages}
  chatActions={chatActions}
/>
```

```tsx
// in ChatMessage
const edit = chatActions?.edit;
const isEdited = edit?.lastMessageId === message.id;

// A retry points at the user message before the reply it replaced
const retriedIndex = messages.findIndex(
  (item) => item.id === chatActions?.retry?.lastMessageId
);
const retry = getCurrentRetry({
  actions: chatActions,
  userMessage: messages[retriedIndex],
});
const isRetried =
  retriedIndex !== -1 && messages[retriedIndex + 1]?.id === message.id;

const isEditing = actions.editingId === message.id;
const isDisabled =
  isChatWorking(status) || actions.editingId != null || actions.isPending;
const isUser = message.role === "user";
// Archived: hide Edit, Retry and Fork. Copy and the timestamp always render.
const isActive = !isArchived;

{isEditing ? (
  <MessageEditor
    text={text}
    onSave={(next) => actions.edit({ messageId: message.id, text: next })}
    onCancel={actions.cancelEdit}
  />
) : (
  /* existing bubble */
)}

{!isAnimating && !isEditing && (
  <MessageActions
    role={message.role}
    text={text}
    metadata={metadata}
    isDisabled={isDisabled}
    onFork={isActive ? () => actions.fork(message.id) : undefined}
    onRetry={isActive && !isUser ? () => actions.retry(message.id) : undefined}
    onEdit={isActive && isUser ? () => actions.startEdit(message.id) : undefined}
  />
)}

{/* Placed after the actions row; hidden while streaming or editing */}
{!isAnimating && !isEditing && isEdited && edit && (
  <MessageActionAt type="edit" timestamp={edit.timestamp} />
)}
{!isAnimating && !isEditing && isRetried && retry && (
  <MessageActionAt type="retry" timestamp={retry.timestamp} />
)}
```

`actions` holds only the latest edit and retry, so at most one "Edited" and
one "Retried" note show per chat.

While editing, the bubble wrapper drops `max-w-4/5` and uses `w-full`.
Hoisting the `onSave` and `onCancel` handlers would keep them stable for the
editor effect.

`src/features/chat/components/ChatSection.tsx`:

```tsx
const { draft, setDraft } = useChatSession();
const [initialInput] = useState(() => {
  const isMatch = draft?.variant === variant && draft.chatId === chatId;
  return isMatch ? draft.text : undefined;
});

useEffect(() => {
  if (!initialInput) {
    return;
  }
  setDraft(undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- consume once
}, []);

const actions = useMessageActions({
  chatId: id,
  messages,
  variant,
  setMessages,
  sendMessage: () => sendMessage(),
});
const isEditing = actions.editingId != null;
const error = saveError ?? actions.error ?? agentError?.message;

<ChatCreatedAt chat={chat} variant={variant} />
<ChatMessages
  messages={messages}
  status={status}
  actions={actions}
  chatActions={chat?.actions}
  isArchived={isArchived}
/>
<ChatInput
  defaultValue={initialInput}
  disabled={isLoading || actions.isPending || isArchived || isEditing}
  …
/>
```

`src/features/chat/components/ChatInput.tsx`: add the prop
`defaultValue?: string` and initialize with
`useState(defaultValue ?? "")`.

`src/features/chat/components/ChatCreatedAt.tsx`. `user.chatSessions` comes
from `listChatSessions`, which includes archived chats. A deleted parent is
simply not found, so the link hides:

```tsx
export default function ChatCreatedAt({ chat, variant }: Props) {
  const { user } = useUser();
  const { openChat } = useChatSession();
  if (!chat) {
    return null;
  }

  const parentId = chat.actions?.fork?.parentId;
  const parent = user.chatSessions.find((session) => session.id === parentId);

  return (
    <div className="py-2.5 text-center text-xs text-gray-500 ...">
      {moment(chat.createdAt).format("MMM D [at] h:mm A")}
      {parent && (
        <Fragment>
          {" · Forked from "}
          {variant === "sidebar" ? (
            <button
              type="button"
              className="underline"
              onClick={() => openChat(parent.id)}
            >
              {parent.title}
            </button>
          ) : (
            <Link
              href={paths.dashboard.chat(parent.id)}
              className="underline"
            >
              {parent.title}
            </Link>
          )}
        </Fragment>
      )}
    </div>
  );
}
```

### 6. Tests (logic only, no React component tests)
- `features/chat/__tests__/utils.test.ts`:
  - `getForkMessages` for assistant, user, first user and unknown id.
  - `getForkTitle` adds the suffix, stays within `TITLE_MAX_LENGTH`, and
    never cuts a word in half.
  - `getCurrentRetry`: returns the retry when the id matches and it isn't
    older than the message; returns `undefined` for no retry, a different
    id, or a later edit of the same message.
- New `features/chat/__tests__/actions.fork.test.ts`, mocked like
  `actions.archive.test.ts`:
  - unauthorized, invalid input (including a `messageId` under 16 chars),
    missing or archived parent, empty prefix
  - a successful fork creates the expected row (title, `status`,
    `actions.fork` with `parentId`, `lastMessageId` set to the prefix's last
    message, and `timestamp`), returns the created
    row's `id`, and calls revalidate
- `features/chat/__tests__/actions.update.test.ts`: with an `action`, the
  update merges it into the stored `actions` and keeps `fork`; with an
  `action` and a missing chat, it fails without updating; without one,
  `actions` is untouched.
- `app/api/chat/__tests__/route.test.ts`: the duration uses
  `actions.retry.timestamp` when its `lastMessageId` is the last user message
  and it's later. It uses the user message timestamp when the ids differ or
  the message is newer.
- New `features/chat/hooks/__tests__/use-message-actions.test.ts`:
  - edit persists with `action: edit` and `lastMessageId`, then
    `setMessages` and `sendMessage()`, then exits edit mode
  - edit with unchanged text exits without saving; empty text stays in edit
    mode; a failed save keeps the editor open
  - retry trims the messages and persists `action: retry` with the
    preceding user message id
  - fork routes by variant and sets the draft; first-message fork skips the
    server
  - a persist or fork failure sets the error
- `features/chat/hooks/__tests__/use-chat-session.test.tsx`: draft set and
  clear.

### 7. P1 verification
1. Work on the branch `brandon-cercedo/rnt-52-add-edit-retry-fork-actions`,
   with P0 applied.
2. Run `pnpm type:check`, `pnpm lint` and `pnpm test`. Run `pnpm test:all`
   before the PR.
3. Check in the browser with `preview_start next-dev` on a chat with three or
   more exchanges, on both the page and the side panel:
   - **Edit** the second user message: later messages are dropped, the reply
     streams, and the edit survives a reload. `actions.edit` is saved. While
     editing, the other actions and `ChatInput` are disabled. Esc,
     click-outside and unchanged Enter all restore the original.
   - **Retry** an old reply: everything after it is dropped, `actions.retry`
     is saved, and the new "Worked for" shows a few seconds. Repeat with a
     prompt that triggers a client tool (`showPet`).
   - **Notes**: after an edit, "Edited here · 1s ago" shows
     right-aligned under that user message. After a retry, "Retried here ·
     1s ago" shows left-aligned under the new reply. Hovering either
     shows the full date and time. Editing that user message afterwards
     removes the "Retried" note.
   - **Fork an assistant message**: the "(fork)" chat opens in the same
     surface, with the prefix and "Forked from" linking back.
   - **Fork a user message**: the input is prefilled.
   - **Fork the first message**: a new chat opens with the draft.
   - **Side-panel fork race:** check that the fork appears without flashing
     the greeting. This relies on `revalidatePath` refreshing
     `user.chatSessions` before `openChat` runs.
   - **Archived chat**: no Edit, Retry or Fork buttons, but Copy still
     works.
   - **While streaming**: the actions are disabled.
   - **Delete a parent**: the child's "Forked from" link disappears.
