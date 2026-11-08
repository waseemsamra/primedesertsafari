'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import './tour-detail.css';

type ItineraryStep = { title?: string; description?: string; duration?: string };
type FeatureItem = { icon?: string; label?: string };
type Tour = {
  id: number;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  price?: number | null;
  discount?: string | null;
  duration?: string | null;
  language?: string | null;
  rating?: string | null;
  status?: string | null;
  badge?: string | null;
  image_url?: string | null;
  short_description?: string | null;
  full_description?: string | null;
  pickup_info?: string | null;
  price_note?: string | null;
  gallery?: string[] | null;
  features?: FeatureItem[] | null;
  itinerary?: ItineraryStep[] | null;
  highlights?: string[] | null;
  know_before_you_go?: string | null;
  age_policy?: string | null;
  cancellation_policy?: string | null;
  vehicle_options?: string[] | null;
  package_options?: string[] | null;
  video_url?: string | null;
};

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const placeholder = 'https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200&auto=format&fit=crop';

export default function TourDetailPage() {
  const params = useParams<{ id: string }>();
  const idOrSlug = params?.id;
  const [tour, setTour] = useState<Tour | null>(null);
  const [related, setRelated] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<Record<string, boolean>>({ itinerary: true });

  useEffect(() => {
    if (!idOrSlug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      let data: Tour | null = null;
      let errMsg = '';
      if (/^\d+$/.test(idOrSlug)) {
        const res = await supabase.from('tours').select('*').eq('id', Number(idOrSlug)).maybeSingle();
        data = (res.data as Tour | null) ?? null;
        errMsg = res.error?.message || '';
      }
      if (!data) {
        const res = await supabase.from('tours').select('*').eq('slug', idOrSlug).maybeSingle();
        if (res.data) data = res.data as Tour;
        if (!data && res.error && !errMsg) errMsg = res.error.message;
      }
      if (cancelled) return;
      if (!data) {
        setError(errMsg || 'Tour not found');
        setLoading(false);
        return;
      }
      setTour(data);
      const { data: rel } = await supabase
        .from('tours')
        .select('id,title,slug,category,price,duration,rating,image_url,discount,badge')
        .neq('id', data.id)
        .limit(4);
      if (!cancelled) setRelated((rel as Tour[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [idOrSlug]);

  const toggle = (k: string) => setOpen((o) => ({ ...o, [k]: !o[k] }));

  if (loading) return <div className="tour-detail-page"><div className="loading">Loading tour...</div></div>;
  if (error || !tour) return <div className="tour-detail-page"><div className="error">{error || 'Tour not found'} <div style={{ marginTop: 12 }}><Link href="/">Back to home</Link></div></div></div>;

  const gallery = asArray<string>(tour.gallery).filter(Boolean);
  const imgs = gallery.length ? gallery : (tour.image_url ? [tour.image_url] : [placeholder]);
  while (imgs.length < 5) imgs.push(imgs[0] || placeholder);
  const features = asArray<FeatureItem>(tour.features);
  const itinerary = asArray<ItineraryStep>(tour.itinerary);
  const highlights = asArray<string>(tour.highlights);
  const vehicles = asArray<string>(tour.vehicle_options);
  const packages = asArray<string>(tour.package_options);
  const priceText = tour.price != null ? `From AED ${Number(tour.price).toLocaleString()}` : 'Price on request';
  const tourHref = (t: Tour) => `/tour/${t.slug || t.id}`;

  return (
    <div className="tour-detail-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">Home</Link> {'> '}
          {tour.category ? <><span>{tour.category}</span> {'> '}</> : null}
          {tour.title || 'Tour'}
        </div>

        <h1 className="page-title">{tour.title || 'Tour'}</h1>
        <p className="sub-title">By Arabian Adventures</p>

        <div className="gallery-wrapper">
          <div className="gallery-main">
            <img src={imgs[0]} alt={tour.title || 'Tour'} />
          </div>
          {imgs.slice(1, 5).map((src, i) => (
            <div className="gallery-side-item" key={i}>
              <img src={src} alt={`${tour.title || 'Tour'} ${i + 2}`} />
              {i === 3 && <button className="btn-see-all" type="button"><i className="fas fa-images"></i> See all photos</button>}
            </div>
          ))}
        </div>

        <div className="highlight-banner">
          <div className="highlight-left">
            <i className="fas fa-bus"></i> {tour.pickup_info || 'Hotel or residence pick-up included from anywhere in Dubai'}
          </div>
          <div className="highlight-right">
            <strong>{priceText}</strong>
            {tour.price_note || 'Price varies by vehicle, group size and other selections'}
          </div>
        </div>

        <div className="content-grid">
          <div className="left-col">
            {features.length > 0 && (
              <div className="features-grid">
                {features.map((f, i) => (
                  <div className="feature-item" key={i}>
                    <div className="feature-icon"><i className={f.icon || 'fas fa-check'}></i></div>
                    {f.label || 'Feature'}
                  </div>
                ))}
              </div>
            )}

            <div className="section-block">
              <h3>About</h3>
              <p className="about-text">{tour.short_description || tour.full_description || 'Details coming soon.'}</p>
              <div className="meta-info">
                {tour.duration && <span><i className="fas fa-clock"></i> Duration: {tour.duration}</span>}
                {tour.language && <span><i className="fas fa-globe"></i> Language: {tour.language}</span>}
                {tour.rating && <span><i className="fas fa-star"></i> {tour.rating}</span>}
              </div>
            </div>

            {tour.full_description && (
              <div className={`accordion ${open.full ? 'active' : ''}`} onClick={() => toggle('full')}>
                <div className="accordion-header">Full description <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><p>{tour.full_description}</p></div>
              </div>
            )}

            {itinerary.length > 0 && (
              <div className={`accordion ${open.itinerary ? 'active' : ''}`} onClick={() => toggle('itinerary')}>
                <div className="accordion-header">Experience Itinerary <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content">
                  <div className="itinerary-list">
                    {itinerary.map((s, i) => (
                      <div className="itinerary-item" key={i}>
                        <div className="itinerary-title">{i + 1}. {s.title || 'Step'}</div>
                        {s.description && <div className="itinerary-desc">{s.description}</div>}
                        {s.duration && <div className="itinerary-time"><i className="fas fa-clock"></i> {s.duration}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {highlights.length > 0 && (
              <div className={`accordion ${open.highlights ? 'active' : ''}`} onClick={() => toggle('highlights')}>
                <div className="accordion-header">Highlights <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><ul>{highlights.map((h, i) => <li key={i} style={{ listStyle: 'disc', marginLeft: 18, marginBottom: 6 }}>{h}</li>)}</ul></div>
              </div>
            )}
            {tour.know_before_you_go && (
              <div className={`accordion ${open.know ? 'active' : ''}`} onClick={() => toggle('know')}>
                <div className="accordion-header">Know before you go <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><p>{tour.know_before_you_go}</p></div>
              </div>
            )}
            {tour.age_policy && (
              <div className={`accordion ${open.age ? 'active' : ''}`} onClick={() => toggle('age')}>
                <div className="accordion-header">Age policy <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><p>{tour.age_policy}</p></div>
              </div>
            )}
            {tour.cancellation_policy && (
              <div className={`accordion ${open.cancel ? 'active' : ''}`} onClick={() => toggle('cancel')}>
                <div className="accordion-header">Cancellation policy <i className="fas fa-chevron-down"></i></div>
                <div className="accordion-content"><p>{tour.cancellation_policy}</p></div>
              </div>
            )}

            <div className="video-section">
              <a className="play-btn" href={tour.video_url || '#'} target={tour.video_url ? '_blank' : undefined} rel="noreferrer" onClick={(e) => { if (!tour.video_url) e.preventDefault(); }}>
                <i className="fab fa-youtube"></i>
              </a>
              <div className="watch-invi">Watch on <i className="fab fa-youtube"></i> YouTube</div>
            </div>
          </div>

          <div className="right-col">
            <div className="booking-sidebar">
              <h3>Select Date and Travelers</h3>
              <div className="form-group"><label>Date</label><input type="date" className="input-box" /></div>
              <div className="form-group">
                <label>Number of guests</label>
                <select className="dropdown-box"><option>1 Adult</option><option>2 Adults</option><option>2 Adults, 1 Child</option></select>
                <div className="checkbox-group" style={{ marginTop: 10 }}>
                  <input type="checkbox" id="childCheck" /> <label htmlFor="childCheck" style={{ marginBottom: 0, fontWeight: 400 }}>Children must be accompanied by an adult</label>
                </div>
              </div>
              <div className="form-group">
                <select className="dropdown-box" defaultValue="">
                  <option value="">Choose Your Vehicle</option>
                  {(vehicles.length ? vehicles : ['Shared 4x4', 'Private 4x4']).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <select className="dropdown-box" defaultValue="">
                  <option value="">Choose Your Package</option>
                  {(packages.length ? packages : ['Standard Package', 'VIP Package']).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <Link href="/contact" className="btn-add-cart">Add to Cart</Link>
              {tour.status && tour.status !== 'Active' && <p style={{ marginTop: 10, fontSize: 12, color: '#ef4444' }}>Currently unavailable</p>}
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
                    <img src={r.image_url || placeholder} alt={r.title || 'Tour'} />
                    {(r.discount || r.badge) && <span className={`badge-tag ${r.discount ? 'red' : ''}`}>{r.discount || r.badge}</span>}
                  </div>
                  <div className="card-body">
                    <div className="card-category">{r.category || 'Tour'}</div>
                    <div className="card-title">{r.title || 'Tour'}</div>
                    <div className="features-tags">
                      {r.duration && <span className="feature-tag"><i className="fas fa-clock"></i> {r.duration}</span>}
                      {r.rating && <span className="feature-tag"><i className="fas fa-star" style={{ color: 'gold' }}></i> {r.rating}</span>}
                    </div>
                      <div className="price-row">
                        <div className="price"><span>From</span> {r.price != null ? `AED ${Number(r.price).toLocaleString()}` : '—'}</div>
                        <Link href={tourHref(r)} className="btn-book">Book now</Link>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
