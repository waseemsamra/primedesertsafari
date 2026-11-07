'use client';

import Topbar from '@/components/admin/Topbar';

export default function SettingsPage() {
  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <>
      <Topbar title="Settings" />
      <div className="page-container">
        <div className="form-card">
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            Website Settings
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>Site Name</label>
              <input type="text" defaultValue="Arabian Adventures" />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" defaultValue="info@arabianadventures.ae" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" defaultValue="+971 800 272 2426" />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select defaultValue="AED - UAE Dirham">
                <option>AED - UAE Dirham</option>
                <option>USD - US Dollar</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Office Address</label>
            <textarea rows={3} defaultValue="Emirates Group Headquarters, Dubai, UAE"></textarea>
          </div>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
