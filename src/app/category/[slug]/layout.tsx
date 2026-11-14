import type { Metadata } from "next";
import { ReactNode } from "react";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://primedesertsafari.com").replace(/\/$/, "");

const CATS: Record<string, { name: string; description: string }> = {
  "desert-adventures": {
    name: "Desert Adventures",
    description:
      "Book desert safari Dubai, Abu Dhabi, and Ras Al Khaimah tours — morning and evening desert safaris, dune buggy rides, quad bike adventures, and private desert safari camps with hotel pickup, BBQ dinner, and live entertainment.",
  },
  attractions: {
    name: "Attractions",
    description:
      "Skip-the-line tickets and experiences at Dubai and UAE's top attractions — observation decks, theme parks, aquariums, and iconic landmarks, with instant confirmation and clear pricing.",
  },
  "city-tours": {
    name: "City Tours",
    description:
      "Explore Dubai and Abu Dhabi with guided city tours — half-day and full-day sightseeing, Burj Khalifa, mosque visits, cultural highlights, and private transfers with hotel pickup.",
  },
  "cruise-and-boat-tours": {
    name: "Cruise and Boat Tours",
    description:
      "Dhow cruises, yacht charters, speedboat tours, and sunset cruises across Dubai Marina, Dubai Creek, and Abu Dhabi — with dinner, live music, and private options available.",
  },
  "waterparks-and-theme-parks": {
    name: "Waterparks & Theme Parks",
    description:
      "Tickets and packages for Dubai and Abu Dhabi's waterparks and theme parks — Aquaventure, Wild Wadi, Yas Waterworld, Motiongate, Legoland, and more, with combo deals and transfers.",
  },
  transport: {
    name: "Transport",
    description:
      "Airport transfers, private car hire, and point-to-point transport across Dubai, Abu Dhabi, and Ras Al Khaimah — reliable drivers, fixed pricing, and meet-and-greet options.",
  },
};

function titleize(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pageTitle(name: string): string {
  return /tours?$/i.test(name.trim())
    ? `${name} in Dubai, Abu Dhabi & UAE | Prime Desert Safari`
    : `${name} Tours & Experiences in Dubai, Abu Dhabi & UAE | Prime Desert Safari`;
}

function ogTitle(name: string): string {
  return /tours?$/i.test(name.trim())
    ? `${name} in Dubai, Abu Dhabi & UAE`
    : `${name} Tours & Experiences in Dubai, Abu Dhabi & UAE`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const rawSlug = decodeURIComponent(slug);
  const s = rawSlug.toLowerCase();
  const canonicalSlug = s === "desert-safaris" ? "desert-adventures" : s;
  const cat = CATS[canonicalSlug];
  const name = cat?.name || titleize(s);
  const canonical = `/category/${canonicalSlug}`;
  const title = pageTitle(name);
  const description =
    cat?.description ||
    `Browse ${name.toLowerCase()} tours and experiences in Dubai, Abu Dhabi, and Ras Al Khaimah. Compare prices, inclusions, and availability, and book with free cancellation and instant confirmation.`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle(name),
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawSlug = decodeURIComponent(slug);
  const s = rawSlug.toLowerCase();
  const canonicalSlug = s === "desert-safaris" ? "desert-adventures" : s;
  const cat = CATS[canonicalSlug];
  const name = cat?.name || titleize(s);
  const url = `${SITE}/category/${canonicalSlug}`;
  const description =
    cat?.description ||
    `Browse ${name.toLowerCase()} tours and experiences in Dubai, Abu Dhabi, and Ras Al Khaimah.`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${name} Tours & Experiences`,
      description,
      url,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Tours", item: `${SITE}/tours` },
        { "@type": "ListItem", position: 3, name, item: url },
      ],
    },
  ];

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