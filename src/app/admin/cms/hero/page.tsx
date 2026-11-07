'use client';

import { useEffect, useRef, useState } from 'react';
import AdminStyles from '../../AdminStyles';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { supabase } from '@/lib/supabase';

type Slide = {
  id: number;
  title?: string | null;
  description?: string | null;
  image_url: string;
  button_text?: string | null;
  button_link?: string | null;
  sort_order?: number | null;
  status?: string | null;
};

async function uploadToImageKit(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: dataUrl, fileName: file.name }),
  });
  const json = await res.json();
  if (!res.ok || !json.url) throw new Error(json.error || 'Image upload failed');
  return json.url as string;
}

export default function HeroManagementPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    button_text: 'Book now',
    button_link: '/',
    sort_order: '0',
    status: 'Active',
  });
  const [editing, setEditing] = useState<Slide | null>(null);

  const load = async () => {
    setLoading(true); setMsg('');
    const { data, error } = await supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    if (error) setMsg(error.message.includes('hero_slides') ? `${error.message} (Run the hero_slides SQL in supabase/tours_schema.sql.)` : error.message);
    setSlides((data as Slide[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ title: '', description: '', image_url: '', button_text: 'Book now', button_link: '/', sort_order: String(slides.length), status: 'Active' });
    if (fileRef.current) fileRef.current.value = '';
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setMsg('');
    try {
      const url = await uploadToImageKit(files[0]);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (e: any) { setMsg(`Error: ${e?.message || 'Upload failed'}`); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) { setMsg('Error: Slide image is required (upload or paste URL).'); return; }
    setSavingId(editing ? editing.id : 'new'); setMsg('');
    const payload = {
      title: form.title.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim(),
      button_text: form.button_text.trim() || 'Book now',
      button_link: form.button_link.trim() || '/',
      sort_order: Number(form.sort_order) || 0,
      status: form.status,
    };
    const res = editing
      ? await supabase.from('hero_slides').update(payload).eq('id', editing.id).select('*').single()
      : await supabase.from('hero_slides').insert(payload).select('*').single();
    setSavingId(null);
    if (res.error) { setMsg(`Error: ${res.error.message}`); return; }
    if (res.data) {
      setSlides((s) => {
        const next = editing ? s.map((x) => x.id === editing.id ? res.data as Slide : x) : [...s, res.data as Slide];
        return next.sort((a,b)=> (a.sort_order||0)-(b.sort_order||0) || a.id-b.id);
      });
    }
    resetForm();
  };

  const edit = (s: Slide) => {
    setEditing(s);
    setForm({
      title: s.title || '', description: s.description || '', image_url: s.image_url || '',
      button_text: s.button_text || 'Book now', button_link: s.button_link || '/', sort_order: String(s.sort_order ?? 0), status: s.status || 'Active',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this hero slide?')) return;
    const { error } = await supabase.from('hero_slides').delete().eq('id', id);
    if (error) { alert(error.message); return; }
    setSlides((s) => s.filter((x) => x.id !== id));
  };

  return (
    <>
      <AdminStyles />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="admin-wrapper">
        <Sidebar />
        <main className="main-content">
          <Topbar title="CMS - Hero Management" />
          <div className="page-container">
            <div className="form-section">
              <h3 className="section-title"><i className="fas fa-images"></i> {editing ? 'Edit Hero Slide' : 'Add Hero Slide'}</h3>
              <form onSubmit={save}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Slide Image (Upload from local drive)</label>
                    <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onUpload(e.target.files)} />
                    <span className="help-text">{uploading ? 'Uploading to ImageKit...' : 'Upload an image, or paste an image URL below.'}</span>
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://... (uploaded URL appears here)" required />
                  </div>
                </div>
                {form.image_url ? (
                  <div style={{ marginBottom: 16 }}>
                    <img src={form.image_url} alt="Preview" style={{ width: '100%', maxWidth: 520, height: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} />
                  </div>
                ) : null}
                <div className="form-row">
                  <div className="form-group"><label>Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Hero slide title" /></div>
                  <div className="form-group"><label>Description</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description" /></div>
                </div>
                <div className="form-row three-col">
                  <div className="form-group"><label>Button Text</label><input type="text" value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} /></div>
                  <div className="form-group"><label>Button Link</label><input type="text" value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} /></div>
                  <div className="form-group"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'end', gap: 10 }}>
                    {editing && <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel Edit</button>}
                    <button type="submit" className="btn btn-primary" disabled={!!savingId || uploading}><i className="fas fa-save"></i> {savingId ? 'Saving...' : editing ? 'Update Slide' : 'Add Slide'}</button>
                  </div>
                </div>
              </form>
              {msg && <p style={{ marginTop: 10, color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>{msg}</p>}
            </div>

            <div className="form-section">
              <h3 className="section-title"><i className="fas fa-layer-group"></i> Hero Slides</h3>
              {loading ? <p style={{ color: 'var(--gray)' }}>Loading...</p> : slides.length === 0 ? <p style={{ color: 'var(--gray)' }}>No hero slides yet. Add one above (run <code>hero_slides</code> SQL if the table is missing).</p> : (
                <div className="cms-hero-grid">
                  {slides.map((s) => (
                    <div className="cms-slide-card" key={s.id}>
                      <div className="cms-slide-preview">{s.image_url ? <img src={s.image_url} alt={s.title || 'Slide'} /> : <i className="fas fa-image"></i>}</div>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                          <strong>{s.title || 'Untitled slide'}</strong>
                          <span className={`badge ${(s.status || 'Active') === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{s.status || 'Active'}</span>
                          <span style={{ color: 'var(--gray)', fontSize: 12 }}>Order: {s.sort_order ?? 0}</span>
                        </div>
                        <div style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 6 }}>{s.description || '—'}</div>
                        <div style={{ color: 'var(--gray)', fontSize: 12, wordBreak: 'break-all' }}>{s.image_url}</div>
                      </div>
                      <div className="cms-slide-actions">
                        <button className="btn btn-secondary btn-sm" type="button" onClick={() => edit(s)}><i className="fas fa-edit"></i> Edit</button>
                        <button className="btn btn-danger btn-sm" type="button" onClick={() => remove(s.id)}><i className="fas fa-trash"></i> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
