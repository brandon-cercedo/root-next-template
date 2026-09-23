import { LucideMessageCircleX } from "lucide-react";
import { redirect } from "next/navigation";

import { getUserId } from "@/actions/db/user";
import ChatView from "@/app/dashboard/chats/_components/ChatView";
import MessageWithImage from "@/components/ui/MessageWithImage";
import { paths } from "@/lib/config/paths";
import { getChatSession } from "@/services/chat-session";

export default async function Chat({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getUserId();
  if (!userId) {
    redirect(paths.auth.signIn());
  }

  const { id } = await params;
  const chat = await getChatSession({ id, userId });
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
