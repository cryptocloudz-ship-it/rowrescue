import { useSyncExternalStore } from "react";

/**
 * Whether Clerk's `__client_uat` cookie says this browser has a session. Clerk sets it (unsigned, readable by
 * JavaScript) to the time of the last sign-in, or 0 after sign-out, under a suffixed name (`__client_uat_<id>`) and,
 * for older SDKs, the plain name. Like Clerk, prefer the suffixed cookie when there is one. It's only a hint for
 * what to show or load; anything that needs a verified user still asks the server, which checks the session itself.
 */
export function hasSessionCookie(cookie: string): boolean {
  const pairs = cookie.split(";").map((c) => c.trim().split("="));
  const suffixed = pairs.filter(([name]) => /^__client_uat_.+$/.test(name));
  const relevant = suffixed.length > 0 ? suffixed : pairs.filter(([name]) => name === "__client_uat");
  return relevant.some(([, value]) => Number(value) > 0);
}

const noSubscribe = () => () => {};

/** null during server render and hydration, so server and first client render match. */
export function useSessionHint(): boolean | null {
  return useSyncExternalStore(
    noSubscribe,
    () => hasSessionCookie(document.cookie),
    () => null
  );
}
