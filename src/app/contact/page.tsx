import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Prime Desert Safari for tour inquiries, bookings, changes, cancellations, and business details.",
  alternates: { canonical: "/contact" },
};

const PHONE = "+971 50 133 2442";
const EMAIL = "bookings@primedesertsafari.com";
const WHATSAPP = "https://wa.me/971501332442";

export default function ContactPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>Contact Prime Desert Safari</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>For tour inquiries, availability, booking changes, or policy questions, contact us using the details below.</p>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}>
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Phone</h2>
          <p><a href={`tel:${PHONE.replace(/\s+/g, "")}`}>{PHONE}</a></p>
        </section>
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>WhatsApp</h2>
          <p><a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></p>
        </section>
        <section style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 18 }}>
          <h2 style={{ marginTop: 0 }}>Email</h2>
          <p><a href={`mailto:${EMAIL}`}>{EMAIL}</a></p>
        </section>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2>Before you book</h2>
        <ul>
          <li>Check the tour page for inclusions, exclusions, duration, pickup information, age limits, and price details.</li>
          <li>Review our <a href="/terms-and-conditions">Terms &amp; Conditions</a> and <a href="/cancellation-refund">Cancellation &amp; Refund Policy</a>.</li>
          <li>For changes or cancellations, contact us with your booking reference, tour name, and travel date.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24, color: "#475569", fontSize: 14 }}>
        <p><strong>Business details:</strong></p>
        <ul style={{ marginTop: 8, paddingLeft: 20 }}>
          <li>Business name: Prime Desert Safari</li>
          <li>Phone: <a href={`tel:${PHONE.replace(/\s+/g, "")}`}>{PHONE}</a></li>
          <li>WhatsApp: <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>
          <li>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
          <li>Region served: Dubai, Abu Dhabi &amp; Ras Al Khaimah, UAE</li>
          <li>Keep this information consistent with your domain, payment descriptors, and ad disclosures.</li>
        </ul>
      </section>
    </main>
  );
}
