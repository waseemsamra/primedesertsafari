'use client';

import { useEffect, useRef, useState } from 'react';
import AdminStyles from '../../AdminStyles';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { supabase } from '@/lib/supabase';

type Item = { id: number; title: string; image_url: string; link_url?: string | null; sort_order?: number | null; status?: string | null };

async function uploadToImageKit(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
  const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: dataUrl, fileName: file.name }) });
  const json = await res.json();
  if (!res.ok || !json.url) throw new Error(json.error || 'Image upload failed');
  return json.url as string;
}

export default function ExperiencesManagementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | 'new' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '/', sort_order: '0', status: 'Active' });

  const load = async () => {
    setLoading(true); setMsg('');
    const { data, error } = await supabase.from('experience_items').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true });
    if (error) setMsg(error.message.includes('experience_items') || error.message.includes('schema cache') ? `${error.message} (Run experience_items SQL in supabase/tours_schema.sql.)` : error.message);
    setItems((data as Item[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setEditing(null); setForm({ title: '', image_url: '', link_url: '/', sort_order: String(items.length), status: 'Active' }); if (fileRef.current) fileRef.current.value = ''; };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setMsg('');
    try { setForm((f) => ({ ...f, image_url: await uploadToImageKit(files[0]) })); }
    catch (e: any) { setMsg(`Error: ${e?.message || 'Upload failed'}`); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setMsg('Error: Title is required.'); return; }
    if (!form.image_url.trim()) { setMsg('Error: Image is required (upload or paste URL).'); return; }
    setSavingId(editing ? editing.id : 'new'); setMsg('');
    const payload = { title: form.title.trim(), image_url: form.image_url.trim(), link_url: form.link_url.trim() || null, sort_order: Number(form.sort_order) || 0, status: form.status };
    const res = editing ? await supabase.from('experience_items').update(payload).eq('id', editing.id).select('*').single() : await supabase.from('experience_items').insert(payload).select('*').single();
    setSavingId(null);
    if (res.error) { setMsg(`Error: ${res.error.message}`); return; }
    if (res.data) setItems((s) => (editing ? s.map((x) => x.id === editing.id ? res.data as Item : x) : [...s, res.data as Item]).sort((a,b)=> (a.sort_order||0)-(b.sort_order||0) || a.id-b.id));
    reset();
  };

  const edit = (it: Item) => { setEditing(it); setForm({ title: it.title || '', image_url: it.image_url || '', link_url: it.link_url || '/', sort_order: String(it.sort_order ?? 0), status: it.status || 'Active' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async (id: number) => { if (!confirm('Delete this experience item?')) return; const { error } = await supabase.from('experience_items').delete().eq('id', id); if (error) { alert(error.message); return; } setItems((s) => s.filter((x) => x.id !== id)); };

  return (
    <>
      <AdminStyles />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="admin-wrapper">
        <Sidebar />
        <main className="main-content">
          <Topbar title="CMS - Our Experiences" />
          <div className="page-container">
            <div className="form-section">
              <h3 className="section-title"><i className="fas fa-circle-notch"></i> {editing ? 'Edit Experience' : 'Add Experience'}</h3>
              <form onSubmit={save}>
                <div className="form-row">
                  <div className="form-group"><label>Title</label><input type="text" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} placeholder="e.g. Desert Safaris" required /></div>
                  <div className="form-group"><label>Link URL</label><input type="text" value={form.link_url} onChange={(e)=>setForm({...form,link_url:e.target.value})} placeholder="/category/desert-adventures" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Image Upload (ImageKit)</label><input ref={fileRef} type="file" accept="image/*" onChange={(e)=>onUpload(e.target.files)} /><span className="help-text">{uploading ? 'Uploading to ImageKit...' : 'Upload from local drive, or paste image URL below.'}</span></div>
                  <div className="form-group"><label>Image URL</label><input type="text" value={form.image_url} onChange={(e)=>setForm({...form,image_url:e.target.value})} placeholder="https://..." required /></div>
                </div>
                {form.image_url ? <div style={{ marginBottom: 16 }}><img src={form.image_url} alt="Preview" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border)' }} /></div> : null}
                <div className="form-row">
                  <div className="form-group"><label>Sort Order</label><input type="number" value={form.sort_order} onChange={(e)=>setForm({...form,sort_order:e.target.value})} /></div>
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {editing && <button type="button" className="btn btn-secondary" onClick={reset}>Cancel</button>}
                  <button type="submit" className="btn btn-primary" disabled={!!savingId || uploading}><i className="fas fa-save"></i> {savingId ? 'Saving...' : editing ? 'Update' : 'Add Experience'}</button>
                </div>
              </form>
              {msg && <p style={{ marginTop: 10, color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>{msg}</p>}
            </div>
            <div className="form-section">
              <h3 className="section-title"><i className="fas fa-layer-group"></i> Our Experiences Items</h3>
              {loading ? <p style={{ color: 'var(--gray)' }}>Loading...</p> : items.length === 0 ? <p style={{ color: 'var(--gray)' }}>No items yet.</p> : (
                <div className="cms-hero-grid">
                  {items.map((it) => (
                    <div className="cms-slide-card" key={it.id}>
                      <div className="cms-slide-preview" style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden' }}>{it.image_url ? <img src={it.image_url} alt={it.title} /> : <i className="fas fa-image"></i>}</div>
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}><strong>{it.title}</strong><span className={`badge ${(it.status||'Active')==='Active'?'badge-active':'badge-inactive'}`}>{it.status||'Active'}</span><span style={{ color: 'var(--gray)', fontSize: 12 }}>Order: {it.sort_order ?? 0}</span></div>
                        <div style={{ color: 'var(--gray)', fontSize: 12, wordBreak: 'break-all' }}>{it.link_url || '—'}</div>
                        <div style={{ color: 'var(--gray)', fontSize: 12, wordBreak: 'break-all', marginTop: 4 }}>{it.image_url}</div>
                      </div>
                      <div className="cms-slide-actions">
                        <button className="btn btn-secondary btn-sm" type="button" onClick={()=>edit(it)}><i className="fas fa-edit"></i> Edit</button>
                        <button className="btn btn-danger btn-sm" type="button" onClick={()=>remove(it.id)}><i className="fas fa-trash"></i> Delete</button>
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
