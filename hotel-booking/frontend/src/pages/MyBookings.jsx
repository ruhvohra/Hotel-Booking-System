import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../utils/api';
import toast from 'react-hot-toast';
import { MapPin, Calendar, ArrowRight, PackageOpen } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getMyBookings().then(d => { setBookings(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      setBookings(b => b.map(bk => bk._id === id ? { ...bk, status: 'cancelled' } : bk));
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const statusColors = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page" style={{ paddingTop: 90, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 900, padding: '40px 24px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 8 }}>My Bookings</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 32 }}>{bookings.length} total reservation{bookings.length !== 1 ? 's' : ''}</p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{ padding: '8px 18px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'var(--transition)', textTransform: 'capitalize', borderColor: filter === s ? 'var(--gold)' : 'var(--sand)', background: filter === s ? 'var(--gold)' : 'transparent', color: filter === s ? '#fff' : 'var(--slate)' }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <PackageOpen size={48} color="var(--muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>No bookings found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
              {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
            </p>
            <Link to="/hotels" className="btn btn-gold">Explore Hotels</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map(b => (
              <div key={b._id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', overflow: 'hidden', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', gap: 0 }}>
                  <img src={b.hotel?.thumbnail || b.hotel?.images?.[0]}
                    alt={b.hotel?.name} style={{ width: 160, minHeight: 140, objectFit: 'cover', flexShrink: 0 }}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} />
                  <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h3 style={{ fontSize: 18, marginBottom: 6 }}>{b.hotel?.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
                          <MapPin size={13} />{b.hotel?.location?.city}, {b.hotel?.location?.country}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13, color: 'var(--slate)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Calendar size={13} color="var(--gold)" />
                            {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span>· {b.nights} night{b.nights > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${statusColors[b.status]}`} style={{ marginBottom: 8, display: 'block', textAlign: 'center', textTransform: 'capitalize' }}>{b.status}</span>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}>${b.totalPrice?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                      <Link to={`/bookings/${b._id}`} className="btn btn-sm btn-gold" style={{ gap: 6 }}>
                        View Details <ArrowRight size={14} />
                      </Link>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button onClick={() => handleCancel(b._id)} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                          Cancel
                        </button>
                      )}
                      <span style={{ fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>#{b.confirmationNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
