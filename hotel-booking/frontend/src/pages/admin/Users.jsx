import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAdminUsers, updateUserRole } from '../../utils/api';
import toast from 'react-hot-toast';
import { UserCircle, Shield, ShieldOff } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = () => {
    setLoading(true);
    getAdminUsers({ page, limit: 15 })
      .then(d => { setUsers(d.users); setTotal(d.total); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const handleRoleToggle = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change this user to ${newRole}?`)) return;
    try {
      await updateUserRole(id, newRole);
      toast.success(`User is now ${newRole}`);
      fetch();
    } catch { toast.error('Failed to update role'); }
  };

  return (
    <AdminLayout title={`Users (${total})`}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 64, marginBottom: 12, borderRadius: 10 }} />)}
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>No users found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--sand)' }}>
                {['User', 'Email', 'Role', 'Auth Type', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--sand)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <UserCircle size={22} color="var(--muted)" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{u.name}</div>
                        {u.phone && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{u.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--slate)', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-gray'}`} style={{ textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Shield size={11} />{u.role}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`badge ${u.clerkId ? 'badge-info' : 'badge-gray'}`}>
                      {u.clerkId ? 'Clerk' : 'Email/Password'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--muted)', fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button onClick={() => handleRoleToggle(u._id, u.role)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: '1.5px solid var(--sand)', background: 'transparent', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', color: u.role === 'admin' ? 'var(--danger)' : 'var(--gold)', transition: 'var(--transition)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      {u.role === 'admin' ? <><ShieldOff size={13} />Revoke Admin</> : <><Shield size={13} />Make Admin</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 15 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {Array.from({ length: Math.ceil(total / 15) }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, borderColor: page === i + 1 ? 'var(--gold)' : 'var(--sand)', background: page === i + 1 ? 'var(--gold)' : '#fff', color: page === i + 1 ? '#fff' : 'var(--slate)' }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
