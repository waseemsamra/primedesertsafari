import { NextRequest, NextResponse } from "next/server";
import { signImageUrl, isImagekitUrl } from "@/lib/imagekit-sign";
import { buildTransform } from "@/lib/imagekit-transform";
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const src = req.nextUrl.searchParams.get("src") || "";
  if (!src || !isImagekitUrl(src)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  const wParam = req.nextUrl.searchParams.get("w");
  let transform: string | undefined;
  if (wParam) {
    const w = Math.max(50, Math.min(2560, parseInt(wParam, 10) || 0));
    if (w) transform = buildTransform(w);
  }

  const signed = signImageUrl(src, bot ? BOT_EXPIRY_SECONDS : USER_EXPIRY_SECONDS, transform);
  return NextResponse.json(signed, {
    headers: { "Cache-Control": "no-store" },
  });
}