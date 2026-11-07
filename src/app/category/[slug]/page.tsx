"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

type Tour = any;

const heroImages: Record<string, string> = {
  "desert-adventures": "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1600&auto=format&fit=crop",
  "attractions": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop",
  "sports-events": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop",
  "city-tours": "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1600&auto=format&fit=crop",
  "cruise-and-boat-tours": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1600&auto=format&fit=crop",
  "waterparks-and-theme-parks": "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=1600&auto=format&fit=crop",
  "transport": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=1600&auto=format&fit=crop",
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
      "sports-events": "Sports Events",
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
        if (s === "sports-events") return cat.includes("sport") || cat.includes("event");
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
      <section className="container" style={{ position: "relative", height: 320, overflow: "hidden", borderRadius: 20, marginTop: 20, background: "#fff" }}>
        <img src={hero} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: "#fff", background: "rgba(0,0,0,0.4)", padding: 20, textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>{title}{locationFilter ? ` in ${locationFilter}` : ""}</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>Explore our curated experiences.</p>
        </div>
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
