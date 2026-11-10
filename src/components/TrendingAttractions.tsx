"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TourCard, { type TourCardTour } from "./TourCard";

export default function TrendingAttractions() {
  const [tours, setTours] = useState<TourCardTour[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tours")
        .select("id,title,slug,category,location,price,duration,rating,status,badge,image_url,gallery,is_trending")
        .eq("status", "Active")
        .eq("is_trending", true)
        .order("id", { ascending: false })
        .limit(60);
      if (!cancelled) {
        if (!error && data) setTours(data as TourCardTour[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const scroll = (d: number) => ref.current?.scrollBy({ left: d, behavior: "smooth" });

  if (loading) {
    return (
      <section className="container" style={{ marginTop: 40 }}>
        <div style={{ color: "#64748b", padding: "24px 0", fontSize: 14 }}>Loading trending attractions...</div>
      </section>
    );
  }
  if (tours.length === 0) return null;

  return (
    <section className="container" style={{ marginTop: 40 }}>
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <div>
          <h2 className="slider-section-title">Trending <span>Attractions</span></h2>
          <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>There is no place quite like the UAE</p>
        </div>
        <div className="slider-section-actions section-head-actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/trending-attractions" className="slider-view-all section-view-all-top">View All</Link>
          <button type="button" className="arrow-btn section-arrow" onClick={() => scroll(-320)} aria-label="Scroll left"><i className="fas fa-chevron-left"></i></button>
          <button type="button" className="arrow-btn section-arrow" onClick={() => scroll(320)} aria-label="Scroll right"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>
      <div ref={ref} className="tours-slider-track" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "12px 0", scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {tours.map((t) => (
          <div key={t.id} style={{ flex: "0 0 25%", minWidth: 260 }}>
            <TourCard tour={t} />
          </div>
        ))}
      </div>
      <div className="section-view-all-bottom">
        <Link href="/trending-attractions" className="btn-view-all">View all</Link>
      </div>
    </section>
  );
}
