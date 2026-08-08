import TypingText from "@/components/ui/TypingText";
import { getTimeOfDay } from "@/lib/utils/date";
import { composeUserDisplayName } from "@/lib/utils/db/user";
import { User } from "@/prisma/types/client";

const NAME_COLORS: Readonly<string[]> = [
  "text-indigo-600 dark:text-indigo-500",
  "text-teal-500",
  "text-blue-600 dark:text-blue-500",
  "text-yellow-500",
];

function getNameColor() {
  const index = Math.floor(Math.random() * NAME_COLORS.length);
  return NAME_COLORS[index];
}

interface GreetingMessageProps {
  user: User;
}

export default function GreetingMessage({ user }: GreetingMessageProps) {
  const timeOfDay = getTimeOfDay();
  const name = composeUserDisplayName(user);
  const nameColor = getNameColor();

  return (
    <div className="min-h-19 p-5 text-center text-3xl font-semibold">
      <TypingText
        onInit={(typewriter) => {
          typewriter
            .typeString(
              `Good ${timeOfDay} <span class="${nameColor}">${name}</span>`
            )
            .start();
        }}
        options={{
          delay: 50,
          deleteSpeed: 50,
          cursor: "",
        }}
      />
    </div>
  );
}
