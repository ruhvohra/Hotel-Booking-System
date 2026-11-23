import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAdminBookings, updateBookingStatus } from '../../utils/api';
import toast from 'react-hot-toast';
import { MapPin, Calendar, Search } from 'lucide-react';

const STATUS_COLORS = { confirmed: 'success', pending: 'warning', cancelled: 'danger', completed: 'info' };

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetch = () => {
    setLoading(true);
    getAdminBookings({ page, limit: 15, status: statusFilter || undefined })
      .then(d => { setBookings(d.bookings); setTotal(d.total); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page, statusFilter]);

  const handleStatusChange = async (id, status, paymentStatus) => {
    try {
      await updateBookingStatus(id, { status, paymentStatus });
      toast.success('Booking updated');
      fetch();
    } catch { toast.error('Update failed'); }
  };

  return (
    <AdminLayout title={`Bookings (${total})`}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: '8px 18px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'var(--transition)', textTransform: 'capitalize', borderColor: statusFilter === s ? 'var(--gold)' : 'var(--sand)', background: statusFilter === s ? 'var(--gold)' : '#fff', color: statusFilter === s ? '#fff' : 'var(--slate)' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 70, marginBottom: 12, borderRadius: 10 }} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>No bookings found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 900 }}>
              <thead>
                <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--sand)' }}>
                  {['Ref #', 'Guest', 'Hotel', 'Dates', 'Total', 'Status', 'Payment', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id} style={{ borderBottom: '1px solid var(--sand)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, color: 'var(--gold)', fontFamily: 'monospace' }}>{b.confirmationNumber}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500 }}>{b.user?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.hotel?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={10} />{b.hotel?.location?.city}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--slate)' }}>
                        <Calendar size={12} color="var(--gold)" />
                        {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.nights} night{b.nights > 1 ? 's' : ''}</div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>${b.totalPrice?.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <select value={b.status} onChange={e => handleStatusChange(b._id, e.target.value, b.paymentStatus)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--sand)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', background: '#fff', width: 'auto' }}>
                        {['pending', 'confirmed', 'completed', 'cancelled'].map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select value={b.paymentStatus} onChange={e => handleStatusChange(b._id, b.status, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--sand)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer', background: '#fff', width: 'auto' }}>
                        {['unpaid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge badge-${STATUS_COLORS[b.status] || 'gray'}`} style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
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
