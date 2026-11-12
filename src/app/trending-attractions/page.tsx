"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TourCard, { type TourCardTour } from "@/components/TourCard";
import SignedImage from "@/components/SignedImage";

type Tour = any;

export default function TrendingAttractionsPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("status", "Active")
        .eq("is_trending", true)
        .order("id", { ascending: false })
        .limit(200);
      if (!cancelled) {
        if (!error && data) setTours(data as Tour[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const hero = "https://ik.imagekit.io/piwakgkp8/Dubai_at_Golden_Hour__Iconic_Attractions_6kvriTNqY.png";

  return (
    <main>
      <section className="container" style={{ position: "relative", overflow: "hidden", borderRadius: 20, marginTop: 20, background: "#fff", height: 340, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SignedImage src={hero} alt="Trending Attractions Dubai" width={1300} height={340} sizes="(max-width: 768px) 100vw, 1300px" style={{ objectFit: "cover", width: "100%", height: "100%", objectPosition: "center", display: "block" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.1))" }} />
        <div style={{ position: "absolute", bottom: 24, left: 24, right: 24, color: "#fff" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Trending Attractions</h1>
          <p style={{ margin: 6, fontSize: 16, opacity: 0.95, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>Most booked experiences across Dubai, Abu Dhabi & Ras Al Khaimah</p>
        </div>
      </section>

      <div className="container" style={{ padding: "40px 20px" }}>
        {loading ? (
          <div style={{ color: "#64748b", padding: 40 }}>Loading trending attractions...</div>
        ) : tours.length === 0 ? (
          <div style={{ color: "#64748b", padding: 40 }}>No trending attractions found.</div>
        ) : (
          <>
            <div style={{ marginBottom: 24, fontSize: 14, color: "#64748b" }}>{tours.length} trending attraction{(tours.length !== 1 ? "s" : "")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {tours.map((t) => <TourCard key={t.id} tour={t} />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
