import { NextRequest, NextResponse } from "next/server";
import { signImageUrl, isImagekitUrl } from "@/lib/imagekit-sign";
import { isSearchBot, BOT_EXPIRY_SECONDS, USER_EXPIRY_SECONDS } from "@/lib/bot-detect";

const ALLOWED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "primedesertsafari.com",
  "www.primedesertsafari.com",
]);

function requestHost(req: NextRequest): string | null {
  const raw = req.headers.get("origin") || req.headers.get("referer");
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const bot = isSearchBot(req.headers.get("user-agent"));
  const host = requestHost(req);

  if (!bot && (!host || !ALLOWED_HOSTS.has(host))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const src = req.nextUrl.searchParams.get("src") || "";
  if (!src || !isImagekitUrl(src)) {
    return new NextResponse("Invalid image", { status: 400 });
  }

  const signed = signImageUrl(src, bot ? BOT_EXPIRY_SECONDS : USER_EXPIRY_SECONDS);
  return NextResponse.redirect(signed.url, 302);
}