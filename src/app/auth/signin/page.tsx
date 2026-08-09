import { redirect } from "next/navigation";

import { getUser } from "@/actions/db/user";
import SignInView from "@/app/auth/signin/_components/SignInView";
import { paths } from "@/lib/config/paths";

export default async function SignIn() {
  const user = await getUser();
  if (user) {
    redirect(paths.dashboard.home());
  }
  return <SignInView />;
}
