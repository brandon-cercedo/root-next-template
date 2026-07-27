import Image from "next/image";

export default function AppLogo() {
  return (
    <div className="text-dark flex flex-none items-center gap-1 text-xl font-bold select-none focus:opacity-80 focus:outline-hidden dark:text-white">
      <Image
        src="/icon-light.svg"
        alt="Logo light"
        width={28}
        height={28}
        className="size-7 p-0.5 dark:hidden"
      />
      <Image
        src="/icon-dark.svg"
        alt="Logo dark"
        width={28}
        height={28}
        className="hidden size-7 p-0.5 dark:block"
      />
      <span>Root</span>
    </div>
  );
}
