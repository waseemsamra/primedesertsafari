'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(pathname === '/admin/login');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true);
      return;
    }
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!data.session) {
        router.replace('/admin/login');
        return;
      }
      setReady(true);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname !== '/admin/login') router.replace('/admin/login');
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins, sans-serif', color: '#64748b' }}>
        Checking session...
      </div>
    );
  }
  return <>{children}</>;
}
