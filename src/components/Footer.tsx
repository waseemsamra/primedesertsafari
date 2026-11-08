"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="footer-logo" aria-label="Prime Desert Safari home">
              <img src="/Prime-Desert-Logo.png" alt="Prime Desert Safari" className="footer-brand-logo" />
            </Link>
            <p style={{ fontSize: 13, color: "var(--text-light)", marginBottom: 15 }}>Subscribe to Our Special Offers</p>
            <div className="subscribe-form">
              <input type="email" placeholder="Email Address" />
              <button type="button">Subscribe</button>
            </div>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul>
              <li><Link href="/"><i className="fas fa-phone"></i> +971 800 272 2426</Link></li>
              <li><Link href="/"><i className="fab fa-whatsapp"></i> +971 800 272 2426</Link></li>
              <li><Link href="/"><i className="fas fa-envelope"></i> reservations@arabianadventures.ae</Link></li>
              <li><Link href="/"><i className="fas fa-map-marker-alt"></i> Where to find us</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Our Adventures</h4>
            <ul>
              <li><Link href="/">Desert Safaris</Link></li>
              <li><Link href="/">City Tours</Link></li>
              <li><Link href="/">Cruise &amp; Boat Tours</Link></li>
              <li><Link href="/">Attractions &amp; Theme Parks</Link></li>
              <li><Link href="/">Hotels</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>About Us</h4>
            <ul>
              <li><Link href="/">Why Choose Us</Link></li>
              <li><Link href="/">Where to Find Us</Link></li>
              <li><Link href="/">Travel Partners</Link></li>
              <li><Link href="/">Meetings, Incentives &amp; Events</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Terms &amp; Conditions</h4>
            <ul>
              <li><Link href="/">Conditions</Link></li>
              <li><Link href="/">Cancellation &amp; Refund Policy</Link></li>
              <li><Link href="/">Terms and Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Prime Desert Safari</p>
          <div style={{ display: "flex", gap: 15 }}>
            <Link href="/">Privacy Policy</Link>
            <Link href="/">Cookie Policy</Link>
            <Link href="/">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
