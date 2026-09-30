/** Minimal cookie helpers (no dependencies). Values are URI-encoded; defaults are path=/ and SameSite=Strict. */

export type CookieOptions = {
  /** Absolute expiry. Omit (and omit `maxAgeSeconds`) for a session cookie. */
  expires?: Date;
  maxAgeSeconds?: number;
  path?: string;
  sameSite?: "Strict" | "Lax" | "None";
  /** Defaults to true on HTTPS pages. */
  secure?: boolean;
};

export function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;

  for (const part of document.cookie ? document.cookie.split("; ") : []) {
    if (part.startsWith(prefix)) {
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  const { expires, maxAgeSeconds, path = "/", sameSite = "Strict", secure = window.location.protocol === "https:" } = options;
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`, `Path=${path}`, `SameSite=${sameSite}`];

  if (expires) parts.push(`Expires=${expires.toUTCString()}`);
  if (maxAgeSeconds !== undefined) parts.push(`Max-Age=${Math.floor(maxAgeSeconds)}`);
  if (secure || sameSite === "None") parts.push("Secure");

  document.cookie = parts.join("; ");
}

export function deleteCookie(name: string, path = "/") {
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Strict`;
}
