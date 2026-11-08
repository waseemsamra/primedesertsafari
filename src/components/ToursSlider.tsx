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
  title = "Top Desert Safari Experiences in UAE",
  location = null,
  viewAllHref = "/tours",
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
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <h2 className="slider-section-title">{title}</h2>
        <div className="slider-section-actions section-head-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href={viewAllHref} className="slider-view-all section-view-all-top">View All</Link>
          <button type="button" className="arrow-btn section-arrow" onClick={() => scroll(-320)} aria-label="Scroll left"><i className="fas fa-chevron-left"></i></button>
          <button type="button" className="arrow-btn section-arrow" onClick={() => scroll(320)} aria-label="Scroll right"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>
      <div ref={ref} className="tours-slider-track" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "12px 0", scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
      <div className="section-view-all-bottom"><Link href={viewAllHref} className="btn-view-all">View all</Link></div>
    </section>
  );
}
