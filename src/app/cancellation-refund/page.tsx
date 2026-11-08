import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy",
  description: "Cancellation, rescheduling, no-show, and refund information for Prime Desert Safari tour bookings.",
  alternates: { canonical: "/cancellation-refund" },
};

export default function CancellationRefundPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>Cancellation &amp; Refund Policy</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>Last updated: {new Date().getUTCFullYear()}</p>

      <p>Cancellation, rescheduling, and refund eligibility depend on the specific tour, supplier terms, travel date, and when the request is made. The final terms confirmed at booking apply.</p>

      <h2>General guidance</h2>
      <ul>
        <li><strong>Customer cancellation:</strong> contact us as early as possible with your booking details. Refund eligibility and fees may depend on notice period and tour type.</li>
        <li><strong>Rescheduling:</strong> subject to availability and supplier conditions; fare differences may apply.</li>
        <li><strong>No-shows / late arrival:</strong> missed pickups or failure to attend may be treated as non-refundable where the service was reserved.</li>
        <li><strong>Operator/weather/safety changes:</strong> if a tour is cancelled or materially changed by the operator for safety, weather, or operational reasons, we will offer available alternatives such as rescheduling or a refund as applicable to the booking.</li>
      </ul>

      <h2>Refund processing</h2>
      <p>Approved refunds are generally returned to the original payment method where possible. Processing times depend on the payment provider and bank.</p>

      <h2>How to request changes</h2>
      <p>Contact Prime Desert Safari with your name, booking reference (if available), tour name, date, and request details via the <a href="/contact">Contact page</a>.</p>
    </main>
  );
}
