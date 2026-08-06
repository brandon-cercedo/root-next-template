import { envs } from "../config/envs";

export function getFullUrl(path: `/${string}`): string {
  return new URL(path, envs.NEXT_PUBLIC_BASE_URL).toString();
}
