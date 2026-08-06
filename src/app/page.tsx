import { redirect } from "next/navigation";

import { getUser } from "@/actions/db/user";
import LandingView from "@/features/marketing/components/LandingView";
import { paths } from "@/lib/config/paths";

export default async function Landing() {
  const user = await getUser();
  if (user) {
    redirect(paths.dashboard.home());
  }

  return <LandingView />;
}
