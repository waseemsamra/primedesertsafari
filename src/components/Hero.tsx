"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import SignedImage from "./SignedImage";

type Slide = { img: string; title: string; desc: string };

export default function Hero() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("title,description,image_url,status,sort_order")
        .eq("status", "Active")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });
      if (!error && data?.length) {
        setSlides(data.map((r: any) => ({
          img: r.image_url,
          title: r.title || "",
          desc: r.description || "",
        })));
      } else {
        setSlides([]);
      }
      setLoaded(true);
      setI(0);
    })();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!loaded) return <div className="container"><section className="hero" style={{ minHeight: 320, background: "#0f172a" }} /></div>;
  if (!slides.length) return null;

  const s = slides[i % slides.length];
  if (!s) return null;
  return (
    <div className="container">
      <section className="hero" style={{ position: "relative", minHeight: 400 }}>
        <SignedImage src={s.img} alt={s.title || "Hero slide"} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="hero-content">
          {s.title ? <h1>{s.title}</h1> : null}
          {s.desc ? <p>{s.desc}</p> : null}
        </div>
      </section>
    </div>
  );
}
