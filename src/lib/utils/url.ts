import { envs } from "../config/envs";

export function getFullUrl(path: `/${string}`): string {
  const baseUrl = envs.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("Base URL is not set");
  }

  return new URL(path, baseUrl).toString();
}
