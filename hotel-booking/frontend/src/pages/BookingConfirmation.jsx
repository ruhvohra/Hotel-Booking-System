import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooking, cancelBooking } from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, MapPin, Calendar, Users, Hash, Download, ArrowLeft } from 'lucide-react';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooking(id).then(d => { setBooking(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      setBooking(b => ({ ...b, status: 'cancelled' }));
    } catch (e) { toast.error(e.response?.data?.message || 'Cancel failed'); }
  };

  const statusColors = { pending: 'var(--warning)', confirmed: 'var(--success)', cancelled: 'var(--danger)', completed: 'var(--info)' };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner" /></div>;
  if (!booking) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Booking not found</h2><Link to="/my-bookings">← My Bookings</Link></div>;

  return (
    <div className="page" style={{ paddingTop: 90, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 720, padding: '32px 24px' }}>
        {/* Confirmation header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: booking.status === 'cancelled' ? 'rgba(192,57,43,0.1)' : 'rgba(46,125,82,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={36} color={booking.status === 'cancelled' ? 'var(--danger)' : 'var(--success)'} />
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 8 }}>
            {booking.status === 'cancelled' ? 'Booking Cancelled' : 'Booking Confirmed!'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15 }}>
            {booking.status === 'cancelled' ? 'This booking has been cancelled.' : 'Your reservation has been confirmed. Enjoy your stay!'}
          </p>
        </div>

        {/* Confirmation card */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--sand)', overflow: 'hidden', marginBottom: 24 }}>
          {/* Hotel banner */}
          <div style={{ position: 'relative', height: 180 }}>
            <img src={booking.hotel?.thumbnail || booking.hotel?.images?.[0]}
              alt={booking.hotel?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24, color: '#fff' }}>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{booking.hotel?.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, opacity: 0.9 }}>
                <MapPin size={13} />{booking.hotel?.location?.city}, {booking.hotel?.location?.country}
              </div>
            </div>
            <div style={{ position: 'absolute', top: 16, right: 16 }}>
              <span style={{ background: statusColors[booking.status], color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '12px 16px', background: 'var(--cream)', borderRadius: 10 }}>
              <Hash size={15} color="var(--gold)" />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Confirmation Number:</span>
              <span style={{ fontWeight: 700, letterSpacing: 1, color: 'var(--charcoal)' }}>{booking.confirmationNumber}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                [Calendar, 'Check-in', new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                [Calendar, 'Check-out', new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })],
                [Users, 'Guests', `${booking.guests?.adults} Adult${booking.guests?.adults > 1 ? 's' : ''}${booking.guests?.children > 0 ? `, ${booking.guests.children} Child${booking.guests.children > 1 ? 'ren' : ''}` : ''}`],
                [null, 'Room Type', booking.room?.type || 'Standard'],
              ].map(([Icon, label, value], i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    {Icon && <Icon size={12} />}{label}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Total Paid</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>${(booking.totalPrice * 1.1).toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{booking.nights} night{booking.nights > 1 ? 's' : ''} · incl. taxes</div>
              </div>
              <span className={`badge badge-${booking.paymentStatus === 'paid' ? 'success' : booking.paymentStatus === 'refunded' ? 'info' : 'warning'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                {booking.paymentStatus}
              </span>
            </div>

            {booking.specialRequests && (
              <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--cream)', borderRadius: 10, fontSize: 14, color: 'var(--slate)' }}>
                <strong>Special Requests:</strong> {booking.specialRequests}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
            <ArrowLeft size={16} />My Bookings
          </Link>
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button onClick={handleCancel} className="btn btn-danger btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
              Cancel Booking
            </button>
          )}
          <button onClick={() => window.print()} className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
            <Download size={15} />Download
          </button>
        </div>
      </div>
    </div>
  );
}
