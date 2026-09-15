import "server-only";

import { openai } from "@ai-sdk/openai";
import {
  generateText,
  NoSuchToolError,
  type ToolCallRepairFunction,
  type ToolSet,
} from "ai";

import { CHAT_MODEL } from "@/features/chat/config";

export function createRepairToolCall() {
  const repairToolCall: ToolCallRepairFunction<ToolSet> = async ({
    toolCall,
    tools,
    error,
    messages,
    instructions,
  }) => {
    if (NoSuchToolError.isInstance(error)) {
      return null;
    }

    console.warn(
      "[createRepairToolCall] repairing tool call",
      toolCall.toolName,
      error.message
    );

    const result = await generateText({
      model: openai(CHAT_MODEL),
      instructions,
      messages: [
        ...messages,
        {
          role: "assistant",
          content: [
            {
              type: "tool-call",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              input: toolCall.input,
            },
          ],
        },
        {
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              output: {
                type: "error-text",
                value: error.message,
              },
            },
          ],
        },
      ],
      tools,
    });

    const repaired = result.toolCalls.find((call) => {
      return call.toolName === toolCall.toolName;
    });
    if (!repaired) {
      return null;
    }

    return {
      type: "tool-call",
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName,
      input: JSON.stringify(repaired.input),
    };
  };

  return repairToolCall;
}
