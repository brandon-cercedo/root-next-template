"use client";

import {
  lastAssistantMessageIsCompleteWithToolCalls,
  type ChatOnToolCallCallback,
} from "ai";

import { useChatbot } from "@/hooks/use-chatbot";
import { useKeyboard } from "@/hooks/use-keyboard";

import { KeyboardCommandInput } from "../schema/tools";

import type { ChatUIMessage } from "@/types/chat";

type AgentToolCall = Parameters<
  ChatOnToolCallCallback<ChatUIMessage>
>[0]["toolCall"];

type AgentChatbot = Pick<ReturnType<typeof useChatbot>, "addToolOutput">;

type UseAgentOptions = {
  initialMessages?: ChatUIMessage[];
};

export function useAgent({ initialMessages }: UseAgentOptions = {}) {
  const { commandsById } = useKeyboard();

  function runKeyboardCommand(toolCall: AgentToolCall, chatbot: AgentChatbot) {
    const commandId = (toolCall.input as KeyboardCommandInput).commandId;
    if (!commandId) {
      chatbot.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: "Missing commandId for tool call.",
      });
      return;
    }

    const command = commandsById.get(commandId);
    if (!command) {
      chatbot.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: `Command "${commandId}" is not available (missing from registry or not permitted).`,
      });
      return;
    }

    try {
      command.run();
      chatbot.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: { success: true, commandId },
      });
    } catch {
      chatbot.addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText: `Failed to run command "${commandId}".`,
      });
    }
  }

  const chatbot = useChatbot({
    initialMessages,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    body: () => ({
      keyboardCommandIds: Array.from(commandsById.keys()),
    }),
    onToolCall: async ({ toolCall }) => {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === "runKeyboardCommand") {
        runKeyboardCommand(toolCall, chatbot);
      }
    },
  });

  return chatbot;
}
