"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = { title: string; image_url: string; link_url?: string | null };
const fallback: Item[] = [
  { title: "Desert Safaris", image_url: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=400&auto=format&fit=crop", link_url: "/category/desert-adventures" },
  { title: "Attractions", image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400&auto=format&fit=crop", link_url: "/category/attractions" },
  { title: "Sports Events", image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop", link_url: "/category/sports-events" },
  { title: "City Tours", image_url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=400&auto=format&fit=crop", link_url: "/category/city-tours" },
  { title: "Cruise & Boat Tours", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=400&auto=format&fit=crop", link_url: "/category/cruise-and-boat-tours" },
  { title: "Water & Theme Parks", image_url: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=400&auto=format&fit=crop", link_url: "/category/waterparks-and-theme-parks" },
];

export default function OurExperiences() {
  const [items, setItems] = useState<Item[]>(fallback);
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("experience_items").select("title,image_url,link_url,status,sort_order").eq("status", "Active").order("sort_order", { ascending: true }).order("id", { ascending: true });
      if (!error && data?.length) setItems(data as Item[]);
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
      <div className="circular-categories" style={{ display: "flex", flexWrap: "nowrap", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {items.map((it, idx) => {
          const href = it.link_url && it.link_url.startsWith("/") ? it.link_url : "/";
          const inner = (<><img src={it.image_url} alt={it.title} /><p>{it.title}</p></>);
          return it.link_url ? <Link key={idx} href={href} className="circle-cat" style={{ textDecoration: "none", color: "inherit" }}>{inner}</Link> : <div key={idx} className="circle-cat">{inner}</div>;
        })}
      </div>
    </section>
  );
}
