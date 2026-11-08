"use client";
import Link from "next/link";

type Item = { title: string; image: string; href: string };

const defaults: Item[] = [
  { title: "Desert Safari Dubai", image: "https://ik.imagekit.io/piwakgkp8/royalvision1__YPgUUfoO.jpg", href: "/category/desert-adventures?location=Dubai" },
  { title: "Desert Safari Abu Dhabi", image: "https://ik.imagekit.io/piwakgkp8/evenning-safari-abu-dhabi-1_kk_LLnzLY.jpeg", href: "/category/desert-adventures?location=Abu%20Dhabi" },
  { title: "Desert Safari RAK", image: "https://ik.imagekit.io/piwakgkp8/overnight-desert-safari-ras-al-khaimah_VqB3-UFcu.webp", href: "/category/desert-adventures?location=Ras%20Al%20Khaimah" },
  { title: "Dune Buggy & ATV", image: "https://ik.imagekit.io/0dzk1cdo5/images/raptor.jpeg?updatedAt=1788523821863", href: "/tours" },
  { title: "Private Desert Safari Camp", image: "https://ik.imagekit.io/piwakgkp8/Private_Desert_Safari_Camp__2__rDH4ZaHtp.png", href: "/tours" },
];

export default function MomentsGallery({ title = "Top Desert safari in UAE" }: { title?: string }) {
  return (
    <section className="container moments-gallery-section" style={{ marginTop: 40 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div><h2 className="slider-section-title">{title}</h2></div>
      </div>
      <div className="image-gallery moments-cards">
        {defaults.map((it) => (
          <Link key={it.title} href={it.href} className="moment-card" style={{ textDecoration: "none", color: "inherit" }}>
            <img src={it.image} alt={it.title} />
            <p className="moment-card-title">{it.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
