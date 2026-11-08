import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Prime Desert Safari — clear pricing, genuinely free cancellation up to 24 hours before your visit, and a real support team for Dubai desert safari, dhow cruise, water sport, and city attraction bookings.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>About Us</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>
        Dubai has no shortage of things to do. It has a shortage of operators who tell you the price up front.
      </p>

      <p>
        We curate a focused set of Dubai experiences — dhow cruises on the Creek, desert safaris, water sports, and city
        attractions — and we handle the booking details so you can arrive and simply enjoy the day. Every price on this site
        is the price you pay, and cancellation is genuinely free until 24 hours before your visit.
      </p>

      <p>
        We are based in Dubai and work directly with the operators who run the experiences we sell. If something goes wrong on
        the day, you are talking to us, not to a call centre.
      </p>

      <h2>How we work</h2>

      <h3>Clear pricing</h3>
      <p>
        The price you see is the price you pay. Mandatory extras are shown before you book, not added at checkout.
      </p>

      <h3>Cancellation that is actually free</h3>
      <p>
        Cancel free up to 24 hours before your visit date and receive a full refund to your original payment method.
      </p>

      <h3>Only experiences we would book ourselves</h3>
      <p>
        We work with a limited group of vetted operators rather than listing everything available in Dubai.
      </p>

      <h3>A real person when it matters</h3>
      <p>
        Questions go to our support team, not a queue. You get an answer with your booking reference in view.
      </p>

      <h2>Our organisation</h2>
      <p>
        We are a brand of Madinat al Nojoom, a licensed Dubai tour operator with DED Trade License No. 869907. Madinat al
        Nojoom is a subsidiary of SHREE SHVIZ MARKETING SERVICES - FZCO.
      </p>
      <p>
        Registered office: Mulk Mohammad Hashim Alawi Al-Saff — Al Mirr, B-19, Office No. B-19, Dubai, UAE.
      </p>
      <p>
        Contact: bookings@primedesertsafari.com | +971 50 133 2442
      </p>
      <p>
        All bookings made through this site are contracted with Madinat al Nojoom. Services may be fulfilled by Madinat al
        Nojoom directly or by licensed third-party suppliers.
      </p>

      <h2>Get in touch</h2>
      <p>
        Questions about a tour, a booking, or a partnership are welcome. Email
        <a href="mailto:bookings@primedesertsafari.com">bookings@primedesertsafari.com</a> or use our{" "}
        <Link href="/contact">contact page</Link>.
      </p>
      <p>
        Registered at Mulk Mohammad Hashim Alawi Al-Saff — Al Mirr, B-19, Office No. B-19, Dubai, UAE.<br />
        Madinat al Nojoom — Dubai DED License No. 869907.
      </p>
    </main>
  );
}
