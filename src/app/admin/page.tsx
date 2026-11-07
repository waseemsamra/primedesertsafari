'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Tour { id: number; title?: string | null; name?: string | null; category?: string | null; location?: string | null; price?: number | null; status?: string | null; slug?: string | null; }
interface Category { id: number; name: string; }
interface LocationItem { id: number; name: string; status?: string | null; }
interface AdminUser { id: number; email: string; name?: string | null; role?: string | null; status?: string | null; created_at?: string | null; }

const tourName = (t: Tour) => t.title || t.name || 'Untitled';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tours');
  const [pageTitle, setPageTitle] = useState('Manage Tours');
  const [cmsOpen, setCmsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationsError, setLocationsError] = useState('');

  // Category Modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [savingCategory, setSavingCategory] = useState(false);

  // Location Modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [locationForm, setLocationForm] = useState({ name: '' });
  const [savingLocation, setSavingLocation] = useState(false);

  // User Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'admin', status: 'Active' });
  const [savingUser, setSavingUser] = useState(false);

  const load = async () => {
    setLoading(true); setError(''); setLocationsError('');
    const [tRes, cRes, lRes, uRes] = await Promise.all([
      supabase.from('tours').select('id,title,category,location,price,status,slug,image_url').order('id', { ascending: false }),
      supabase.from('categories').select('id,name').order('name'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('admin_users').select('id,email,name,role,status,created_at').order('id', { ascending: false }),
    ]);
    const missing = (msg?: string) => /relation .* does not exist|schema cache|Could not find the table|PGRST205/i.test(msg || '');
    const errs: string[] = [];
    if (tRes.error) errs.push(tRes.error.message);
    if (cRes.error && !missing(cRes.error.message)) errs.push(`Categories: ${cRes.error.message}`);
    if (lRes.error) {
      const msg = lRes.error.message || 'Failed to load locations';
      setLocationsError(missing(msg) ? `${msg} — Run supabase/tours_schema.sql in Supabase SQL Editor, then run: NOTIFY pgrst, 'reload schema';` : msg);
      if (!missing(msg)) errs.push(`Locations: ${msg}`);
    }
    if (uRes.error && !missing(uRes.error.message)) errs.push(`Users: ${uRes.error.message}`);
    const toursData = (tRes.data as Tour[]) || [];
    let cats = (cRes.data as Category[]) || [];
    if ((!cats.length || cRes.error) && toursData.length) {
      const names = Array.from(new Set(toursData.map((x) => x.category).filter(Boolean))) as string[];
      if (names.length) cats = names.sort((a,b)=>a.localeCompare(b)).map((name, i) => ({ id: i + 1, name }));
    }
    if (cRes.error && missing(cRes.error.message)) {
      errs.push(`Categories table missing (${cRes.error.message}). Run supabase/tours_schema.sql in Supabase SQL Editor, then run: NOTIFY pgrst, 'reload schema'; using tour categories as fallback.`);
    }
    setError(errs.filter(Boolean).join(' | '));
    setTours(toursData);
    setCategories(cats);
    setLocations(((lRes.data as LocationItem[]) || []).map((l) => ({ id: l.id, name: l.name, status: l.status || 'Active' })));
    setUsers((uRes.data as AdminUser[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleNavClick = (tab: string, title: string) => { setActiveTab(tab); setPageTitle(title); };

  const deleteTour = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tour?')) return;
    const { error: err } = await supabase.from('tours').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setTours((t) => t.filter((x) => x.id !== id));
  };

  // Category CRUD
  const openCategoryModal = () => { setEditingCategory(null); setCategoryForm({ name: '' }); setShowCategoryModal(true); };
  const editCategory = (category: Category) => { setEditingCategory(category); setCategoryForm({ name: category.name }); setShowCategoryModal(true); };
  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category? Tours in this category will keep their category text.')) return;
    const { error: err } = await supabase.from('categories').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setCategories((c) => c.filter((x) => x.id !== id));
  };
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingCategory(true);
    const name = categoryForm.name.trim();
    if (editingCategory) {
      const oldName = editingCategory.name;
      const { error: err } = await supabase.from('categories').update({ name }).eq('id', editingCategory.id);
      if (err) { alert(err.message); setSavingCategory(false); return; }
      await supabase.from('tours').update({ category: name }).eq('category', oldName);
      setCategories((c) => c.map((x) => x.id === editingCategory.id ? { ...x, name } : x));
      setTours((t) => t.map((x) => x.category === oldName ? { ...x, category: name } : x));
    } else {
      const { data, error: err } = await supabase.from('categories').insert({ name }).select('id,name').single();
      if (err) { alert(err.message); setSavingCategory(false); return; }
      if (data) setCategories((c) => [...c, data as Category].sort((a,b)=>a.name.localeCompare(b.name)));
    }
    setSavingCategory(false); setShowCategoryModal(false);
  };

  // Location CRUD
  const openLocationModal = () => { setEditingLocation(null); setLocationForm({ name: '' }); setShowLocationModal(true); };
  const editLocation = (l: LocationItem) => { setEditingLocation(l); setLocationForm({ name: l.name }); setShowLocationModal(true); };
  const deleteLocation = async (id: number) => {
    if (!confirm('Delete this location? Tours using it will keep their location text.')) return;
    const { error: err } = await supabase.from('locations').delete().eq('id', id);
    if (err) { alert(err.message + ' (Run supabase/tours_schema.sql to create locations table.)'); return; }
    setLocations((l) => l.filter((x) => x.id !== id));
  };
  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingLocation(true);
    const name = locationForm.name.trim();
    if (editingLocation) {
      const oldName = editingLocation.name;
      const { error: err } = await supabase.from('locations').update({ name }).eq('id', editingLocation.id);
      if (err) { alert(err.message); setSavingLocation(false); return; }
      await supabase.from('tours').update({ location: name }).eq('location', oldName);
      setLocations((l) => l.map((x) => x.id === editingLocation.id ? { ...x, name } : x));
      setTours((t) => t.map((x) => x.location === oldName ? { ...x, location: name } : x));
    } else {
      const { data, error: err } = await supabase.from('locations').insert({ name }).select('id,name,status').single();
      if (err) { alert(err.message + ' (Run supabase/tours_schema.sql to create locations table.)'); setSavingLocation(false); return; }
      if (data) setLocations((l) => [...l, data as LocationItem].sort((a,b)=>a.name.localeCompare(b.name)));
    }
    setSavingLocation(false); setShowLocationModal(false);
  };

  // User CRUD
  const openUserModal = () => { setEditingUser(null); setUserForm({ name: '', email: '', role: 'admin', status: 'Active' }); setShowUserModal(true); };
  const editUser = (u: AdminUser) => { setEditingUser(u); setUserForm({ name: u.name || '', email: u.email, role: u.role || 'admin', status: u.status || 'Active' }); setShowUserModal(true); };
  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user entry?')) return;
    const { error: err } = await supabase.from('admin_users').delete().eq('id', id);
    if (err) { alert(err.message); return; }
    setUsers((u) => u.filter((x) => x.id !== id));
  };
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingUser(true);
    const payload = { name: userForm.name.trim() || null, email: userForm.email.trim(), role: userForm.role, status: userForm.status };
    if (editingUser) {
      const { error: err } = await supabase.from('admin_users').update(payload).eq('id', editingUser.id);
      if (err) { alert(err.message); setSavingUser(false); return; }
      setUsers((u) => u.map((x) => x.id === editingUser.id ? { ...x, ...payload } : x));
    } else {
      const { data, error: err } = await supabase.from('admin_users').insert(payload).select('id,email,name,role,status,created_at').single();
      if (err) { alert(err.message + (err.message.includes('admin_users') ? ' (Run supabase/tours_schema.sql to create the admin_users table.)' : '')); setSavingUser(false); return; }
      if (data) setUsers((u) => [data as AdminUser, ...u]);
    }
    setSavingUser(false); setShowUserModal(false);
  };

  const tourCounts = useMemo(() => {
    const m = new Map<string, number>();
    tours.forEach((t) => { if (t.category) m.set(t.category, (m.get(t.category) || 0) + 1); });
    return m;
  }, [tours]);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`
        :root { --primary:#f6a821; --primary-hover:#e09415; --dark:#1e293b; --light:#f8fafc; --gray:#64748b; --border:#e2e8f0; --danger:#ef4444; --success:#10b981; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
        body { background:var(--light); color:var(--dark); height:100vh; overflow:hidden; }
        a { text-decoration:none; color:inherit; } ul { list-style:none; }
        .admin-wrapper { display:flex; height:100vh; width:100%; }
        .sidebar { width:260px; background:var(--dark); color:#fff; display:flex; flex-direction:column; }
        .logo { padding:25px; font-size:20px; font-weight:700; display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(255,255,255,0.1); }
        .logo i { color:var(--primary); }
        .nav-links { padding:20px 0; flex:1; }
        .nav-links li a { display:flex; align-items:center; gap:15px; padding:15px 25px; font-size:15px; color:#cbd5e1; cursor:pointer; }
        .nav-links li a:hover,.nav-links li a.active { background:rgba(255,255,255,0.05); color:var(--primary); border-left:4px solid var(--primary); }
        .nav-group-toggle { width:100%; display:flex; align-items:center; justify-content:space-between; gap:15px; padding:15px 25px; font-size:15px; color:#cbd5e1; background:transparent; border:0; cursor:pointer; text-align:left; font-family:inherit; }
        .nav-group-toggle span { display:flex; align-items:center; gap:15px; }
        .nav-group-toggle:hover,.nav-group-toggle.active { background:rgba(255,255,255,0.05); color:var(--primary); border-left:4px solid var(--primary); }
        .sub-nav-links { padding:0 0 8px; }
        .sub-nav-links li a { padding:11px 25px 11px 52px; font-size:14px; }
        .sidebar-footer { padding:20px; border-top:1px solid rgba(255,255,255,0.1); }
        .sidebar-footer a { display:flex; align-items:center; gap:10px; color:#cbd5e1; cursor:pointer; }
        .main-content { flex:1; display:flex; flex-direction:column; overflow-y:auto; }
        .topbar { background:#fff; padding:20px 30px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); }
        .topbar h2 { font-size:20px; font-weight:600; }
        .user-info { display:flex; align-items:center; gap:15px; }
        .user-info img { width:40px; height:40px; border-radius:50%; object-fit:cover; }
        .page-container { padding:30px; display:none; } .page-container.active { display:block; }
        .header-actions { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; gap:12px; }
        .btn { padding:10px 20px; border-radius:8px; border:none; cursor:pointer; font-weight:500; display:inline-flex; align-items:center; gap:8px; font-size:14px; }
        .btn-primary { background:var(--primary); color:#fff; } .btn-primary:hover { background:var(--primary-hover); }
        .btn-secondary { background:#e2e8f0; color:var(--dark); }
        .table-container { background:#fff; border-radius:10px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); overflow:hidden; }
        table { width:100%; border-collapse:collapse; text-align:left; }
        th { background:#f8fafc; padding:15px 20px; font-size:13px; text-transform:uppercase; color:var(--gray); font-weight:600; border-bottom:1px solid var(--border); }
        td { padding:15px 20px; border-bottom:1px solid var(--border); font-size:14px; vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        .badge { padding:4px 10px; border-radius:20px; font-size:12px; font-weight:500; }
        .badge-active { background:#d1fae5; color:var(--success); } .badge-inactive { background:#fee2e2; color:var(--danger); }
        .action-btns { display:flex; gap:8px; }
        .icon-btn { width:30px; height:30px; border-radius:6px; border:none; cursor:pointer; display:inline-flex; justify-content:center; align-items:center; }
        .btn-edit { background:#e0f2fe; color:#0284c7; } .btn-delete { background:#fee2e2; color:var(--danger); }
        .form-card { background:#fff; padding:30px; border-radius:10px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); max-width:800px; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px; }
        .form-group { margin-bottom:20px; } .form-group label { display:block; font-size:14px; font-weight:500; margin-bottom:8px; }
        .form-group input,.form-group select,.form-group textarea { width:100%; padding:12px; border:1px solid var(--border); border-radius:8px; outline:none; font-size:14px; }
        .profile-header { display:flex; align-items:center; gap:20px; margin-bottom:30px; }
        .profile-avatar { width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid var(--primary); }
        .avatar-upload { position:relative; } .avatar-upload input { position:absolute; opacity:0; width:100%; height:100%; cursor:pointer; top:0; left:0; }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; }
        .modal { background:#fff; width:500px; max-width:calc(100% - 24px); border-radius:12px; padding:25px; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .close-modal { cursor:pointer; background:none; border:none; font-size:20px; color:var(--gray); }
        .modal-footer { display:flex; justify-content:flex-end; gap:10px; margin-top:25px; }
      `}</style>

      <div className="admin-wrapper">
        <aside className="sidebar">
          <div className="logo"><i className="fas fa-mountain"></i> Arabian Admin</div>
          <ul className="nav-links">
            <li><a className={activeTab === 'tours' ? 'active' : ''} onClick={() => handleNavClick('tours', 'Manage Tours')}><i className="fas fa-map-marked-alt"></i> Tours</a></li>
            <li><a className={activeTab === 'categories' ? 'active' : ''} onClick={() => handleNavClick('categories', 'Manage Categories')}><i className="fas fa-tags"></i> Categories</a></li>
            <li><a className={activeTab === 'users' ? 'active' : ''} onClick={() => handleNavClick('users', 'Manage Users')}><i className="fas fa-users"></i> Users</a></li>
            <li>
              <button type="button" className={`nav-group-toggle ${cmsOpen ? 'active' : ''}`} onClick={() => setCmsOpen((v) => !v)}>
                <span><i className="fas fa-layer-group"></i> CMS</span>
                <i className={`fas fa-chevron-${cmsOpen ? 'down' : 'right'}`} style={{ fontSize: 11 }}></i>
              </button>
              {cmsOpen ? <ul className="sub-nav-links"><li><Link href="/admin/cms/hero"><i className="fas fa-images"></i> Hero Management</Link></li><li><Link href="/admin/cms/experiences"><i className="fas fa-circle-notch"></i> Our Experiences</Link></li></ul> : null}
            </li>
            <li><a className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleNavClick('settings', 'Settings')}><i className="fas fa-cog"></i> Settings</a></li>
            <li><a className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleNavClick('profile', 'My Profile')}><i className="fas fa-user-circle"></i> Profile</a></li>
          </ul>
          <div className="sidebar-footer"><a onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login'; }}><i className="fas fa-sign-out-alt"></i> Logout</a></div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <h2>{pageTitle}</h2>
            <div className="user-info"><span style={{ fontWeight: 500, fontSize: '14px' }}>Admin User</span><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Admin" /></div>
          </header>

          <div className={`page-container ${activeTab === 'tours' ? 'active' : ''}`}>
            <div className="header-actions">
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Manage all your safari and city tours here. {error ? <span style={{ color: 'var(--danger)' }}>({error})</span> : null}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" onClick={load} type="button"><i className="fas fa-rotate"></i> Refresh</button>
                <Link href="/admin/add-tour" className="btn btn-primary"><i className="fas fa-plus"></i> Add New Tour</Link>
              </div>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Tour Name</th><th>Category</th><th>Location</th><th>Price (AED)</th><th>Status</th><th>Trending</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={7} style={{ padding: 24, color: 'var(--gray)' }}>Loading tours...</td></tr>
                  : tours.length === 0 ? <tr><td colSpan={7} style={{ padding: 24, color: 'var(--gray)' }}>No tours found. <Link href="/admin/add-tour" style={{ color: 'var(--primary)' }}>Add one</Link>.</td></tr>
                  : tours.map(tour => (
                    <tr key={tour.id}>
                      <td><strong><Link href={`/tour/${tour.slug || tour.id}`} style={{ color: 'inherit' }}>{tourName(tour)}</Link></strong></td>
                      <td>{tour.category || '—'}</td>
                      <td>{tour.location || '—'}</td>
                      <td>{tour.price != null ? Number(tour.price).toLocaleString() : '—'}</td>
                      <td><span className={`badge ${(tour.status || 'Active') === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{tour.status || 'Active'}</span></td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={!!tour.is_trending} title="Show in Trending Attractions" onChange={async (e) => {
                        const checked = e.target.checked;
                        setTours((ts) => ts.map((x) => x.id === tour.id ? { ...x, is_trending: checked } : x));
                        const { error: err } = await supabase.from('tours').update({ is_trending: checked }).eq('id', tour.id);
                        if (err) { alert(err.message + (err.message.includes('is_trending') ? " (Run: ALTER TABLE tours ADD COLUMN IF NOT EXISTS is_trending boolean default false; NOTIFY pgrst, 'reload schema';)" : '')); setTours((ts) => ts.map((x) => x.id === tour.id ? { ...x, is_trending: !checked } : x)); }
                      }} /></td>
                      <td className="action-btns">
                        <Link className="icon-btn btn-edit" href={`/admin/add-tour?id=${tour.id}`} title="Edit"><i className="fas fa-edit"></i></Link>
                        <button className="icon-btn btn-delete" onClick={() => deleteTour(tour.id)} title="Delete" type="button"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`page-container ${activeTab === 'categories' ? 'active' : ''}`}>
            <div className="header-actions">
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Manage tour categories.</p>
              <button className="btn btn-primary" onClick={openCategoryModal} type="button"><i className="fas fa-plus"></i> Add Category</button>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Category Name</th><th>Total Tours</th><th>Actions</th></tr></thead>
                <tbody>
                  {categories.length === 0 ? <tr><td colSpan={3} style={{ padding: 24, color: 'var(--gray)' }}>No categories found.</td></tr>
                  : categories.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.name}</strong></td>
                      <td>{tourCounts.get(cat.name) || 0} Tours</td>
                      <td className="action-btns">
                        <button className="icon-btn btn-edit" onClick={() => editCategory(cat)} type="button"><i className="fas fa-edit"></i></button>
                        <button className="icon-btn btn-delete" onClick={() => deleteCategory(cat.id)} type="button"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`page-container ${activeTab === 'users' ? 'active' : ''}`}>
            <div className="header-actions">
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Manage admin users. (Auth login uses Supabase Auth; entries here are for admin records.)</p>
              <button className="btn btn-primary" onClick={openUserModal} type="button"><i className="fas fa-plus"></i> Add User</button>
            </div>
            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan={5} style={{ padding: 24, color: 'var(--gray)' }}>No users found. Add a user entry (requires <code>admin_users</code> table from <code>supabase/tours_schema.sql</code>).</td></tr>
                  : users.map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.name || '—'}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.role || 'admin'}</td>
                      <td><span className={`badge ${(u.status || 'Active') === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{u.status || 'Active'}</span></td>
                      <td className="action-btns">
                        <button className="icon-btn btn-edit" onClick={() => editUser(u)} type="button"><i className="fas fa-edit"></i></button>
                        <button className="icon-btn btn-delete" onClick={() => deleteUser(u.id)} type="button"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`page-container ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="header-actions" style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Manage tour locations (used in the tour location dropdown).</p>
              <button className="btn btn-primary" onClick={openLocationModal} type="button"><i className="fas fa-plus"></i> Add Location</button>
            </div>
            <div className="table-container" style={{ marginBottom: 24 }}>
              <table>
                <thead><tr><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {locations.length === 0 ? <tr><td colSpan={3} style={{ padding: 24, color: 'var(--gray)' }}>{locationsError ? <span style={{ color: 'var(--danger)' }}>{locationsError}</span> : <>No locations found. Run <code>supabase/tours_schema.sql</code> to create the <code>locations</code> table.</>}</td></tr>
                  : locations.map(loc => (
                    <tr key={loc.id}>
                      <td><strong>{loc.name}</strong></td>
                      <td><span className={`badge ${(loc.status || 'Active') === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{loc.status || 'Active'}</span></td>
                      <td className="action-btns">
                        <button className="icon-btn btn-edit" onClick={() => editLocation(loc)} type="button"><i className="fas fa-edit"></i></button>
                        <button className="icon-btn btn-delete" onClick={() => deleteLocation(loc.id)} type="button" disabled={loc.id < 1000000 && !Number.isInteger(loc.id) ? false : false}><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="form-card">
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Website Settings</h3>
              <div className="form-row">
                <div className="form-group"><label>Site Name</label><input type="text" defaultValue="Arabian Adventures" /></div>
                <div className="form-group"><label>Contact Email</label><input type="email" defaultValue="info@arabianadventures.ae" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone Number</label><input type="text" defaultValue="+971 800 272 2426" /></div>
                <div className="form-group"><label>Currency</label><select defaultValue="AED - UAE Dirham"><option>AED - UAE Dirham</option><option>USD - US Dollar</option></select></div>
              </div>
              <div className="form-group"><label>Office Address</label><textarea rows={3} defaultValue="Emirates Group Headquarters, Dubai, UAE"></textarea></div>
              <button className="btn btn-primary" onClick={() => alert('Settings saved successfully!')} type="button">Save Changes</button>
            </div>
          </div>

          <div className={`page-container ${activeTab === 'profile' ? 'active' : ''}`}>
            <div className="form-card">
              <div className="profile-header">
                <div className="avatar-upload"><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" className="profile-avatar" alt="Admin" /><input type="file" title="Change Avatar" /></div>
                <div><h3>Admin User</h3><p style={{ color: 'var(--gray)', fontSize: '14px' }}>Super Administrator</p></div>
              </div>
              <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Personal Information</h3>
              <div className="form-row">
                <div className="form-group"><label>First Name</label><input type="text" defaultValue="Admin" /></div>
                <div className="form-group"><label>Last Name</label><input type="text" defaultValue="User" /></div>
              </div>
              <div className="form-group"><label>Email Address</label><input type="email" defaultValue="admin@arabianadventures.ae" /></div>
              <button className="btn btn-primary" onClick={() => alert('Profile updated successfully!')} type="button">Update Profile</button>
            </div>
          </div>
        </main>
      </div>

      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3><button className="close-modal" onClick={() => setShowCategoryModal(false)} type="button">&times;</button></div>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group"><label>Category Name</label><input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))} required /></div>
              <div className="form-group">
                <label>Category Image (Upload or URL)</label>
                <input ref={(el) => { categoryImageRef.current = el; }} type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  setUploadingCategoryImage(true);
                  try {
                    const dataUrl = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result || '')); r.onerror = () => rej(new Error('read')); r.readAsDataURL(file); });
                    const up = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file: dataUrl, fileName: file.name }) });
                    const j = await up.json();
                    if (!up.ok || !j.url) throw new Error(j.error || 'Upload failed');
                    setCategoryForm((f) => ({ ...f, image_url: j.url }));
                  } catch (err: any) { alert(err?.message || 'Upload failed'); }
                  finally { setUploadingCategoryImage(false); if (categoryImageRef.current) categoryImageRef.current.value = ''; }
                }} />
                <span className="help-text">{uploadingCategoryImage ? 'Uploading to ImageKit...' : 'Upload from local drive (ImageKit) or paste URL below.'}</span>
                <input type="text" value={categoryForm.image_url} onChange={(e) => setCategoryForm((f) => ({ ...f, image_url: e.target.value }))} placeholder="https://... (uploaded URL appears here)" style={{ marginTop: 8 }} />
                {categoryForm.image_url ? <img src={categoryForm.image_url} alt="Preview" style={{ marginTop: 10, width: 96, height: 96, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)' }} /> : null}
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={savingCategory || uploadingCategoryImage}>{savingCategory ? 'Saving...' : 'Save Category'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showLocationModal && (
        <div className="modal-overlay" onClick={() => setShowLocationModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingLocation ? 'Edit Location' : 'Add Location'}</h3><button className="close-modal" onClick={() => setShowLocationModal(false)} type="button">&times;</button></div>
            <form onSubmit={handleLocationSubmit}>
              <div className="form-group"><label>Location Name</label><input type="text" value={locationForm.name} onChange={(e) => setLocationForm({ name: e.target.value })} placeholder="e.g. Dubai" required /></div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowLocationModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={savingLocation}>{savingLocation ? 'Saving...' : 'Save Location'}</button></div>
            </form>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>{editingUser ? 'Edit User' : 'Add User'}</h3><button className="close-modal" onClick={() => setShowUserModal(false)} type="button">&times;</button></div>
            <form onSubmit={handleUserSubmit}>
              <div className="form-group"><label>Name</label><input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="Admin Name" /></div>
              <div className="form-group"><label>Email</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="admin@example.com" required /></div>
              <div className="form-row">
                <div className="form-group"><label>Role</label><select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select></div>
                <div className="form-group"><label>Status</label><select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={savingUser}>{savingUser ? 'Saving...' : 'Save User'}</button></div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
