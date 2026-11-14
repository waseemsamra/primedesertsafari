"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SignedImage from "./SignedImage";

type Item = { title: string; image: string; href: string };

const defaults: Item[] = [
  { title: "Desert Safari Dubai", image: "https://ik.imagekit.io/piwakgkp8/royalvision1__YPgUUfoO.jpg", href: "/category/desert-adventures?location=Dubai" },
  { title: "Desert Safari Abu Dhabi", image: "https://ik.imagekit.io/piwakgkp8/evenning-safari-abu-dhabi-1_kk_LLnzLY.jpeg", href: "/category/desert-adventures?location=Abu%20Dhabi" },
  { title: "Desert Safari RAK", image: "https://ik.imagekit.io/piwakgkp8/overnight-desert-safari-ras-al-khaimah_VqB3-UFcu.webp", href: "/category/desert-adventures?location=Ras%20Al%20Khaimah" },
  { title: "Dune Buggy & ATV", image: "https://ik.imagekit.io/0dzk1cdo5/images/raptor.jpeg?updatedAt=1788523821863", href: "/tours" },
  { title: "Private Desert Safari Camp", image: "https://ik.imagekit.io/piwakgkp8/Private_Desert_Safari_Camp__2__rDH4ZaHtp.png", href: "/tours" },
];

type Row = { id: number; title: string; image_url: string; link_url?: string | null; status?: string | null };

export default function MomentsGallery({ title = "Top Desert Safari Experiences in UAE" }: { title?: string }) {
  const [items, setItems] = useState<Item[]>(defaults);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("experience_items")
        .select("id,title,image_url,link_url,status")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      if (error) return;
      const active = ((data || []) as Row[]).filter(
        (d) => d?.image_url && (!d.status || String(d.status).toLowerCase() === "active")
      );
      if (!active.length) return;
      setItems(
        active.map((d) => ({
          title: String(d.title || ""),
          image: String(d.image_url),
          href: d.link_url && d.link_url !== "/" ? d.link_url : "/tours",
        }))
      );
    })();
  }, []);

  return (
    <section className="container moments-gallery-section" style={{ marginTop: 40 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div><h2 className="slider-section-title">{title}</h2></div>
      </div>
      <div className="image-gallery moments-cards">
        {items.map((it) => (
          <Link key={it.title} href={it.href} className="moment-card" style={{ textDecoration: "none", color: "inherit" }}>
            <SignedImage src={it.image} alt={it.title} width={400} height={300} loading="lazy" className="w-full h-auto object-cover" />
            <p className="moment-card-title">{it.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}