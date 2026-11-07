"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [tours, setTours] = useState<any[]>([]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") ?? "";
    setQ(query);
    supabase.from("tours").select("*").ilike("title", `%${query}%`).then(({ data }) => setTours(data ?? []));
  }, []);
  return (
    <main style={{ padding: 40 }}>
      <h1>Search: {q}</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {tours.map((t) => <div key={t.id}>{t.title} — AED {t.price}</div>)}
      </div>
    </main>
  );
}
