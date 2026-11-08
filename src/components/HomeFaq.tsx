import Link from "next/link";

const faqs = [
  {
    q: "How do I choose a cheap desert safari Dubai package?",
    a: "To find a cheap desert safari Dubai option, compare what is included in each tour: pickup and drop-off, dune bashing, sandboarding, meals, entertainment, and any add-ons. Prices vary by duration, vehicle type, camp inclusions, and whether the tour is shared or private, so check the full tour details before booking.",
  },
  {
    q: "What is included in an overnight desert safari?",
    a: "An overnight desert safari usually includes evening desert activities and an extended camp stay after sunset, with morning time in the desert depending on the package. Inclusions differ by tour, so review the itinerary, meals, sleeping arrangements, pickup details, and cancellation policy on the tour page.",
  },
  {
    q: "What is a red dune desert safari?",
    a: "A red dune desert safari typically refers to a desert safari experience in areas known for taller red sand dunes. Activities and locations vary by package, and may include dune bashing, sandboarding, camel rides, quad bikes, or dune buggy options. Check the specific tour listing for the exact location, duration, and inclusions.",
  },
  {
    q: "Which desert safari should I book in Dubai, Abu Dhabi, or Ras Al Khaimah?",
    a: "Choose based on your location, schedule, and preferred experience: morning desert safari, evening desert safari, private desert safari camp, quad bike, or dune buggy tours. Each listing shows available details such as duration, inclusions, and pricing where provided.",
  },
];

export default function HomeFaq() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="container" style={{ marginTop: 40, marginBottom: 10 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Desert Safari <span>FAQs</span></h2>
          <p>Common questions about Dubai desert safari packages, overnight desert safari options, and red dune desert safari experiences.</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {faqs.map((f) => (
          <details key={f.q} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", background: "#fff" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600, color: "#0f172a" }}>{f.q}</summary>
            <p style={{ margin: "10px 0 0", color: "#475569", lineHeight: 1.65 }}>{f.a}</p>
          </details>
        ))}
      </div>
      <p style={{ marginTop: 14, color: "#475569" }}>
        Browse <Link href="/tours">desert safari tours</Link> or review <Link href="/terms-and-conditions">terms</Link> and <Link href="/cancellation-refund">cancellation policy</Link> before booking.
      </p>
    </section>
  );
}
