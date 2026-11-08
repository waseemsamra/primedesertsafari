import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Prime Desert Safari collects, uses, and protects personal information when you browse, inquire, or book tours.",
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>Privacy Policy</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>Last updated: {new Date().getUTCFullYear()}</p>

      <p>Prime Desert Safari respects your privacy. This policy explains what information we may collect, how we use it, and the choices available to you when you visit our website, contact us, or request a tour booking.</p>

      <h2>Information we may collect</h2>
      <ul>
        <li>Contact details you provide, such as name, email address, phone number, and WhatsApp number.</li>
        <li>Booking or inquiry details, such as tour preferences, travel dates, number of guests, pickup location, and special requests.</li>
        <li>Technical information such as IP address, browser type, device information, and pages visited, where collected through standard analytics/cookies.</li>
        <li>Payment-related information is handled by the payment method or provider used for a booking. We do not intentionally store full card details on this website unless explicitly stated.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To respond to inquiries, confirm availability, and manage bookings or customer support.</li>
        <li>To send booking updates, service messages, or information you request.</li>
        <li>To improve website performance, security, and user experience.</li>
        <li>To comply with legal, tax, or regulatory obligations where applicable.</li>
      </ul>

      <h2>Sharing information</h2>
      <p>We may share necessary information with tour operators, transport providers, payment providers, or service partners only to deliver the requested service. We may also disclose information if required by law or to protect rights, safety, and security.</p>

      <h2>Cookies and analytics</h2>
      <p>We may use cookies or similar technologies for site functionality, measurement, and advertising performance. See our <a href="/cookie-policy">Cookie Policy</a> for details.</p>

      <h2>Data retention and security</h2>
      <p>We keep personal information only as long as reasonably needed for bookings, support, legal obligations, or legitimate business purposes. We take reasonable measures to protect information, but no online system can guarantee absolute security.</p>

      <h2>Your choices</h2>
      <p>You may request access, correction, or deletion of personal information you provided, subject to legal and operational requirements. Contact us using the details on our <a href="/contact">Contact page</a>.</p>
    </main>
  );
}
