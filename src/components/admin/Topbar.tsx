'use client';

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="topbar">
      <h2>{title}</h2>
      <div className="user-info">
        <span style={{ fontWeight: 500, fontSize: '14px' }}>Admin User</span>
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" 
          alt="Admin" 
        />
      </div>
    </header>
  );
}
