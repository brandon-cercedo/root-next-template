import { LucideMessageCircleX } from "lucide-react";

import ChatView from "@/app/dashboard/chats/_components/ChatView";
import MessageWithImage from "@/components/ui/MessageWithImage";
import { getChatSession } from "@/services/chat-session";

export default async function Chat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const chat = await getChatSession(id);
  if (!chat) {
    return (
      <MessageWithImage
        title="Chat not found"
        message="We couldn't find the chat you're looking for."
        image={
          <LucideMessageCircleX
            className="size-10 flex-none"
            strokeWidth={1.5}
          />
        }
        className="text-sm"
        titleClassName="text-lg leading-6 font-medium"
      />
    );
  }

  return <ChatView chat={chat} />;
}
