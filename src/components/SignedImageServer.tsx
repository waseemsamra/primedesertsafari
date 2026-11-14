import type { ImgHTMLAttributes } from "react";
import { headers } from "next/headers";
import { signImageUrl } from "@/lib/imagekit-sign";
import { buildTransform } from "@/lib/imagekit-transform";
import { isSearchBot, BOT_EXPIRY_SECONDS } from "@/lib/bot-detect";
import SignedImage from "./SignedImage";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string };

const HUMAN_EXPIRY = 3600;

export default async function SignedImageServer({ src, width, ...rest }: Props) {
  const cssWidth =
    typeof width === "number" && width > 0
      ? width
      : typeof width === "string" && /^\d+$/.test(width.trim())
        ? parseInt(width, 10)
        : 600;
  const target = Math.min(2560, Math.max(160, Math.round(cssWidth * 2)));

  const ua = (await headers()).get("user-agent") || "";
  const bot = isSearchBot(ua);
  const { url, expiresAt } = signImageUrl(
    src,
    bot ? BOT_EXPIRY_SECONDS : HUMAN_EXPIRY,
    buildTransform(target)
  );

  return (
    <SignedImage
      src={src}
      initialSrc={url}
      initialExpiresAt={expiresAt}
      width={width}
      {...rest}
    />
  );
}