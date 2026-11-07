"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TourCard, { type TourCardTour } from "./TourCard";

export default function TrendingAttractions() {
  const [tours, setTours] = useState<TourCardTour[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tours")
        .select("id,title,slug,category,location,price,duration,rating,status,badge,image_url,gallery,is_trending")
        .eq("status", "Active")
        .eq("is_trending", true)
        .order("id", { ascending: false })
        .limit(12);
      if (!error && data) setTours(data as TourCardTour[]);
      setLoaded(true);
    })();
  }, []);

  if (loaded && tours.length === 0) return null;
  if (!loaded) return <section className="container"><div style={{ marginTop: 60, color: "#888", fontSize: 14 }}>Loading trending attractions...</div></section>;

  return (
    <section className="container">
      <div className="section-header">
        <div>
          <h2>Trending <span>Attractions</span></h2>
          <p>There is no place quite like the UAE</p>
        </div>
      </div>
      <div className="card-grid">
        {tours.map((t) => <TourCard key={t.id} tour={t} />)}
      </div>
      <div className="view-all-container">
        <Link href="/tours" className="btn-view-all" style={{ display: "inline-block", textDecoration: "none" }}>View more</Link>
      </div>
    </section>
  );
}
