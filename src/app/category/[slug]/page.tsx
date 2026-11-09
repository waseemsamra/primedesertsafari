"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

type Tour = any;

const heroImages: Record<string, string> = {
  "desert-adventures": "https://ik.imagekit.io/piwakgkp8/UAE_Desert_Adventures_Await_Om684eaXx.png",
  "attractions": "https://ik.imagekit.io/piwakgkp8/Dubai_at_Golden_Hour__Iconic_Attractions_6kvriTNqY.png",
  "city-tours": "https://ik.imagekit.io/piwakgkp8/Dubai_City_Tour__Discover_Iconic_Dubai_J6W-SdcNW.png",
  "cruise-and-boat-tours": "https://ik.imagekit.io/piwakgkp8/Dubai_Sunset_Cruise_Adventures_zN0Ffc5l7.png",
  "waterparks-and-theme-parks": "https://ik.imagekit.io/piwakgkp8/UAE_Waterparks_and_Theme_Parks_tMC9Dp_WA.png",
  "transport": "https://ik.imagekit.io/piwakgkp8/Dubai_Transport_Services_Banner_WUZ7IvyA1.png",
};
const defaultHero = "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1600&auto=format&fit=crop";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function CategoryInner() {
  const params = useParams<{ slug: string }>();
  const search = useSearchParams();
  const rawSlug = decodeURIComponent(params?.slug || "");
  const locationFilter = search.get("location");
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const title = useMemo(() => {
    const map: Record<string, string> = {
      "desert-adventures": "Desert Adventures",
      "attractions": "Attractions",
      "city-tours": "City Tours",
      "cruise-and-boat-tours": "Cruise and Boat Tours",
      "waterparks-and-theme-parks": "Waterparks & Theme Parks",
      "transport": "Transport",
    };
    return map[rawSlug.toLowerCase()] || rawSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }, [rawSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("tours").select("*").order("id", { ascending: false }).limit(200);
      if (cancelled) return;
      const rows = (data ?? []) as Tour[];
      const s = rawSlug.toLowerCase();
      let filtered = rows.filter((t) => {
        const cat = String(t.category || "").toLowerCase();
        const catSlug = slugify(cat);
        if (s === "desert-adventures") return cat.includes("desert") || catSlug.includes("desert");
        if (s === "waterparks-and-theme-parks") return cat.includes("water") || cat.includes("theme") || catSlug.includes("waterpark");
        if (s === "cruise-and-boat-tours") return cat.includes("cruise") || cat.includes("boat");
        return catSlug === s || cat.includes(s.replace(/-/g, " ")) || slugify(title).toLowerCase() === catSlug;
      });
      if (filtered.length === 0) {
        // fallback: try exact-ish category name match
        filtered = rows.filter((t) => String(t.category || "").toLowerCase().includes(s.replace(/-/g, " ")));
      }
      if (locationFilter) {
        const loc = locationFilter.toLowerCase();
        filtered = filtered.filter((t) => String(t.location || "").toLowerCase() === loc);
      }
      setTours(filtered);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [rawSlug, title, locationFilter]);

  const hero = heroImages[rawSlug.toLowerCase()] || defaultHero;

  return (
    <main>
      <section className="container" style={{ position: "relative", overflow: "hidden", borderRadius: 20, marginTop: 20, background: "#fff", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Image src={hero} alt={title} width={1300} height={420} sizes="(max-width: 768px) 100vw, 1300px" style={{ objectFit: "contain", width: "100%", height: "auto", objectPosition: "center", display: "block" }} />
      </section>
      <div className="container" style={{ padding: "40px 20px" }}>
        {loading ? (
          <div style={{ color: "#64748b" }}>Loading...</div>
        ) : tours.length === 0 ? (
          <div style={{ color: "#64748b" }}>No tours found for this category{locationFilter ? ` in ${locationFilter}` : ""}.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {tours.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return <Suspense fallback={<div className="container" style={{ padding: 40 }}>Loading...</div>}><CategoryInner /></Suspense>;
}
