'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Item = { id: number; image_url: string; alt_text?: string | null };

const defaults: Item[] = [
  { id: -1, image_url: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=400&auto=format&fit=crop', alt_text: 'Moment 1' },
  { id: -2, image_url: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?q=80&w=400&auto=format&fit=crop', alt_text: 'Moment 2' },
  { id: -3, image_url: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=400&auto=format&fit=crop', alt_text: 'Moment 3' },
  { id: -4, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400&auto=format&fit=crop', alt_text: 'Moment 4' },
  { id: -5, image_url: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=400&auto=format&fit=crop', alt_text: 'Moment 5' },
];

export default function PrimeMomentsGallery() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('moment_items')
        .select('id,image_url,alt_text,sort_order,status')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) {
        console.warn('PrimeMomentsGallery:', error.message);
        setNote(error.message);
        setItems(defaults);
        return;
      }
      const active = (data || []).filter((d: any) => d?.image_url && (!d.status || String(d.status).toLowerCase() === 'active'));
      setItems(active.length > 0 ? active.map((d: any) => ({ id: d.id, image_url: String(d.image_url), alt_text: d.alt_text || null })) : defaults);
    })();
  }, []);

  if (!items) {
    return (
      <section className="container prime-moments-section" style={{ marginTop: 40, marginBottom: 10 }}>
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div>
            <h2>Your <span>Desert Safari</span> Moments</h2>
            <p>See guest moments from Dubai desert safari, Abu Dhabi desert safari, dune buggy, quad bike, and private camp experiences across the UAE.</p>
          </div>
        </div>
        <div className="image-gallery prime-moments-gallery" style={{ minHeight: 160 }} />
      </section>
    );
  }

  return (
    <section className="container prime-moments-section" style={{ marginTop: 40, marginBottom: 10 }}>
      <div className="section-header" style={{ marginBottom: 0 }}>
        <div>
          <h2>Your <span>Prime Desert Safari</span> Moments</h2>
          <p>Take a look at the desert moments captured by our guests - they may just inspire your next adventure!</p>
        </div>
      </div>
      <div className="image-gallery prime-moments-gallery">
        {items.map((it, i) => (
          <img key={it.id} src={it.image_url} alt={it.alt_text || `Moment ${i + 1}`} loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
        ))}
      </div>
      {note ? <p style={{ color: '#b45309', fontSize: 12, marginTop: 8 }}>Moments CMS: {note}</p> : null}
    </section>
  );
}
