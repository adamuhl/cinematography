import "server-only";

import { createHash, createHmac, pbkdf2Sync, timingSafeEqual } from "node:crypto";

const sessionLifetimeSeconds = 60 * 60 * 24 * 7;

function sessionSecret() {
  return process.env.REEL_SESSION_SECRET || "local-development-reel-secret-change-before-deploying";
}

export function reelCookieName(slug: string) {
  return `reel_${createHash("sha256").update(slug).digest("hex").slice(0, 12)}`;
}

export function createReelSession(slug: string) {
  const expires = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds;
  const payload = `${slug}.${expires}`;
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return { value: `${expires}.${signature}`, maxAge: sessionLifetimeSeconds };
}

export function verifyReelSession(slug: string, value?: string) {
  if (!value) return false;
  const [expiresText, signature] = value.split(".");
  const expires = Number(expiresText);
  if (!Number.isInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !signature) return false;

  const expected = createHmac("sha256", sessionSecret()).update(`${slug}.${expires}`).digest("hex");
  const actualBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function passwordsMatch(password: string, expectedHash: string) {
  const [algorithm, iterationsText, salt, storedHash] = expectedHash.split(":");
  if (algorithm !== "pbkdf2" || !iterationsText || !salt || !storedHash) return false;
  const iterations = Number(iterationsText);
  if (!Number.isInteger(iterations) || iterations < 100_000) return false;
  const actualBuffer = pbkdf2Sync(password.trim(), Buffer.from(salt, "hex"), iterations, 32, "sha256");
  const expectedBuffer = Buffer.from(storedHash, "hex");
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}
