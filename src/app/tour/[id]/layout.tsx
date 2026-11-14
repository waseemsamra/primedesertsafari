import type { Metadata } from "next";
import { ReactNode } from "react";
import { getTour, type TourRecord } from "@/lib/tours-server";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://primedesertsafari.com").replace(/\/$/, "");

function firstImage(t: TourRecord): string | undefined {
  if (t.og_image) return t.og_image;
  if (t.image_url) return t.image_url;
  const g = Array.isArray(t.gallery) ? t.gallery.filter(Boolean) : [];
  return g[0];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tour = await getTour(id);

  if (!tour) {
    return {
      title: "Tour Details",
      description: "Browse desert safari and tour experiences across the UAE.",
      alternates: { canonical: `/tour/${id}` },
    };
  }

  const name = tour.title || "Tour";
  const canonical = `/tour/${tour.slug || tour.id}`;
  const title = tour.meta_title || `${name} | Prime Desert Safari`;
  const description =
    tour.meta_description ||
    tour.short_description ||
    `Book ${name} with Prime Desert Safari — clear inclusions, pricing, pickup details, and availability across Dubai, Abu Dhabi, and Ras Al Khaimah.`;
  const image = firstImage(tour);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function TourLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTour(id);

  let jsonLd: Record<string, unknown>[] = [];

  if (tour) {
    const name = tour.title || "Tour";
    const canonical = `${SITE}/tour/${tour.slug || tour.id}`;
    const image = firstImage(tour);
    const available = !tour.status || String(tour.status).toLowerCase() === "active";

    const offers =
      tour.price != null && !Number.isNaN(Number(tour.price))
        ? {
            "@type": "Offer",
            price: Number(tour.price),
            priceCurrency: "AED",
            availability: available
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: canonical,
          }
        : undefined;

    jsonLd = [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name,
        description: tour.short_description || undefined,
        image: image ? [image] : undefined,
        category: tour.category || undefined,
        url: canonical,
        ...(offers ? { offers } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Tours", item: `${SITE}/tours` },
          { "@type": "ListItem", position: 3, name, item: canonical },
        ],
      },
    ];
  }

  return (
    <>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      {children}
    </>
  );
}