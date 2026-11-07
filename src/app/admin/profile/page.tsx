'use client';

import Topbar from '@/components/admin/Topbar';

export default function ProfilePage() {
  const handleUpdate = () => {
    alert('Profile updated successfully!');
  };

  return (
    <>
      <Topbar title="Profile" />
      <div className="page-container">
        <div className="form-card">
          <div className="profile-header">
            <div className="avatar-upload">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" 
                className="profile-avatar" 
                alt="Profile" 
              />
              <input type="file" title="Change Avatar" />
            </div>
            <div>
              <h3>Admin User</h3>
              <p style={{ color: 'var(--gray)', fontSize: '14px' }}>Super Administrator</p>
            </div>
          </div>
          
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            Personal Information
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" defaultValue="Admin" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" defaultValue="User" />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" defaultValue="admin@arabianadventures.ae" />
          </div>
          
          <h3 style={{ margin: '30px 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            Change Password
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleUpdate}>
            Update Profile
          </button>
        </div>
      </div>
    </>
  );
}
