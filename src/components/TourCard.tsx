import Link from "next/link";

export default function TourCard({ tour }: { tour: any }) {
  const img =
    tour.image_url ||
    "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800&auto=format&fit=crop";
  return (
    <Link href={`/tour/${tour.id}`} className="tour-card-link" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="tour-card">
        <img src={img} alt={tour.title || "Tour"} className="tour-card-img" />
        <div className="tour-card-body">
          <div className="tour-card-category">{tour.category || "Tour"}</div>
          <div className="tour-card-title" title={tour.title}>{tour.title}</div>
          <div className="tour-card-meta">{tour.duration || "\u00A0"}</div>
          <div className="tour-card-footer">
            <div className="tour-card-price">AED {tour.price ?? "—"}</div>
            <button type="button" className="tour-card-btn">Book now</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
