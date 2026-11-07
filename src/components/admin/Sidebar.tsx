'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/admin', label: 'Tours', icon: 'fas fa-map-marked-alt' },
    { href: '/admin/categories', label: 'Categories', icon: 'fas fa-tags' },
    { href: '/admin/users', label: 'Users', icon: 'fas fa-users' },
    { href: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
    { href: '/admin/profile', label: 'Profile', icon: 'fas fa-user-circle' },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        <i className="fas fa-mountain"></i> Arabian Admin
      </div>
      <ul className="nav-links">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link 
              href={item.href} 
              className={pathname === item.href ? 'active' : ''}
            >
              <i className={item.icon}></i> {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <a onClick={() => alert('Logged out successfully!')}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </a>
      </div>
    </aside>
  );
}
