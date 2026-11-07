"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (pathname?.startsWith("/admin")) return null;

  const menuLinks = [
    { href: "/tours", label: "All Tours" },
    { href: "/category/desert-adventures", label: "Desert Adventures" },
    { href: "/category/attractions", label: "Attractions" },
    { href: "/category/sports-events", label: "Sports Events" },
    { href: "/category/city-tours", label: "City Tours" },
    { href: "/category/cruise-and-boat-tours", label: "Cruise and Boat Tours" },
    { href: "/category/waterparks-and-theme-parks", label: "Waterparks & Theme Parks" },
    { href: "/category/transport", label: "Transport" },
    { href: "/", label: "Why us" },
  ];

  return (
    <>
      <header>
        <div className="container nav-container">
          <Link href="/" className="logo" aria-label="Prime Desert Safari home">
            <img src="/Prime-Desert-Safari-Logo.png" alt="Prime Desert Safari" className="brand-logo" />
          </Link>

          <button
            type="button"
            className="mobile-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <i className={open ? "fas fa-times" : "fas fa-bars"}></i>
          </button>

          <div className="search-bar">
            <input type="text" placeholder="Find my feeling" />
            <i className="fas fa-search"></i>
          </div>
          <div className="nav-actions">
            <Link href="/"><i className="fas fa-headset"></i> Chat with an expert</Link>
            <Link href="/admin/login"><i className="fas fa-user"></i> Log In</Link>
          </div>
        </div>

        <nav className="main-menu desktop-main-menu" aria-label="Main menu">
          <div className="container">
            <ul>
              {menuLinks.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </nav>

        {open && <button type="button" className="mobile-nav-overlay" aria-label="Close menu" onClick={() => setOpen(false)} />}

        <nav id="mobile-nav" className={`mobile-nav ${open ? "open" : ""}`} aria-label="Mobile menu" aria-hidden={!open}>
          <div className="mobile-nav-inner">
            <div className="mobile-nav-actions">
              <Link href="/admin/login" onClick={() => setOpen(false)}><i className="fas fa-user"></i> Log In / Account</Link>
              <Link href="/" onClick={() => setOpen(false)}><i className="fas fa-map-marker-alt"></i> Wishlist</Link>
              <Link href="/" onClick={() => setOpen(false)}><i className="fas fa-headset"></i> Chat with an expert</Link>
            </div>
            <ul className="mobile-nav-links">
              {menuLinks.map((l) => (
                <li key={`m-${l.label}`}><Link href={l.href} onClick={() => setOpen(false)}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
