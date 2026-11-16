'use client';

import { useEffect, useState, type FormEvent } from 'react';
import AdminStyles from '../AdminStyles';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { supabase } from '@/lib/supabase';

type Booking = {
  id: number;
  reference: string | null;
  tour_id: number | null;
  tour_title: string | null;
  tour_slug: string | null;
  package_option: string | null;
  vehicle_option: string | null;
  booking_date: string | null;
  travelers: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  amount: number | null;
  currency: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
};

const STATUSES = ['Pending', 'Confirmed', 'Cancelled'] as const;

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
  booking_date: '',
  travelers: '',
  package_option: '',
  vehicle_option: '',
  amount: '',
  notes: '',
  status: 'Pending',
};

const fmtDate = (s?: string | null) => {
  if (!s) return '—';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const money = (b: Booking) =>
  b.amount != null ? `${b.currency || 'AED'} ${Number(b.amount).toLocaleString()}` : '—';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewItem, setViewItem] = useState<Booking | null>(null);
  const [editItem, setEditItem] = useState<Booking | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const { data, error: err } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    setBookings((data as Booking[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = (b: Booking) => {
    setEditItem(b);
    setForm({
      full_name: b.full_name || '',
      email: b.email || '',
      phone: b.phone || '',
      booking_date: b.booking_date || '',
      travelers: b.travelers || '',
      package_option: b.package_option || '',
      vehicle_option: b.vehicle_option || '',
      amount: b.amount != null ? String(b.amount) : '',
      notes: b.notes || '',
      status: b.status || 'Pending',
    });
    setMsg('');
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    if (!form.full_name.trim()) { setMsg('Error: Name is required.'); return; }
    setSaving(true); setMsg('');
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      booking_date: form.booking_date || null,
      travelers: form.travelers.trim() || null,
      package_option: form.package_option.trim() || null,
      vehicle_option: form.vehicle_option.trim() || null,
      amount: form.amount.trim() ? Number(form.amount) : null,
      notes: form.notes.trim() || null,
      status: form.status,
      updated_at: new Date().toISOString(),
    };
    const { data, error: err } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', editItem.id)
      .select('*')
      .single();
    setSaving(false);
    if (err) { setMsg(`Error: ${err.message}`); return; }
    if (data) setBookings((s) => s.map((x) => (x.id === editItem.id ? (data as Booking) : x)));
    setEditItem(null);
  };

  const quickStatus = async (b: Booking, status: string) => {
    const { data, error: err } = await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', b.id)
      .select('*')
      .single();
    if (err) { alert(err.message); return; }
    if (data) setBookings((s) => s.map((x) => (x.id === b.id ? (data as Booking) : x)));
  };

  const remove = async (b: Booking) => {
    if (!confirm(`Delete booking ${b.reference || '#' + b.id}? This cannot be undone.`)) return;
    const { error: err } = await supabase.from('bookings').delete().eq('id', b.id);
    if (err) { alert(err.message); return; }
    setBookings((s) => s.filter((x) => x.id !== b.id));
  };

  return (
    <>
      <AdminStyles />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <div className="admin-wrapper">
        <Sidebar />
        <main className="main-content">
          <Topbar title="Manage Bookings" />
          <div className="page-container">
            <div className="header-actions">
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
                Booking requests. New bookings are <strong>Pending</strong> — only admin can Confirm or Cancel.
                {error ? <span style={{ color: 'var(--danger)' }}> ({error})</span> : null}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={load} type="button"><i className="fas fa-rotate"></i> Refresh</button>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Tour</th>
                    <th>Customer</th>
                    <th>Booking Date</th>
                    <th>Travelers</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={8} style={{ padding: 24, color: 'var(--gray)' }}>Loading...</td></tr>
                  : bookings.length === 0 ? <tr><td colSpan={8} style={{ padding: 24, color: 'var(--gray)' }}>No bookings yet.</td></tr>
                  : bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.reference || '#' + b.id}</strong></td>
                      <td>{b.tour_title || (b.tour_id ? `Tour #${b.tour_id}` : '—')}</td>
                      <td>
                        <div><strong>{b.full_name}</strong></div>
                        <div style={{ color: 'var(--gray)', fontSize: 12 }}>{b.email || b.phone || ''}</div>
                      </td>
                      <td>{fmtDate(b.booking_date)}</td>
                      <td>{b.travelers || '—'}</td>
                      <td>{money(b)}</td>
                      <td><span className={`badge badge-${(b.status || 'Pending').toLowerCase()}`}>{b.status || 'Pending'}</span></td>
                      <td className="action-btns">
                        <button className="icon-btn btn-view" title="View" type="button" onClick={() => setViewItem(b)}><i className="fas fa-eye"></i></button>
                        <button className="icon-btn btn-edit" title="Edit" type="button" onClick={() => openEdit(b)}><i className="fas fa-edit"></i></button>
                        <button className="icon-btn btn-delete" title="Delete" type="button" onClick={() => remove(b)}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking {viewItem.reference || '#' + viewItem.id}</h3>
              <button className="close-modal" onClick={() => setViewItem(null)} type="button">&times;</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', fontSize: 14 }}>
              <div><span style={{ color: 'var(--gray)' }}>Status</span><br /><span className={`badge badge-${(viewItem.status || 'Pending').toLowerCase()}`}>{viewItem.status}</span></div>
              <div><span style={{ color: 'var(--gray)' }}>Created</span><br />{fmtDate(viewItem.created_at)}</div>
              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--gray)' }}>Tour</span><br />{viewItem.tour_title || '—'}</div>
              <div><span style={{ color: 'var(--gray)' }}>Name</span><br />{viewItem.full_name}</div>
              <div><span style={{ color: 'var(--gray)' }}>Phone</span><br />{viewItem.phone || '—'}</div>
              <div><span style={{ color: 'var(--gray)' }}>Email</span><br />{viewItem.email || '—'}</div>
              <div><span style={{ color: 'var(--gray)' }}>Booking Date</span><br />{fmtDate(viewItem.booking_date)}</div>
              <div><span style={{ color: 'var(--gray)' }}>Travelers</span><br />{viewItem.travelers || '—'}</div>
              <div><span style={{ color: 'var(--gray)' }}>Amount</span><br />{money(viewItem)}</div>
              <div><span style={{ color: 'var(--gray)' }}>Package</span><br />{viewItem.package_option || '—'}</div>
              <div><span style={{ color: 'var(--gray)' }}>Vehicle</span><br />{viewItem.vehicle_option || '—'}</div>
              <div style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--gray)' }}>Notes</span><br />{viewItem.notes || '—'}</div>
            </div>
            <div className="modal-footer">
              {viewItem.status === 'Pending' && (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => { quickStatus(viewItem, 'Confirmed'); setViewItem(null); }}><i className="fas fa-check"></i> Confirm</button>
                  <button type="button" className="btn btn-danger" onClick={() => { quickStatus(viewItem, 'Cancelled'); setViewItem(null); }}><i className="fas fa-xmark"></i> Cancel</button>
                </>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setViewItem(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="modal-overlay" onClick={() => setEditItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Booking {editItem.reference || '#' + editItem.id}</h3>
              <button className="close-modal" onClick={() => setEditItem(null)} type="button">&times;</button>
            </div>
            <form onSubmit={saveEdit}>
              <div className="form-row">
                <div className="form-group"><label>Full Name</label><input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
                <div className="form-group"><label>Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}><label>Email</label><input type="text" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Booking Date</label><input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} /></div>
                <div className="form-group"><label>Travelers</label><input type="text" value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Package</label><input type="text" value={form.package_option} onChange={(e) => setForm({ ...form, package_option: e.target.value })} /></div>
                <div className="form-group"><label>Vehicle</label><input type="text" value={form.vehicle_option} onChange={(e) => setForm({ ...form, vehicle_option: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Amount</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="help-text">Only admin can change status.</span>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}><label>Notes</label><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              {msg && <p style={{ color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)', marginBottom: 10 }}>{msg}</p>}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}