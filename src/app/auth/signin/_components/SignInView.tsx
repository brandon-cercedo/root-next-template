import Link from "next/link";

import BaseNavbar from "@/components/layout/navbar/BaseNavbar";
import PageContainer from "@/components/layout/PageContainer";
import SignInCard from "@/features/auth/components/SignInCard";
import { paths } from "@/lib/config/paths";

export default function SignInView() {
  return (
    <PageContainer>
      <BaseNavbar>
        <Link
          href={paths.home()}
          className="font-medium text-gray-600 hover:text-gray-400 focus:text-gray-400 focus:outline-hidden dark:text-neutral-400 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
        >
          Home
        </Link>
      </BaseNavbar>
      <div className="flex flex-1 items-center justify-center">
        <div className="mx-auto w-full max-w-md p-6">
          <SignInCard />
        </div>
      </div>
    </PageContainer>
  );
}
