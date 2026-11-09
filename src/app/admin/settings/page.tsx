'use client';

import Topbar from '@/components/admin/Topbar';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('Madinat al Nojoom');
  const [contactEmail, setContactEmail] = useState('info@arabianadventures.ae');
  const [phone, setPhone] = useState('+971 800 272 2426');
  const [currency, setCurrency] = useState('AED - UAE Dirham');
  const [address, setAddress] = useState('Emirates Group Headquarters, Dubai, UAE');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pd_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSiteName(parsed.site_name || 'Madinat al Nojoom');
        setContactEmail(parsed.contact_email || 'info@arabianadventures.ae');
        setPhone(parsed.phone || '+971 800 272 2426');
        setCurrency(parsed.currency || 'AED - UAE Dirham');
        setAddress(parsed.address || 'Emirates Group Headquarters, Dubai, UAE');
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settings = { site_name: siteName, contact_email: contactEmail, phone, currency, address };
      localStorage.setItem('pd_settings', JSON.stringify(settings));
      setMsg('Settings saved successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg(`Error: ${err?.message || 'Save failed'}`);
    }
  };

  return (
    <>
      <Topbar title="Settings" />
      <div className="page-container">
        {msg && <p style={{ marginBottom: 12, color: msg.startsWith('Error') ? 'var(--danger)' : 'var(--success)' }}>{msg}</p>}
        <div className="form-card">
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            Website Settings
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>Site Name</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>AED - UAE Dirham</option>
                <option>USD - US Dollar</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Office Address</label>
            <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
