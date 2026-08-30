"use server";

import { encryptOverrides } from "flags";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { getUser } from "@/actions/db/user";
import { isPreview, isProduction } from "@/lib/config/envs";
import {
  FLAG_OVERRIDE_COOKIE_NAME,
  FLAG_OVERRIDE_COOKIE_PATH,
  PartialFlagOverrides,
} from "@/lib/flags/config";
import { sanitizeFlagOverrides } from "@/lib/flags/utils";
import { isAdmin } from "@/lib/utils/db/user";

export async function deleteFlagOverrides() {
  const user = await getUser();
  if (!user) {
    console.error("[deleteFlagOverrides] User not authenticated");
    return;
  }

  if (!isAdmin(user)) {
    console.error(
      "[deleteFlagOverrides] User not allowed to manage overrides"
    );
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete({
    name: FLAG_OVERRIDE_COOKIE_NAME,
    path: FLAG_OVERRIDE_COOKIE_PATH,
  });

  revalidatePath("/dashboard");
}

export async function updateFlagOverrides(overrides: PartialFlagOverrides) {
  const user = await getUser();
  if (!user) {
    console.error("[updateFlagOverrides] User not authenticated");
    return;
  }

  if (!isAdmin(user)) {
    console.error(
      "[updateFlagOverrides] User not allowed to manage overrides"
    );
    return;
  }

  const nextOverrides = sanitizeFlagOverrides(overrides);
  if (Object.keys(nextOverrides).length === 0) {
    return;
  }

  const payload = await encryptOverrides(nextOverrides);
  const cookieStore = await cookies();

  cookieStore.set(FLAG_OVERRIDE_COOKIE_NAME, payload, {
    httpOnly: true,
    path: FLAG_OVERRIDE_COOKIE_PATH,
    sameSite: "lax",
    secure: isProduction() || isPreview(),
  });

  revalidatePath("/dashboard");
}
