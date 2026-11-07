import Link from "next/link";
export default function TourCard({ tour }: { tour: any }) {
  const img = tour.image_url || "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800&auto=format&fit=crop";
  return (
    <Link href={`/tour/${tour.id}`} style={{ textDecoration: "none", color: "inherit" }}><div style={{ border: "1px solid #e0e0e0", borderRadius: 12, overflow: "hidden" }}>
      <img src={img} alt={tour.title} style={{ width: "100%", height: 200, objectFit: "cover" }} />
      <div style={{ padding: 15 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase" }}>{tour.category}</div>
        <div style={{ fontSize: 16, fontWeight: 600, margin: "6px 0" }}>{tour.title}</div>
        <div style={{ fontSize: 13, color: "#666" }}>{tour.duration}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTop: "1px solid #e0e0e0", paddingTop: 12 }}>
          <div style={{ fontWeight: 600 }}>AED {tour.price}</div>
          <button style={{ background: "#f6a821", color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", cursor: "pointer" }}>Book now</button>
        </div>
      </div>
    </div></Link>
  );
}
