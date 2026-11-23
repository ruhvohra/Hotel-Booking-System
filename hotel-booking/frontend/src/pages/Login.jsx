// Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Hotel, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--ivory) 0%, var(--cream) 100%)', padding: '80px 20px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: 'var(--gold)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Hotel size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to your LuxeStay account</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)', border: '1px solid var(--sand)' }}>
          {/* Demo credentials */}
          <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)', marginBottom: 24, fontSize: 13 }}>
            <strong>Demo Admin:</strong> admin@luxestay.com / admin123
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="you@example.com" autoComplete="email" />
            </div>
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label>Password</label>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Your password" autoComplete="current-password" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 38, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--ivory) 0%, var(--cream) 100%)', padding: '80px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, background: 'var(--gold)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Hotel size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create Account</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Start your journey with LuxeStay</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: 'var(--shadow)', border: '1px solid var(--sand)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="John Doe" autoComplete="name" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="you@example.com" autoComplete="email" />
            </div>
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label>Password</label>
              <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="Min 6 characters" autoComplete="new-password" style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: 38, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label>Confirm Password</label>
              <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required placeholder="Repeat your password" autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} />Creating...</> : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
