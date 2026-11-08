import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How Prime Desert Safari uses cookies and similar technologies for site functionality, analytics, and advertising measurement.",
  alternates: { canonical: "/cookie-policy" },
};

export default function CookiePolicyPage() {
  return (
    <main className="container" style={{ padding: "32px 0 56px", maxWidth: 900 }}>
      <h1 style={{ marginBottom: 12 }}>Cookie Policy</h1>
      <p style={{ color: "#475569", marginBottom: 24 }}>Last updated: {new Date().getUTCFullYear()}</p>

      <p>This Cookie Policy explains how Prime Desert Safari may use cookies and similar technologies when you visit our website.</p>

      <h2>What cookies are</h2>
      <p>Cookies are small text files stored on your device by a website. They help websites remember preferences, understand usage, and support advertising or analytics tools.</p>

      <h2>How we may use cookies</h2>
      <ul>
        <li><strong>Essential:</strong> required for basic site functionality and security.</li>
        <li><strong>Performance/analytics:</strong> help us understand how visitors use the site so we can improve it.</li>
        <li><strong>Advertising/measurement:</strong> may help measure ad performance and show relevant ads where enabled.</li>
      </ul>

      <h2>Managing cookies</h2>
      <p>You can control cookies through your browser settings. Disabling some cookies may affect website functionality. For questions, contact us via the <a href="/contact">Contact page</a>.</p>
    </main>
  );
}
