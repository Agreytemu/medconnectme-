import type { Profile } from "@/lib/types";
import { DEMO_COOKIE } from "@/lib/demo/config";

export function encodeDemoProfile(profile: Profile): string {
  return encodeURIComponent(JSON.stringify(profile));
}

export function decodeDemoProfile(raw: string | undefined | null): Profile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Profile;
    if (parsed && typeof parsed === "object" && "id" in parsed && "role" in parsed) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setDemoCookie(profile: Profile, maxAge = 86400): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=${encodeURIComponent(
    JSON.stringify(profile)
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearDemoCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DEMO_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
