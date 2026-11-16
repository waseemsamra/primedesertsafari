"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import Link from "next/link";
import SignedImage from "@/components/SignedImage";
import type { TourRecord, TourFeature, TourItinerary } from "@/lib/tours-server";
import "./tour-detail.css";

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const placeholder = "https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200&auto=format&fit=crop";

type ListItem = { text: string; children: ListNode | null };
type ListNode = { ordered: boolean; items: ListItem[] };
type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; node: ListNode }
  | { kind: "para"; text: string };

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const LIST_RE = /^(\s*)([-*•]|\d+[.)])\s+(.*)$/;

const HEADING_SIZES: Record<number, { fontSize: number; margin: string }> = {
  1: { fontSize: 1.5, margin: "20px 0 10px" },
  2: { fontSize: 1.25, margin: "16px 0 8px" },
  3: { fontSize: 1.1, margin: "14px 0 6px" },
  4: { fontSize: 1.02, margin: "12px 0 6px" },
  5: { fontSize: 0.95, margin: "10px 0 4px" },
  6: { fontSize: 0.9, margin: "10px 0 4px" },
};

function MdLine({ children }: { children: ReactNode }) {
  return <span style={{ display: "inline" }}>{children}</span>;
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? <strong key={i}>{p}</strong> : <MdLine key={i}>{p}</MdLine>));
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/^\s*(?:\d+[.)]|[-*•])\s+/, "").trim();
}

function parseListAt(lines: string[], pos: { i: number }): ListNode {
  const baseIndent = (lines[pos.i].match(LIST_RE) as RegExpMatchArray)[1].length;
  const parseLevel = (indent: number): ListNode => {
    const items: ListItem[] = [];
    const ordered = /\d/.test((lines[pos.i].match(LIST_RE) as RegExpMatchArray)[2]);
    while (pos.i < lines.length) {
      if (!lines[pos.i].trim()) {
        let j = pos.i;
        while (j < lines.length && !lines[j].trim()) j++;
        const nm = j < lines.length ? lines[j].match(LIST_RE) : null;
        if (nm && nm[1].length >= indent) { pos.i = j; continue; }
        break;
      }
      const m = lines[pos.i].match(LIST_RE);
      if (!m) break;
      const ind = m[1].length;
      if (ind !== indent) break;
      const item: ListItem = { text: m[3].trim(), children: null };
      pos.i++;
      if (pos.i < lines.length) {
        const nm = lines[pos.i].match(LIST_RE);
        if (nm && nm[1].length > ind) item.children = parseLevel(nm[1].length);
      }
      items.push(item);
    }
    return { ordered, items };
  };
  return parseLevel(baseIndent);
}

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  const pos = { i: 0 };
  while (pos.i < lines.length) {
    const raw = lines[pos.i];
    const trimmed = raw.trim();
    if (!trimmed) { pos.i++; continue; }
    const h = trimmed.match(HEADING_RE);
    if (h) { blocks.push({ kind: "heading", level: h[1].length, text: h[2].trim() }); pos.i++; continue; }
    if (LIST_RE.test(raw)) { blocks.push({ kind: "list", node: parseListAt(lines, pos) }); continue; }
    const para = [trimmed];
    pos.i++;
    while (pos.i < lines.length) {
      const l = lines[pos.i];
      const t = l.trim();
      if (!t || HEADING_RE.test(t) || LIST_RE.test(l)) break;
      para.push(t);
      pos.i++;
    }
    blocks.push({ kind: "para", text: para.join(" ") });
  }
  return blocks;
}

function renderList(node: ListNode, keyBase: string): ReactNode {
  const Tag = node.ordered ? "ol" : "ul";
  return (
    <Tag style={{ margin: "8px 0 12px 22px", paddingLeft: 0, listStyle: node.ordered ? "decimal" : "disc" }}>
      {node.items.map((it, i) => (
        <li key={i} style={{ marginBottom: 4 }}>
          {renderInline(it.text)}
          {it.children ? renderList(it.children, `${keyBase}-${i}`) : null}
        </li>
      ))}
    </Tag>
  );
}

function MarkdownRenderer({ text }: { text?: string | null }) {
  if (!text) return null;
  const blocks = parseBlocks(text);
  return (
    <div className="markdown-content">
      {blocks.map((b, bi) => {
        if (b.kind === "heading") {
          const s = HEADING_SIZES[b.level] || HEADING_SIZES[3];
          const Tag = `h${b.level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
          return <Tag key={bi} style={{ fontSize: s.fontSize, fontWeight: 700, margin: s.margin, color: "#111827" }}>{renderInline(b.text)}</Tag>;
        }
        if (b.kind === "list") return <div key={bi}>{renderList(b.node, `b${bi}`)}</div>;
        return <p key={bi} style={{ marginBottom: 10, lineHeight: 1.6, color: "#374151" }}>{renderInline(b.text)}</p>;
      })}
    </div>
  );
}

export default function TourDetailClient({
  tour,
  related,
  heroSrc,
  heroExpiresAt = 0,
}: {
  tour: TourRecord;
  related: TourRecord[];
  heroSrc?: string;
  heroExpiresAt?: number;
}) {
  const gallery = asArray<string>(tour.gallery).filter(Boolean);
  const imgs = gallery.length ? gallery : tour.image_url ? [tour.image_url] : [placeholder];
  while (imgs.length < 5) imgs.push(imgs[0] || placeholder);

  const [open, setOpen] = useState<Record<string, boolean>>({ itinerary: true });
  const [mainImg, setMainImg] = useState<string>(imgs[0] || "");
  const [bookingDate, setBookingDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState("");
  const [selectedVeh, setSelectedVeh] = useState("");

  const features = asArray<TourFeature>(tour.features);
  const itinerary = asArray<TourItinerary>(tour.itinerary);
  const highlights = asArray<string>(tour.highlights);
  const vehicles = asArray<string>(tour.vehicle_options);
  const packages = asArray<string>(tour.package_options);
  const priceText = tour.price != null ? `From AED ${Number(tour.price).toLocaleString()}` : "Price on request";
  const tourHref = (t: TourRecord) => `/tour/${t.slug || t.id}`;
  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const travelersLabel = `${adults} Adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}`;
  const bookingHref = `/booking?id=${tour.id}&title=${encodeURIComponent(tour.title || "")}&price=${tour.price ?? ""}&date=${encodeURIComponent(bookingDate)}&travelers=${encodeURIComponent(travelersLabel)}&package=${encodeURIComponent(selectedPkg)}&vehicle=${encodeURIComponent(selectedVeh)}`;
  const stepBtn: CSSProperties = { width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border-color)", background: "#f1f5f9", color: "var(--text-dark)", fontSize: 16, fontWeight: 700, cursor: "pointer", lineHeight: 1 };

  return (
    <div className="tour-detail-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> {" > "}
          {tour.category ? <><span>{tour.category}</span> {" > "}</> : null}
          {tour.title || "Tour"}
        </div>

        <h1 className="page-title">{tour.title || "Tour"}</h1>
        <p className="sub-title">By Madinat al Nojoom</p>

        <div className="gallery-wrapper">
          <div className="gallery-main">
            <SignedImage
              src={mainImg || imgs[0]}
              alt={tour.title || "Tour"}
              width={800}
              initialSrc={mainImg === imgs[0] ? heroSrc : undefined}
              initialExpiresAt={mainImg === imgs[0] ? heroExpiresAt : 0}
            />
          </div>
          <div className="gallery-thumbs">
            {imgs.map((src, i) => (
              <div className={`gallery-thumb-item ${i === 0 ? "active" : ""}`} key={i} onClick={() => setMainImg(src)}>
                <SignedImage src={src} alt={`${tour.title || "Tour"} ${i + 1}`} width={200} loading="lazy" />
              </div>
            ))}
          </div>
          {imgs.slice(1, 5).map((src, i) => (
            <div className="gallery-side-item" key={i}>
              <SignedImage src={src} alt={`${tour.title || "Tour"} ${i + 2}`} width={400} loading="lazy" />
            </div>
          ))}
        </div>

        <div className="highlight-banner">
          <div className="highlight-left">
            <i className="fas fa-bus"></i> {tour.pickup_info || "Hotel or residence pick-up included from anywhere in Dubai"}
          </div>
          <div className="highlight-right">
            <strong>{priceText}</strong>
            {tour.price_note || "Price varies by vehicle, group size and other selections"}
          </div>
        </div>

        <div className="content-grid">
          <div className="left-col">
            {features.length > 0 && (
              <div className="features-grid">
                {features.map((f, i) => (
                  <div className="feature-item" key={i}>
                    <div className="feature-icon"><i className={f.icon || "fas fa-check"}></i></div>
                    {f.label || "Feature"}
                  </div>
                ))}
              </div>
            )}

            <div className="section-block">
              <h3>About</h3>
              <MarkdownRenderer text={tour.short_description || tour.full_description || null} />
              {!tour.short_description && !tour.full_description && <span className="about-text">Details coming soon.</span>}
              <div className="meta-info">
                {tour.duration && <span><i className="fas fa-clock"></i> Duration: {tour.duration}</span>}
                {tour.language && <span><i className="fas fa-globe"></i> Language: {tour.language}</span>}
                {tour.rating && <span><i className="fas fa-star"></i> {tour.rating}</span>}
              </div>
            </div>

            {tour.full_description && (
              <div className={`accordion ${open.full ? "active" : ""}`} onClick={() => toggle("full")}>
                <div className="accordion-header">Full description <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><MarkdownRenderer text={tour.full_description} /></div>
              </div>
            )}

            {itinerary.length > 0 && (
              <div className={`accordion ${open.itinerary ? "active" : ""}`} onClick={() => toggle("itinerary")}>
                <div className="accordion-header">Experience Itinerary <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content">
                  <div className="itinerary-list">
                    {itinerary.map((s, i) => (
                      <div className="itinerary-item" key={i}>
                        <div className="itinerary-title">{i + 1}. {stripMd(s.title || "Step")}</div>
                        {s.description && <div className="itinerary-desc"><MarkdownRenderer text={s.description} /></div>}
                        {s.duration && <div className="itinerary-time"><i className="fas fa-clock"></i> {s.duration.replace(/\*\*/g, "")}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {highlights.length > 0 && (
              <div className={`accordion ${open.highlights ? "active" : ""}`} onClick={() => toggle("highlights")}>
                <div className="accordion-header">Highlights <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><ul>{highlights.map((h, i) => <li key={i} style={{ listStyle: "disc", marginLeft: 18, marginBottom: 6 }}>{stripMd(h)}</li>)}</ul></div>
              </div>
            )}
            {tour.know_before_you_go && (
              <div className={`accordion ${open.know ? "active" : ""}`} onClick={() => toggle("know")}>
                <div className="accordion-header">Know before you go <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><MarkdownRenderer text={tour.know_before_you_go} /></div>
              </div>
            )}
            {tour.age_policy && (
              <div className={`accordion ${open.age ? "active" : ""}`} onClick={() => toggle("age")}>
                <div className="accordion-header">Age policy <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><MarkdownRenderer text={tour.age_policy} /></div>
              </div>
            )}
            {tour.cancellation_policy && (
              <div className={`accordion ${open.cancel ? "active" : ""}`} onClick={() => toggle("cancel")}>
                <div className="accordion-header">Cancellation policy <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><MarkdownRenderer text={tour.cancellation_policy} /></div>
              </div>
            )}

            <div className="video-section">
              <a className="play-btn" href={tour.video_url || "#"} target={tour.video_url ? "_blank" : undefined} rel="noreferrer" onClick={(e) => { if (!tour.video_url) e.preventDefault(); }}>
                <i className="fab fa-youtube"></i>
              </a>
              <div className="watch-invi">Watch on <i className="fab fa-youtube"></i> YouTube</div>
            </div>
          </div>

          <div className="right-col">
            <div className="booking-sidebar">
              <h3>Select Date and Travelers</h3>
              <div className="form-group"><label>Date</label><input type="date" className="input-box" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} /></div>
              <div className="form-group">
                <label>Guests</label>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 12px", marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>Adults</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} style={stepBtn}>−</button>
                    <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{adults}</span>
                    <button type="button" onClick={() => setAdults((a) => a + 1)} style={stepBtn}>+</button>
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--border-color)", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={{ fontWeight: 500 }}>Children</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button type="button" onClick={() => setChildren((c) => Math.max(0, c - 1))} style={stepBtn}>−</button>
                    <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700 }}>{children}</span>
                    <button type="button" onClick={() => setChildren((c) => c + 1)} style={stepBtn}>+</button>
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-light)", marginTop: 8 }}>{travelersLabel}</p>
              </div>
              <div className="form-group">
                <select className="dropdown-box" value={selectedVeh} onChange={(e) => setSelectedVeh(e.target.value)}>
                  <option value="">Choose Your Vehicle</option>
                  {(vehicles.length ? vehicles : ["Shared 4x4", "Private 4x4"]).map((v, i) => <option key={`veh-${i}`} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <select className="dropdown-box" value={selectedPkg} onChange={(e) => setSelectedPkg(e.target.value)}>
                  <option value="">Choose Your Package</option>
                  {(packages.length ? packages : ["Standard Package", "VIP Package"]).map((v, i) => <option key={`pkg-${i}`} value={v}>{v}</option>)}
                </select>
              </div>
              <Link href={bookingHref} className="btn-add-cart">Book Now</Link>
              {tour.status && tour.status !== "Active" && <p style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>Currently unavailable</p>}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <div className="section-header">
              <h2>Other <span>Experiences</span> you might like</h2>
              <div className="arrows">
                <div className="arrow-btn"><i className="fas fa-chevron-left"></i></div>
                <div className="arrow-btn"><i className="fas fa-chevron-right"></i></div>
              </div>
            </div>
            <div className="card-grid">
              {related.map((r) => (
                <Link href={tourHref(r)} className="card" key={r.id}>
                  <div className="card-img">
                    <SignedImage src={r.image_url || placeholder} alt={r.title || "Tour"} width={400} loading="lazy" />
                    {(r.discount || r.badge) && <span className={`badge-tag ${r.discount ? "red" : ""}`}>{r.discount || r.badge}</span>}
                  </div>
                  <div className="card-body">
                    <div className="card-category">{r.category || "Tour"}</div>
                    <div className="card-title">{r.title || "Tour"}</div>
                    <div className="features-tags">
                      {r.duration && <span className="feature-tag"><i className="fas fa-clock"></i> {r.duration}</span>}
                      {r.rating && <span className="feature-tag"><i className="fas fa-star" style={{ color: "gold" }}></i> {r.rating}</span>}
                    </div>
                    <div className="price-row">
                      <div className="price"><span>From</span> {r.price != null ? `AED ${Number(r.price).toLocaleString()}` : "—"}</div>
                      <button className="btn-book" onClick={(e) => { e.stopPropagation(); window.location.href = tourHref(r); }}>Book now</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom Book Now bar */}
      <div className="mobile-book-bar">
        <div className="mobile-book-price">{tour.price != null ? `AED ${Number(tour.price).toLocaleString()}` : "Price on request"}</div>
        <Link href={bookingHref} className="mobile-book-btn">Book Now</Link>
      </div>
    </div>
  );
}