export const TOKEN_KEY = "cmc_auth_token";

function decodeBase64Url(value: string) {
  const paddedValue = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (paddedValue.length % 4)) % 4;
  const padded = `${paddedValue}${"=".repeat(paddingLength)}`;
  return atob(padded);
}

function readTokenPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function isTokenExpired(token: string) {
  const payload = readTokenPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}
