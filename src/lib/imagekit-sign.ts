import crypto from "node:crypto";

const ENDPOINT = (process.env.IMAGEKIT_URL_ENDPOINT || "").replace(/\/$/, "");
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || "";

export function isImagekitUrl(url: string): boolean {
  return !!ENDPOINT && url.startsWith(ENDPOINT);
}

export function signImageUrl(
  url: string,
  expiresInSeconds = 300
): { url: string; expiresAt: number } {
  if (!ENDPOINT || !PRIVATE_KEY || !isImagekitUrl(url)) {
    return { url, expiresAt: 0 };
  }
  const [base] = url.split("?");
  const path = base.slice(ENDPOINT.length);
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const signature = crypto
    .createHmac("sha1", PRIVATE_KEY)
    .update(path + expiresAt)
    .digest("hex");
  return { url: `${base}?ik-t=${expiresAt}&ik-s=${signature}`, expiresAt };
}