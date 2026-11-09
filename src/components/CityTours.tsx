"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

export default function CityTours() {
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from("tours")
          .select("*")
          .order("id", { ascending: false })
          .limit(200);
        if (cancelled) return;
        const rows = (data ?? []) as any[];
        const city = rows.filter((t) =>
          String(t.category || "").toLowerCase().includes("city")
        ).slice(0, 10);
        setTours(city);
      } catch {
        setTours([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="container" style={{ marginTop: 40 }}>
        <div className="section-header" style={{ marginBottom: 12 }}>
          <div><h2 className="slider-section-title">Top City Tours</h2></div>
        </div>
        <div style={{ color: "#64748b", padding: "20px 0" }}>Loading city tours...</div>
      </section>
    );
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <section className="container" style={{ marginTop: 40 }}>
      <div className="section-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <h2 className="slider-section-title">Top City Tours</h2>
        <Link href="/category/city-tours" className="slider-view-all section-view-all-top">View All City Tours</Link>
      </div>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", padding: "12px 0", scrollBehavior: "smooth", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {tours.map((t) => (
          <div key={t.id} style={{ flex: "0 0 25%", minWidth: 260 }}>
            <TourCard tour={t} />
          </div>
        ))}
      </div>
    </section>
  );
}
