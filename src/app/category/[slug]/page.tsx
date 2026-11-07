"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

export default function CategoryPage() {
  const [name, setName] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  useEffect(() => {
    const slug = decodeURIComponent(window.location.pathname.split("/").pop() || "");
    setName(slug);
    supabase.from("tours").select("*").eq("category", slug).then(({ data }) => setTours(data ?? []));
  }, []);
  return (
    <main>
      <section className="container" style={{ position: "relative", height: 300, overflow: "hidden", borderRadius: 20, marginTop: 20, background: "#fff" }}>
        <img src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1600&auto=format&fit=crop" alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 700, background: "rgba(0,0,0,0.4)" }}>{name}</div>
      </section>
      <div className="container" style={{ padding: 40 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {tours.map((t) => <TourCard key={t.id} tour={t} />)}
        </div>
      </div>
    </main>
  );
}
