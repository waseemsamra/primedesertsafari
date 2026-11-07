"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

type Tour = any;

type Props = {
  title?: string;
  location?: string | null; // null/undefined = all
  viewAllHref?: string;
  limit?: number;
};

export default function ToursSlider({
  title = "Top Desert safari in UAE",
  location = null,
  viewAllHref = "/category/Desert%20Safaris",
  limit = 12,
}: Props) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let q = supabase.from("tours").select("*").limit(limit);
      // Prefer explicit location column; fall back client-side if needed
      if (location) q = q.or(`location.eq.${location},category.ilike.%${location}%`);
      const { data } = await q;
      if (cancelled) return;
      let rows = (data ?? []) as Tour[];
      if (location) {
        const loc = location.toLowerCase();
        rows = rows.filter((t) =>
          String(t.location || "").toLowerCase() === loc ||
          String(t.category || "").toLowerCase().includes(loc)
        );
        // If DB filter missed (e.g. location column missing), fetch broader set and filter
        if (rows.length === 0) {
          const { data: all } = await supabase.from("tours").select("*").limit(50);
          rows = ((all ?? []) as Tour[]).filter((t) =>
            String(t.location || "").toLowerCase() === loc ||
            String(t.category || "").toLowerCase().includes(loc)
          ).slice(0, limit);
        }
      }
      setTours(rows);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [location, limit]);

  const scroll = (d: number) => ref.current?.scrollBy({ left: d, behavior: "smooth" });

  return (
    <section className="container" style={{ marginTop: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <h2 style={{ fontSize: 32, fontWeight: 700 }}>{title}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href={viewAllHref}>View All</Link>
          <button onClick={() => scroll(-320)} style={{ borderRadius: "50%", width: 36, height: 36, cursor: "pointer" }} aria-label="Scroll left">‹</button>
          <button onClick={() => scroll(320)} style={{ borderRadius: "50%", width: 36, height: 36, cursor: "pointer" }} aria-label="Scroll right">›</button>
        </div>
      </div>
      <div ref={ref} style={{ display: "flex", gap: 16, overflowX: "auto", padding: "12px 0", scrollBehavior: "smooth" }}>
        {loading ? (
          <div style={{ color: "#64748b", padding: "12px 0" }}>Loading tours...</div>
        ) : tours.length === 0 ? (
          <div style={{ color: "#64748b", padding: "12px 0" }}>No tours found{location ? ` for ${location}` : ""}.</div>
        ) : (
          tours.map((t) => (
            <div key={t.id} style={{ flex: "0 0 25%", minWidth: 260 }}>
              <TourCard tour={t} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}
