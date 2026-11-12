import Link from "next/link";
import SignedImage from "./SignedImage";

export type TourCardTour = {
  id: number | string;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  location?: string | null;
  price?: number | string | null;
  duration?: string | null;
  rating?: string | null;
  status?: string | null;
  badge?: string | null;
  image_url?: string | null;
  gallery?: unknown;
  is_trending?: boolean | null;
  [key: string]: unknown;
};

export default function TourCard({ tour }: { tour: TourCardTour }) {
  const img =
    tour.image_url ||
    "https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=800&auto=format&fit=crop";
  const href = `/tour/${tour.slug || tour.id}`;
  return (
    <Link href={href} className="tour-card-link" style={{ textDecoration: "none", color: "inherit" }}>
      <div className="tour-card">
        <SignedImage src={img} alt={tour.title || "Tour"} className="tour-card-img" />
        <div className="tour-card-body">
          <div className="tour-card-category">{tour.category || "Tour"}</div>
          <div className="tour-card-title" title={tour.title || undefined}>{tour.title}</div>
          <div className="tour-card-meta">{tour.duration || "\u00A0"}</div>
          <div className="tour-card-footer">
            <div className="tour-card-price">AED {tour.price ?? "—"}</div>
            <button type="button" className="tour-card-btn" onClick={(e) => { e.stopPropagation(); window.location.href = href; }}>Book now</button>
          </div>
        </div>
      </div>
    </Link>
  );
}
