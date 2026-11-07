"use client";
import { useEffect, useState } from "react";

const slides = [
  { img: "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1600&auto=format&fit=crop", title: "Convenient door-to-door airport transfers", desc: "Enjoy a seamless pick-up and drop-off service to and from any hotel or residence in Dubai." },
  { img: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1600&auto=format&fit=crop", title: "Evening Desert Safari", desc: "Dune bashing, camel rides and BBQ dinner under the stars." },
  { img: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1600&auto=format&fit=crop", title: "Morning Desert Safari", desc: "Catch the sunrise over the dunes." },
  { img: "https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=1600&auto=format&fit=crop", title: "Dune Buggy Adventure", desc: "Thrilling off-road buggy rides." },
  { img: "https://images.unsplash.com/photo-1682687982501-1e58f81015f6?q=80&w=1600&auto=format&fit=crop", title: "Premium Desert Safari", desc: "Luxury experience with private camp." },
];

export default function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, []);
  const s = slides[i];
  return (
    <div className="container">
      <section className="hero" style={{ position: "relative" }}>
        <img src={s.img} alt={s.title} />
        <div className="hero-content">
          <h1>{s.title}</h1>
          <p>{s.desc}</p>
          <button className="btn-primary">Book now</button>
        </div>
      </section>
    </div>
  );
}
