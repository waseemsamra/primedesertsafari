'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace('/admin');
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    if (data.session) router.replace('/admin');
  }

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`
        :root { --primary-yellow:#f6a821; --primary-hover:#e09415; --text-dark:#333; --text-light:#666; --border-color:#e0e0e0; --bg-color:#f4f7f6; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins',sans-serif; }
        body { background:var(--bg-color); min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
        .login-container { display:flex; width:100%; max-width:1100px; height:700px; background:#fff; border-radius:20px; box-shadow:0 20px 40px rgba(0,0,0,0.1); overflow:hidden; }
        .login-image { flex:1.2; position:relative; background:url('https://images.unsplash.com/photo-1547234935-80c7145ec969?q=80&w=1200&auto=format&fit=crop') center/cover no-repeat; }
        .login-image::after { content:''; position:absolute; inset:0; background:linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)); }
        .image-content { position:absolute; bottom:40px; left:40px; z-index:2; color:#fff; }
        .image-content h2 { font-size:32px; font-weight:700; margin-bottom:10px; }
        .image-content p { font-size:15px; opacity:.9; }
        .login-form-wrapper { flex:1; padding:60px; display:flex; flex-direction:column; justify-content:center; position:relative; }
        .logo { font-size:24px; font-weight:700; color:var(--text-dark); display:flex; align-items:center; gap:10px; position:absolute; top:40px; left:60px; }
        .logo i { color:var(--primary-yellow); font-size:28px; }
        .login-form-wrapper h1 { font-size:28px; color:var(--text-dark); margin-bottom:10px; }
        .login-form-wrapper > p { font-size:14px; color:var(--text-light); margin-bottom:40px; }
        .form-group { margin-bottom:20px; }
        .form-group label { display:block; font-size:13px; font-weight:500; color:var(--text-dark); margin-bottom:8px; }
        .input-wrapper { position:relative; }
        .input-wrapper i { position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#aaa; font-size:16px; }
        .input-wrapper input { width:100%; padding:14px 15px 14px 45px; border:1px solid var(--border-color); border-radius:10px; font-size:14px; outline:none; transition:.3s; background:#fafafa; }
        .input-wrapper input:focus { border-color:var(--primary-yellow); background:#fff; box-shadow:0 0 0 4px rgba(246,168,33,0.1); }
        .form-options { display:flex; justify-content:space-between; align-items:center; margin-bottom:30px; font-size:13px; }
        .remember-me { display:flex; align-items:center; gap:8px; color:var(--text-light); cursor:pointer; }
        .remember-me input { accent-color:var(--primary-yellow); width:16px; height:16px; }
        .forgot-password { color:var(--primary-yellow); background:none; border:none; cursor:pointer; font-size:13px; font-weight:500; }
        .forgot-password:hover { text-decoration:underline; }
        .btn-login { width:100%; padding:15px; background:var(--primary-yellow); color:#fff; border:none; border-radius:10px; font-size:16px; font-weight:600; cursor:pointer; transition:.3s; box-shadow:0 4px 15px rgba(246,168,33,0.3); }
        .btn-login:hover { background:var(--primary-hover); transform:translateY(-2px); }
        .btn-login:disabled { opacity:.7; cursor:not-allowed; transform:none; }
        .msg { margin-top:14px; font-size:13px; color:#ef4444; }
        @media (max-width:900px) {
          .login-container { flex-direction:column; height:auto; }
          .login-image { height:250px; flex:none; }
          .login-form-wrapper { padding:40px 30px; }
          .logo { position:relative; top:0; left:0; margin-bottom:30px; justify-content:center; }
        }
      `}</style>

      <div className="login-container">
        <div className="login-image">
          <div className="image-content">
            <h2>Welcome Back, Admin.</h2>
            <p>Manage your Madinat al Nojoom bookings and safaris from one dashboard.</p>
          </div>
        </div>
        <div className="login-form-wrapper">
          <div className="logo"><i className="fas fa-mountain"></i> Madinat al Nojoom</div>
          <h1>Admin Login</h1>
          <p>Please enter your credentials to access the dashboard.</p>
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper"><i className="fas fa-envelope"></i><input type="email" id="email" name="email" placeholder="admin@arabianadventures.ae" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required /></div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper"><i className="fas fa-lock"></i><input type="password" id="password" name="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
            </div>
            <div className="form-options">
              <label className="remember-me"><input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} />Remember me</label>
              <button type="button" className="forgot-password" onClick={async () => { if (!email) { setMsg('Enter your email first to reset password.'); return; } const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/admin/login` }); setMsg(error ? error.message : 'Password reset email sent (if the account exists).'); }}>Forgot Password?</button>
            </div>
            <button type="submit" className="btn-login" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            {msg && <p className="msg">{msg}</p>}
          </form>
        </div>
      </div>
    </>
  );
}
