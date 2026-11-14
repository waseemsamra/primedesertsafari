"use client";
import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { isImagekitUrl as isImagekit, withTransform } from "@/lib/imagekit-transform";

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const cache = new Map<string, { url: string; expiresAt: number }>();
const pending = new Map<string, Promise<string>>();

async function resolveSigned(src: string, w: number): Promise<string> {
  if (!isImagekit(src)) return src;
  const now = Math.floor(Date.now() / 1000);
  const key = `${src}|${w}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt - 30 > now) return hit.url;
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const task = (async () => {
    const res = await fetch(
      `/api/signed-url?src=${encodeURIComponent(src)}&w=${w}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("sign failed");
    const data = (await res.json()) as { url: string; expiresAt: number };
    cache.set(key, data);
    return data.url;
  })();

  pending.set(key, task);
  try {
    return await task;
  } finally {
    pending.delete(key);
  }
}

type Props = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  initialSrc?: string;
  initialExpiresAt?: number;
};

export default function SignedImage({
  src,
  alt,
  width,
  initialSrc,
  initialExpiresAt = 0,
  ...rest
}: Props) {
  const [url, setUrl] = useState(initialSrc || "");

  // Request 2x the CSS width (capped) so images stay crisp on retina
  // while avoiding full-resolution originals. Default targets card-sized images.
  const cssWidth =
    typeof width === "number" && width > 0
      ? width
      : typeof width === "string" && /^\d+$/.test(width.trim())
        ? parseInt(width, 10)
        : 600;
  const target = Math.min(2560, Math.max(160, Math.round(cssWidth * 2)));

  useEffect(() => {
    let cancelled = false;
    if (!src) {
      setUrl("");
      return;
    }
    if (!isImagekit(src)) {
      setUrl(src);
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (initialSrc && initialExpiresAt - 30 > now) {
      setUrl(initialSrc);
      return;
    }
    resolveSigned(src, target)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        // Signing failed (e.g. image hosted on a different ImageKit account):
        // fall back to a transformed raw URL so the image still renders.
        if (!cancelled) setUrl(withTransform(src, target));
      });
    return () => {
      cancelled = true;
    };
  }, [src, target, initialSrc, initialExpiresAt]);

  return (
    <>
      <noscript>
        <img src={src} alt={alt || ""} {...rest} />
      </noscript>
      {url ? (
        <img src={url} alt={alt} decoding="async" {...rest} />
      ) : (
        <img
          src={PLACEHOLDER}
          alt={alt || ""}
          {...rest}
          style={{ ...rest.style, opacity: 0 }}
        />
      )}
    </>
  );
}