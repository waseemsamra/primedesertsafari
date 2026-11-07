"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-links">
            <Link href="/">Desert Adventures</Link>
            <Link href="/">Attractions</Link>
            <Link href="/">Sports Events</Link>
            <Link href="/">City Tours</Link>
            <Link href="/">Cruise and Boat Tours</Link>
            <Link href="/">Waterparks &amp; Theme Parks</Link>
          </div>
          <div className="top-bar-links">
            <Link href="/admin/login"><i className="fas fa-user"></i> Log In / Create Account</Link>
            <Link href="/"><i className="fas fa-map-marker-alt"></i> Wishlist</Link>
            <Link href="/"><i className="fas fa-shopping-cart"></i> Cart</Link>
          </div>
        </div>
      </div>

      <header>
        <div className="container nav-container">
          <Link href="/" className="logo" aria-label="Prime Desert Safari home">
            <i className="fas fa-mountain"></i> Prime Desert Safari
          </Link>
          <div className="search-bar">
            <input type="text" placeholder="Find my feeling" />
            <i className="fas fa-search"></i>
          </div>
          <div className="nav-actions">
            <Link href="/"><i className="fas fa-headset"></i> Chat with an expert</Link>
            <Link href="/admin/login"><i className="fas fa-user"></i> Log In</Link>
            <div className="cart"><i className="fas fa-shopping-cart"></i> Cart</div>
          </div>
        </div>
        <nav className="main-menu">
          <div className="container">
            <ul>
              <li><Link href="/">Desert Adventures</Link></li>
              <li><Link href="/">Attractions</Link></li>
              <li><Link href="/">Sports Events</Link></li>
              <li><Link href="/">City Tours</Link></li>
              <li><Link href="/">Cruise and Boat Tours</Link></li>
              <li><Link href="/">Waterparks &amp; Theme Parks</Link></li>
              <li><Link href="/">Transport</Link></li>
              <li><Link href="/">Why us</Link></li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
