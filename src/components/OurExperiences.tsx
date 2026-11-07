"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Category = { id: number; name: string; image_url?: string | null };

const slugify = (s?: string | null) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const fallback: Category[] = [
  { id: 1, name: "Desert Safaris", image_url: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=400&auto=format&fit=crop" },
  { id: 2, name: "Attractions", image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400&auto=format&fit=crop" },
  { id: 3, name: "Sports Events", image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop" },
  { id: 4, name: "City Tours", image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=400&auto=format&fit=crop" },
  { id: 5, name: "Cruise & Boat Tours", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop" },
  { id: 6, name: "Water & Theme Parks", image_url: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=400&auto=format&fit=crop" },
];

export default function OurExperiences() {
  const [items, setItems] = useState<Category[]>(fallback);
  useEffect(() => {
    (async () => {
      let { data, error } = await supabase.from("categories").select("id,name,image_url").order("name");
      if (error && /image_url|column/i.test(error.message || "")) {
        const r = await supabase.from("categories").select("id,name").order("name");
        data = r.data as any; error = r.error as any;
      }
      if (!error && Array.isArray(data) && data.length) {
        const clean = (data as Category[]).filter((c) => c && c.name);
        if (clean.length) setItems(clean);
      }
    })();
  }, []);

  return (
    <section className="container">
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Our <span>Experiences</span></h2>
          <p>Come adventure with us - from award-winning desert safaris to world-famous attractions.</p>
        </div>
      </div>
      <div className="circular-categories" style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {items.filter((it) => it?.name).map((it) => {
          const name = String(it.name || "");
          const href = `/category/${encodeURIComponent(slugify(name) || name)}`;
          return (
            <Link key={it.id ?? name} href={href} className="circle-cat" style={{ textDecoration: "none", color: "inherit" }}>
              {it.image_url ? <img src={it.image_url} alt={name} /> : <div style={{ width: "100%", aspectRatio: "1/1", borderRadius: "50%", background: "#e2e8f0", marginBottom: 15 }} />}
              <p>{name}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
