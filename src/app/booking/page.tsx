'use client';

import { Suspense, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SignedImage from '@/components/SignedImage';

type Tour = {
  title: string | null;
  image_url: string | null;
  location: string | null;
  duration: string | null;
  price: number | null;
  package_options: string[] | null;
  vehicle_options: string[] | null;
  short_description: string | null;
};

function makeReference(): string {
  return 'PDS-' + Date.now().toString(36).toUpperCase();
}

function parseTravelers(s: string): { adults: number; children: number } {
  const a = s.match(/(\d+)\s*Adult/i);
  const c = s.match(/(\d+)\s*Child/i);
  return { adults: a ? Math.max(1, Number(a[1])) : 1, children: c ? Math.max(0, Number(c[1])) : 0 };
}

function BookingInner() {
  const sp = useSearchParams();
  const tourId = sp.get('id');
  const titleParam = sp.get('title') || '';
  const priceParam = sp.get('price') || '';
  const dateParam = sp.get('date') || '';
  const travelersParam = sp.get('travelers') || '';
  const packageParam = sp.get('package') || '';
  const vehicleParam = sp.get('vehicle') || '';
  const initial = parseTravelers(travelersParam);

  const [tour, setTour] = useState<Tour | null>(null);
  const [adults, setAdults] = useState(initial.adults);
  const [children, setChildren] = useState(initial.children);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', booking_date: dateParam, package_option: packageParam, vehicle_option: vehicleParam, notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState<null | { reference: string }>(null);

  useEffect(() => {
    if (!tourId) return;
    (async () => {
      const { data } = await supabase
        .from('tours')
        .select('title,image_url,location,duration,price,package_options,vehicle_options,short_description')
        .eq('id', tourId)
        .single();
      if (data) {
        const t = data as Tour;
        setTour(t);
        setForm((f) => ({
          ...f,
          package_option: f.package_option || (t.package_options?.[0] ?? ''),
          vehicle_option: f.vehicle_option || (t.vehicle_options?.[0] ?? ''),
        }));
      }
    })();
  }, [tourId]);

  const title = tour?.title || titleParam || 'Tour';
  const finalPrice = priceParam ? Number(priceParam) : tour?.price ?? null;
  const pkg = form.package_option || (tour?.package_options?.[0] ?? '');
  const veh = form.vehicle_option || (tour?.vehicle_options?.[0] ?? '');
  const travelersLabel = `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setMsg('Please enter your full name.'); return; }
    if (!form.phone.trim()) { setMsg('Please enter your phone number.'); return; }
    setSaving(true); setMsg('');
    const reference = makeReference();
    const payload = {
      reference,
      tour_id: tourId ? Number(tourId) : null,
      tour_title: title,
      package_option: pkg || null,
      vehicle_option: veh || null,
      booking_date: form.booking_date || null,
      travelers: travelersLabel,
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      amount: finalPrice != null ? finalPrice : null,
      currency: 'AED',
      status: 'Pending',
    };
    const { error } = await supabase.from('bookings').insert(payload);
    setSaving(false);
    if (error) { setMsg('Could not submit booking: ' + error.message); return; }
    setDone({ reference });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (done) {
    return (
      <div className="container" style={{ maxWidth: 680, padding: '70px 20px' }}>
        <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 20, padding: '48px 36px', textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.07)' }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontSize: 32 }}>
            <i className="fas fa-check" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10, color: 'var(--text-dark)' }}>Booking Generated</h1>
          <p style={{ color: 'var(--text-light)', fontSize: 16, marginBottom: 26 }}>Our team will contact you with confirmation voucher.</p>
          <div style={{ display: 'inline-block', background: 'var(--bg-light)', border: '1px dashed var(--primary-yellow)', borderRadius: 12, padding: '16px 30px', marginBottom: 28 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-light)', marginBottom: 4 }}>Booking Reference</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary-yellow)' }}>{done.reference}</div>
          </div>
          <div style={{ color: 'var(--text-light)', fontSize: 14, lineHeight: 1.7 }}>
            <div><strong style={{ color: 'var(--text-dark)' }}>{title}</strong></div>
            {finalPrice != null && <div>Final Price: <strong>AED {finalPrice.toLocaleString()}</strong></div>}
          </div>
          <div style={{ marginTop: 30 }}>
            <Link href="/" style={{ display: 'inline-block', padding: '13px 34px', background: 'var(--primary-yellow)', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 1120, padding: '36px 20px 90px' }}>
      <style>{`@media (max-width: 880px){ .bk-grid{ grid-template-columns: 1fr !important; } .bk-summary{ position: static !important; } }`}</style>
      <nav style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 18 }}>
        <Link href="/">Home</Link> &nbsp;&rsaquo;&nbsp; {tourId ? <Link href={`/tour/${tourId}`}>{(title || '').slice(0, 42)}</Link> : 'Booking'} &nbsp;&rsaquo;&nbsp; Booking
      </nav>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 27, fontWeight: 700, marginBottom: 4 }}>Complete Your Booking</h1>
        <p style={{ color: 'var(--text-light)' }}>Enter your details and confirm. No payment now — our team confirms availability first.</p>
      </div>

      <div className="bk-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,0.9fr)', gap: 26, alignItems: 'start' }}>
        {/* Left: form */}
        <form onSubmit={submit} style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: 16, padding: 28, boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 18 }}>Customer Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Full Name *</label>
              <input style={inp} type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required placeholder="Your full name" />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div>
              <label style={lbl}>Phone Number *</label>
              <input style={inp} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+971 50 000 0000" />
            </div>
            <div>
              <label style={lbl}>Booking Date</label>
              <input style={inp} type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Guests</label>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, background: '#fafafa', padding: '6px 10px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ fontSize: 14 }}>Adults</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button" onClick={() => setAdults((a) => Math.max(1, a - 1))} style={stepBtn}>−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{adults}</span>
                    <button type="button" onClick={() => setAdults((a) => a + 1)} style={stepBtn}>+</button>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 14 }}>Children</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button type="button" onClick={() => setChildren((c) => Math.max(0, c - 1))} style={stepBtn}>−</button>
                    <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 700 }}>{children}</span>
                    <button type="button" onClick={() => setChildren((c) => c + 1)} style={stepBtn}>+</button>
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label style={lbl}>Package</label>
              <select style={inp} value={form.package_option} onChange={(e) => setForm({ ...form, package_option: e.target.value })}>
                <option value="">{tour?.package_options?.[0] || 'Select package'}</option>
                {(tour?.package_options || []).map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Vehicle</label>
              <select style={inp} value={form.vehicle_option} onChange={(e) => setForm({ ...form, vehicle_option: e.target.value })}>
                <option value="">{tour?.vehicle_options?.[0] || 'Select vehicle'}</option>
                {(tour?.vehicle_options || []).map((v, i) => <option key={i} value={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Notes</label>
              <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Anything we should know?" />
            </div>
          </div>
          {msg && <p style={{ color: '#e74c3c', marginTop: 12 }}>{msg}</p>}
          <button type="submit" disabled={saving} style={{ marginTop: 18, width: '100%', padding: '15px', background: 'var(--primary-yellow)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}>
            {saving ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>

        {/* Right: summary */}
        <aside className="bk-summary" style={{ position: 'sticky', top: 20, background: '#fff', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
          <div style={{ position: 'relative', width: '100%', height: 200, background: '#f1f5f9' }}>
            {tour?.image_url
              ? <SignedImage src={tour.image_url} alt={title} width={600} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}><i className="fas fa-image" style={{ fontSize: 34 }} /></div>}
          </div>
          <div style={{ padding: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{title}</h3>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', color: 'var(--text-light)', fontSize: 13, marginBottom: 14 }}>
              {tour?.location && <span><i className="fas fa-location-dot" /> {tour.location}</span>}
              {tour?.duration && <span><i className="fas fa-clock" /> {tour.duration}</span>}
            </div>
            {tour?.short_description && (
              <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 16 }}>
                {tour.short_description.length > 180 ? tour.short_description.slice(0, 180) + '…' : tour.short_description}
              </p>
            )}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, display: 'grid', gap: 10, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--text-light)' }}>Package</span><strong style={{ textAlign: 'right' }}>{pkg || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--text-light)' }}>Vehicle</span><strong style={{ textAlign: 'right' }}>{veh || '—'}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--text-light)' }}>Travelers</span><strong>{travelersLabel}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span style={{ color: 'var(--text-light)' }}>Date</span><strong>{form.booking_date || '—'}</strong></div>
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, color: 'var(--text-light)' }}>Final Price</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-dark)' }}>{finalPrice != null ? `AED ${finalPrice.toLocaleString()}` : 'On request'}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const lbl: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-dark)', marginBottom: 6 };
const inp: CSSProperties = { width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fafafa', outline: 'none', boxSizing: 'border-box' };
const stepBtn: CSSProperties = { width: 30, height: 30, borderRadius: 7, border: '1px solid var(--border-color)', background: '#fff', color: 'var(--text-dark)', fontSize: 16, fontWeight: 700, cursor: 'pointer', lineHeight: 1 };

export default function BookingPage() {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
        <BookingInner />
      </Suspense>
    </>
  );
}