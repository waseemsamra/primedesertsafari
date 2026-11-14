import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTour, getRelatedTours } from "@/lib/tours-server";
import { signImageUrl } from "@/lib/imagekit-sign";
import { buildTransform } from "@/lib/imagekit-transform";
import { isSearchBot, BOT_EXPIRY_SECONDS } from "@/lib/bot-detect";
import TourDetailClient from "./TourDetailClient";

const placeholder =
  "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200&auto=format&fit=crop";

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTour(id);
  if (!tour) notFound();
  const related = await getRelatedTours(tour.id, 4);

  const gallery = Array.isArray(tour.gallery) ? tour.gallery.filter(Boolean) : [];
  const imgs = gallery.length ? gallery : tour.image_url ? [tour.image_url] : [placeholder];
  const mainImg = imgs[0] || placeholder;

  const ua = (await headers()).get("user-agent") || "";
  const { url: heroSrc, expiresAt: heroExpiresAt } = signImageUrl(
    mainImg,
    isSearchBot(ua) ? BOT_EXPIRY_SECONDS : 3600,
    buildTransform(1600)
  );

  return (
    <TourDetailClient
      tour={tour}
      related={related}
      heroSrc={heroSrc}
      heroExpiresAt={heroExpiresAt}
    />
  );
}