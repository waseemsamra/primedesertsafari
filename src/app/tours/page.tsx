"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import TourCard from "@/components/TourCard";

type Tour = any;

function ToursInner() {
  const searchParams = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [price, setPrice] = useState(searchParams.get("price") || ""); // "", "0-200", "200-500", "500-1000", "1000+"

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [tRes, cRes, lRes] = await Promise.all([
        supabase.from("tours").select("*").order("id", { ascending: false }).limit(500),
        supabase.from("categories").select("name").order("name"),
        supabase.from("locations").select("name").order("name"),
      ]);
      if (cancelled) return;
      const rows = (tRes.data ?? []) as Tour[];
      setTours(rows);
      const cNames = (cRes.data ?? []).map((x: any) => x.name).filter(Boolean) as string[];
      const lNames = (lRes.data ?? []).map((x: any) => x.name).filter(Boolean) as string[];
      setCategories(cNames.length ? cNames : Array.from(new Set(rows.map((t) => t.category).filter(Boolean))).sort());
      setLocations(lNames.length ? lNames : Array.from(new Set(rows.map((t) => t.location).filter(Boolean))).sort());
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return tours.filter((t) => {
      if (category && String(t.category || "").toLowerCase() !== category.toLowerCase()) return false;
      if (location && String(t.location || "").toLowerCase() !== location.toLowerCase()) return false;
      const p = Number(t.price);
      if (price && Number.isFinite(p)) {
        if (price === "0-200" && !(p >= 0 && p <= 200)) return false;
        if (price === "200-500" && !(p > 200 && p <= 500)) return false;
        if (price === "500-1000" && !(p > 500 && p <= 1000)) return false;
        if (price === "1000+" && !(p > 1000)) return false;
      } else if (price && !Number.isFinite(p)) {
        return false;
      }
      return true;
    });
  }, [tours, category, location, price]);

  const clear = () => { setCategory(""); setLocation(""); setPrice(""); };

  return (
    <main>
      <section className="container" style={{ position: "relative", height: 320, overflow: "hidden", borderRadius: 20, marginTop: 20, background: "#fff" }}>
        <img src="https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1600&auto=format&fit=crop" alt="All Tours" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, color: "#fff", background: "rgba(0,0,0,0.4)", padding: 20, textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>All Tours</h1>
          <p style={{ margin: 0, opacity: 0.95 }}>Find the perfect desert safari and experience across the UAE.</p>
        </div>
      </section>

      <section className="container" style={{ padding: "24px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff" }}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Location</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff" }}>
              <option value="">All Locations</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Price (AED)</label>
            <select value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 10, background: "#fff" }}>
              <option value="">Any Price</option>
              <option value="0-200">0 - 200</option>
              <option value="200-500">200 - 500</option>
              <option value="500-1000">500 - 1000</option>
              <option value="1000+">1000+</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
            <button type="button" onClick={clear} style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 10, background: "#f8fafc", cursor: "pointer", fontWeight: 600 }}>Clear Filters</button>
          </div>
        </div>
        <div style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>
          {loading ? "Loading tours..." : `${filtered.length} tour${filtered.length === 1 ? "" : "s"} found`}
        </div>
      </section>

      <div className="container" style={{ padding: "20px 20px 40px" }}>
        {loading ? (
          <div style={{ color: "#64748b" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "#64748b", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>No tours match the selected filters.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map((t) => <TourCard key={t.id} tour={t} />)}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ToursPage() {
  return <Suspense fallback={<div className="container" style={{ padding: 40 }}>Loading...</div>}><ToursInner /></Suspense>;
}
