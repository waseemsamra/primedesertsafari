import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Booking terms, pricing, guest responsibilities, and service conditions for Prime Desert Safari tours and experiences.",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>Terms and Conditions</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>Last updated: {new Date().getUTCFullYear()}</p>

      <p>These terms apply to inquiries, bookings, and services provided through Prime Desert Safari. By using this website or requesting a booking, you agree to review tour details, pricing, inclusions, exclusions, and policies before confirming.</p>

      <h2>Bookings and availability</h2>
      <p>Tour availability, schedules, pickup times, and inclusions may change due to weather, safety, operational requirements, supplier availability, or local regulations. We will communicate material changes where possible.</p>

      <h2>Pricing and inclusions</h2>
      <p>Prices shown on the website are indicative unless confirmed at booking. Always check the specific tour page or booking confirmation for inclusions, exclusions, age limits, pickup details, and any additional fees.</p>

      <h2>Guest responsibilities</h2>
      <ul>
        <li>Provide accurate contact, pickup, and guest information.</li>
        <li>Follow safety instructions from guides, drivers, and operators.</li>
        <li>Inform us of relevant medical conditions, accessibility needs, or age restrictions before booking.</li>
      </ul>

      <h2>Cancellations and refunds</h2>
      <p>Cancellation and refund terms vary by tour and timing. Please review our <a href="/cancellation-refund">Cancellation &amp; Refund Policy</a> and the specific tour/booking confirmation.</p>

      <h2>Liability</h2>
      <p>Adventure and outdoor activities involve inherent risks. To the extent permitted by law, Prime Desert Safari and its service partners are not liable for losses arising from factors outside reasonable control, guest non-compliance with safety instructions, or inaccurate information provided by the guest. Nothing in these terms excludes rights that cannot be excluded under applicable law.</p>

      <h2>Contact</h2>
      <p>For questions about these terms or a booking, use the <a href="/contact">Contact page</a>.</p>
    </main>
  );
}
