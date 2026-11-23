import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';
import toast from 'react-hot-toast';
import { UserCircle, Mail, Phone, Shield } from 'lucide-react';

export default function Profile() {
  const { user, fetchMe } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      await fetchMe();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page" style={{ paddingTop: 90, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 640, padding: '40px 24px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 8 }}>My Profile</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Manage your account information</p>

        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--sand)', padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid var(--sand)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={40} color="#fff" />}
            </div>
            <div>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 14, marginBottom: 6 }}>
                <Mail size={13} />{user?.email}
              </div>
              <span className={`badge ${user?.role === 'admin' ? 'badge-gold' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>
                <Shield size={11} style={{ marginRight: 4 }} />{user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label><Phone size={13} style={{ marginRight: 5 }} />Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <label>Email Address</label>
                <input type="email" value={user?.email} disabled style={{ background: 'var(--cream)', color: 'var(--muted)', cursor: 'not-allowed' }} />
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Email cannot be changed here.</p>
              </div>
            </div>
            <button type="submit" className="btn btn-gold" style={{ marginTop: 24 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
