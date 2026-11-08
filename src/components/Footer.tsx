"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const PHONE = "+971 50 133 2442";
const EMAIL = "bookings@primedesertsafari.com";
const WHATSAPP = "https://wa.me/971501332442";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="footer-logo" aria-label="Prime Desert Safari home">
              <img src="/Prime-Desert-Logo.png" alt="Prime Desert Safari" className="footer-brand-logo" />
            </Link>
            <p style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 15 }}>
              Prime Desert Safari offers desert safari and tour experiences across the UAE. Review tour inclusions, pricing, and policies before booking.
            </p>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li><a href={`tel:${PHONE.replace(/\s+/g, "")}`}><i className="fas fa-phone"></i> {PHONE}</a></li>
              <li><a href={WHATSAPP} target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp"></i> WhatsApp</a></li>
              <li><a href={`mailto:${EMAIL}`}><i className="fas fa-envelope"></i> {EMAIL}</a></li>
              <li><Link href="/contact"><i className="fas fa-map-marker-alt"></i> Contact &amp; Business Details</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/tours">All Tours</Link></li>
              <li><Link href="/category/desert-safaris">Desert Safaris</Link></li>
              <li><Link href="/category/city-tours">City Tours</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Policies</h4>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy">Cookie Policy</Link></li>
              <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
              <li><Link href="/cancellation-refund">Cancellation &amp; Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p style={{ margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.4 }}>
            © Prime Desert Safari — A brand of Madinat al Nojoom, Dubai, United Arab Emirates
            <br />
            Madinat al Nojoom Trade License No. 869907 | Registered in Dubai, UAE
          </p>
          <div style={{ marginTop: 10, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 13 }}>
            <span style={{ color: "#94a3b8" }}>Terms of usage</span>
            <span style={{ color: "#94a3b8", marginLeft: 6 }}>•</span>
            <Link href="/privacy-policy" style={{ color: "#cbd5e1", textDecoration: "underline" }}>Privacy policy</Link>
            <span style={{ color: "#94a3b8", marginLeft: 6 }}>•</span>
            <Link href="/cancellation-refund" style={{ color: "#cbd5e1", textDecoration: "underline" }}>Refund policy</Link>
            <span style={{ color: "#94a3b8", marginLeft: 6 }}>•</span>
            <Link href="/contact" style={{ color: "#cbd5e1", textDecoration: "underline" }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
