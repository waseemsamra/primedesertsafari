'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [cmsOpen, setCmsOpen] = useState(pathname.startsWith('/admin/cms'));

  useEffect(() => {
    if (pathname.startsWith('/admin/cms')) setCmsOpen(true);
  }, [pathname]);

  const navItems = [
    { href: '/admin', label: 'Tours', icon: 'fas fa-map-marked-alt' },
    { href: '/admin/categories', label: 'Categories', icon: 'fas fa-tags' },
    { href: '/admin/users', label: 'Users', icon: 'fas fa-users' },
    { href: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
    { href: '/admin/profile', label: 'Profile', icon: 'fas fa-user-circle' },
  ];

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));

  return (
    <aside className="sidebar">
      <div className="logo">
        <i className="fas fa-mountain"></i> Arabian Admin
      </div>
      <ul className="nav-links">
        {navItems.slice(0, 3).map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
              <i className={item.icon}></i> {item.label}
            </Link>
          </li>
        ))}

        <li className={`nav-group ${cmsOpen ? 'open' : ''}`}>
          <button type="button" className={`nav-group-toggle ${pathname.startsWith('/admin/cms') ? 'active' : ''}`} onClick={() => setCmsOpen((v) => !v)}>
            <span><i className="fas fa-layer-group"></i> CMS</span>
            <i className={`fas fa-chevron-${cmsOpen ? 'down' : 'right'} nav-chevron`}></i>
          </button>
          {cmsOpen && (
            <ul className="sub-nav-links">
              <li>
                <Link href="/admin/cms/hero" className={isActive('/admin/cms/hero') ? 'active' : ''}>
                  <i className="fas fa-images"></i> Hero Management
                </Link>
              </li>
            </ul>
          )}
        </li>

        {navItems.slice(3).map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={isActive(item.href) ? 'active' : ''}>
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
