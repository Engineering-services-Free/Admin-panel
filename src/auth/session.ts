import type { AuthUser } from "@/typings/api.typings";

export const AUTH_SESSION_CHANGED_EVENT = "auth-session-changed";

export interface StoredAuthSession {
  accessToken: string;
  expiresAt: number;
  user: AuthUser;
}

function decodeJwtSegment(segment: string): unknown {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export function getJwtExpirationTime(accessToken: string): number | null {
  const segments = accessToken.split(".");

  if (
    segments.length !== 3 ||
    !segments[0] ||
    !segments[1] ||
    !segments[2]
  ) {
    return null;
  }

  try {
    const header = decodeJwtSegment(segments[0]);
    const payload = decodeJwtSegment(segments[1]);

    if (
      typeof header !== "object" ||
      header === null ||
      !("alg" in header) ||
      typeof header.alg !== "string" ||
      header.alg === "none" ||
      typeof payload !== "object" ||
      payload === null ||
      !("exp" in payload) ||
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp)
    ) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "role" in value &&
    typeof value.role === "string"
  );
}

export function readStoredAuthSession(): StoredAuthSession | null {
  const accessToken = localStorage.getItem("accessToken");
  const storedUser = localStorage.getItem("user");

  if (!accessToken || !storedUser) {
    return null;
  }

  const expiresAt = getJwtExpirationTime(accessToken);

  if (expiresAt === null || expiresAt <= Date.now()) {
    return null;
  }

  try {
    const user: unknown = JSON.parse(storedUser);

    if (!isAuthUser(user)) {
      return null;
    }

    return { accessToken, expiresAt, user };
  } catch {
    return null;
  }
}

export function getUsableAccessToken(): string | null {
  const session = readStoredAuthSession();

  if (session) {
    return session.accessToken;
  }

  if (
    localStorage.getItem("accessToken") !== null ||
    localStorage.getItem("user") !== null
  ) {
    clearAuthSession();
  }

  return null;
}

export function notifyAuthSessionChanged(): void {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearAuthSession(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  notifyAuthSessionChanged();
}
