import TourCard from "@/components/TourCard";
import SignedImageServer from "@/components/SignedImageServer";
import { getAllTours } from "@/lib/tours-server";

const heroImages: Record<string, string> = {
  "desert-adventures": "https://ik.imagekit.io/piwakgkp8/UAE_Desert_Adventures_Await_Om684eaXx.png?updatedAt=1794172190357",
  attractions: "https://ik.imagekit.io/piwakgkp8/Dubai_at_Golden_Hour__Iconic_Attractions_6kvriTNqY.png",
  "city-tours": "https://ik.imagekit.io/piwakgkp8/Dubai_City_Tour__Discover_Iconic_Dubai_J6W-SdcNW.png",
  "cruise-and-boat-tours": "https://ik.imagekit.io/piwakgkp8/Dubai_Sunset_Cruise_Adventures_zN0Ffc5l7.png",
  "waterparks-and-theme-parks": "https://ik.imagekit.io/piwakgkp8/UAE_Waterparks_and_Theme_Parks_tMC9Dp_WA.png",
  transport: "https://ik.imagekit.io/piwakgkp8/Dubai_Transport_Services_Banner_WUZ7IvyA1.png",
};
const defaultHero = "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1600&auto=format&fit=crop";

const TITLE_MAP: Record<string, string> = {
  "desert-adventures": "Desert Adventures",
  attractions: "Attractions",
  "city-tours": "City Tours",
  "cruise-and-boat-tours": "Cruise and Boat Tours",
  "waterparks-and-theme-parks": "Waterparks & Theme Parks",
  transport: "Transport",
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ location?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const rawSlug = decodeURIComponent(slug);
  const s = rawSlug.toLowerCase() === "desert-safaris" ? "desert-adventures" : rawSlug.toLowerCase();
  const locationFilter = sp.location;

  const title =
    TITLE_MAP[s] || rawSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const rows = await getAllTours(200);

  let filtered = rows.filter((t) => {
    const cat = String(t.category || "").toLowerCase();
    const catSlug = slugify(cat);
    if (s === "desert-adventures") return cat.includes("desert") || catSlug.includes("desert");
    if (s === "waterparks-and-theme-parks")
      return cat.includes("water") || cat.includes("theme") || catSlug.includes("waterpark");
    if (s === "cruise-and-boat-tours") return cat.includes("cruise") || cat.includes("boat");
    return catSlug === s || cat.includes(s.replace(/-/g, " ")) || slugify(title).toLowerCase() === catSlug;
  });
  if (filtered.length === 0) {
    filtered = rows.filter((t) => String(t.category || "").toLowerCase().includes(s.replace(/-/g, " ")));
  }
  if (locationFilter) {
    const loc = locationFilter.toLowerCase();
    filtered = filtered.filter((t) => String(t.location || "").toLowerCase() === loc);
  }

  const hero = heroImages[s] || defaultHero;
  const heroFit = s === "desert-adventures" ? "cover" : "contain";

  return (
    <main>
      <section
        className="container"
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          marginTop: 20,
          background: "#fff",
          height: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <SignedImageServer
          src={hero}
          alt={title}
          width={1300}
          height={420}
          sizes="(max-width: 768px) 100vw, 1300px"
          style={{ objectFit: heroFit, width: "100%", height: heroFit === "cover" ? "100%" : "auto", objectPosition: "center", display: "block" }}
        />
      </section>
      <div className="container" style={{ padding: "40px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            No tours found for this category{locationFilter ? ` in ${locationFilter}` : ""}.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}