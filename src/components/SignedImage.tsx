"use client";
import { useEffect, useState, type ImgHTMLAttributes } from "react";

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

const cache = new Map<string, { url: string; expiresAt: number }>();
const pending = new Map<string, Promise<string>>();

function isImagekit(url: string): boolean {
  return (
    url.startsWith("https://ik.imagekit.io/") ||
    url.startsWith("http://ik.imagekit.io/")
  );
}

async function resolveSigned(src: string): Promise<string> {
  if (!isImagekit(src)) return src;
  const now = Math.floor(Date.now() / 1000);
  const hit = cache.get(src);
  if (hit && hit.expiresAt - 30 > now) return hit.url;
  const inFlight = pending.get(src);
  if (inFlight) return inFlight;

  const task = (async () => {
    const res = await fetch(
      `/api/signed-url?src=${encodeURIComponent(src)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("sign failed");
    const data = (await res.json()) as { url: string; expiresAt: number };
    cache.set(src, data);
    return data.url;
  })();

  pending.set(src, task);
  try {
    return await task;
  } finally {
    pending.delete(src);
  }
}

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string };

export default function SignedImage({ src, alt, ...rest }: Props) {
  const [url, setUrl] = useState("");

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
    resolveSigned(src)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setUrl("");
      });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <>
      <noscript>
        <img src={src} alt={alt || ""} {...rest} />
      </noscript>
      {url ? (
        <img src={url} alt={alt} {...rest} />
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