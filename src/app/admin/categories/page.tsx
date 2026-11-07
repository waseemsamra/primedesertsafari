'use client';

import { useEffect, useRef, useState } from 'react';
import AdminStyles from '../AdminStyles';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { supabase } from '@/lib/supabase';

interface Category { id: number; name: string; image_url?: string | null; }
interface Tour { id: number; category?: string | null; }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', image_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true); setError('');
    const [cRes, tRes] = await Promise.all([
      supabase.from('categories').select('id,name,image_url').order('name'),
      supabase.from('tours').select('id,category'),
    ]);
    if (cRes.error) setError(cRes.error.message);
    setCategories((cRes.data as Category[]) || []);
    setTours((tRes.data as Tour[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const open = () => { setEditing(null); setForm({ name: '', image_url: '' }); setShowModal(true); };
  const edit = (c: Category) => { setEditing(c); setForm({ name: c.name, image_url: c.image_url || '' }); setShowModal(true); };
  const remove = async (id: number) => {
    if (!confirm('Delete this category? Tours in this category will keep their category text.')) return;
    const { error: err } = await supabase.from('categories').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setCategories((c) => c.filter((x) => x.id !== id));
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => rej(new Error('read')); r.readAsDataURL(file); });
      const up = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: dataUrl, fileName: file.name }) });
      const j = await up.json();
      if (!up.ok || !j.url) throw new Error(j.error || 'Upload failed');
      setForm((f) => ({ ...f, image_url: j.url }));
    } catch (e: any) { alert(e?.message || 'Upload failed'); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const name = form.name.trim();
    const image_url = form.image_url.trim() || null;
    if (editing) {
      const oldName = editing.name;
      const { error: err } = await supabase.from('categories').update({ name, image_url }).eq('id', editing.id);
      if (err) { alert(err.message); setSaving(false); return; }
      await supabase.from('tours').update({ category: name }).eq('category', oldName);
      setCategories((c) => c.map((x) => x.id === editing.id ? { ...x, name, image_url } : x));
    } else {
      const { data, error: err } = await supabase.from('categories').insert({ name, image_url }).select('id,name,image_url').single();
      if (err) { alert(err.message); setSaving(false); return; }
      if (data) setCategories((c) => [...c, data as Category].sort((a,b)=>a.name.localeCompare(b.name)));
    }
    setSaving(false); setShowModal(false);
  };

  return (
    <>
      <AdminStyles />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="admin-wrapper">
        <Sidebar />
        <main className="main-content">
          <Topbar title="Manage Categories" />
          <div className="page-container">
            <div className="header-actions">
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Manage tour categories and images. {error ? <span style={{ color: 'var(--danger)' }}>({error})</span> : null}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={load} type="button"><i className="fas fa-rotate"></i> Refresh</button>
                <button className="btn btn-primary" onClick={open} type="button"><i className="fas fa-plus"></i> Add Category</button>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Image</th><th>Category Name</th><th>Total Tours</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={4} style={{ padding: 24, color: 'var(--gray)' }}>Loading...</td></tr>
                  : categories.length === 0 ? <tr><td colSpan={4} style={{ padding: 24, color: 'var(--gray)' }}>No categories found.</td></tr>
                  : categories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.image_url ? <img src={cat.image_url} alt={cat.name} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} /> : <span style={{ color: 'var(--gray)' }}>—</span>}</td>
                      <td><strong>{cat.name}</strong></td>
                      <td>{tours.filter((t) => t.category === cat.name).length} Tours</td>
                      <td className="action-btns">
                        <button className="icon-btn btn-edit" onClick={() => edit(cat)} type="button"><i className="fas fa-edit"></i></button>
                        <button className="icon-btn btn-delete" onClick={() => remove(cat.id)} type="button"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editing ? 'Edit Category' : 'Add Category'}</h3><button className="close-modal" onClick={() => setShowModal(false)} type="button">&times;</button></div>
            <form onSubmit={submit}>
              <div className="form-group"><label>Category Name</label><input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group">
                <label>Category Image (Upload or URL)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
                <span className="help-text">{uploading ? 'Uploading to ImageKit...' : 'Upload from local drive (ImageKit) or paste URL below.'}</span>
                <input type="text" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://... (uploaded URL appears here)" style={{ marginTop: 8 }} />
                {form.image_url ? <img src={form.image_url} alt="Preview" style={{ marginTop: 10, width: 96, height: 96, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} /> : null}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Category'}</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
