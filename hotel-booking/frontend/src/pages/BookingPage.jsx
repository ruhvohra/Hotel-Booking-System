import { useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, Calendar, Users, MapPin, ArrowLeft, CreditCard, Shield } from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hotel = state?.hotel;
  const bookForm = state?.bookForm;
  const availability = state?.availability;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    adults: 1,
    children: 0,
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);

  if (!hotel || !availability) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px' }}>
        <h2>Booking information missing</h2>
        <Link to="/hotels" className="btn btn-gold" style={{ marginTop: 20 }}>Browse Hotels</Link>
      </div>
    );
  }

  const selectedRoom = availability.rooms?.[0];
  const totalPrice = availability.priceEstimate || (hotel.pricePerNight * availability.nights);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const booking = await createBooking({
        hotelId: hotel._id,
        roomId: selectedRoom?._id,
        checkIn: bookForm.checkIn,
        checkOut: bookForm.checkOut,
        guests: { adults: parseInt(form.adults), children: parseInt(form.children) },
        specialRequests: form.specialRequests,
        guestInfo: { name: form.name, email: form.email, phone: form.phone }
      });
      toast.success('🎉 Booking confirmed!');
      navigate(`/bookings/${booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nights = availability.nights;

  return (
    <div className="page" style={{ paddingTop: 90, paddingBottom: 60 }}>
      <div className="container" style={{ maxWidth: 960, padding: '32px 24px' }}>
        <Link to={`/hotels/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', textDecoration: 'none', fontSize: 14, marginBottom: 32 }}>
          <ArrowLeft size={16} />Back to Hotel
        </Link>

        <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 8 }}>Complete Your Booking</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 40 }}>Review your stay details and enter guest information</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Hotel summary */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>Your Stay</h3>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <img src={hotel.thumbnail} alt={hotel.name}
                  style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 10 }}
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} />
                <div>
                  <h4 style={{ marginBottom: 4 }}>{hotel.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 13, marginBottom: 8 }}>
                    <MapPin size={13} />{hotel.location?.city}, {hotel.location?.country}
                  </div>
                  {selectedRoom && <span className="badge badge-gold">{selectedRoom.type}</span>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20, padding: 16, background: 'var(--cream)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Check-in</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{new Date(bookForm.checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Check-out</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{new Date(bookForm.checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Duration</div>
                  <div style={{ fontWeight: 600 }}>{nights} night{nights > 1 ? 's' : ''}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Guests</div>
                  <div style={{ fontWeight: 600 }}>{bookForm.guests} guest{bookForm.guests > 1 ? 's' : ''}</div>
                </div>
              </div>
            </div>

            {/* Guest info */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', padding: 24, marginBottom: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: 18 }}>Guest Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="John Doe" />
                </div>
                <div>
                  <label>Email Address *</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="john@example.com" />
                </div>
                <div>
                  <label>Phone Number</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <label>Adults</label>
                  <select value={form.adults} onChange={e => setForm(f => ({ ...f, adults: e.target.value }))}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label>Children</label>
                  <select value={form.children} onChange={e => setForm(f => ({ ...f, children: e.target.value }))}>
                    {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label>Special Requests</label>
                  <textarea value={form.specialRequests} onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                    rows={3} placeholder="Any special requests, dietary requirements, or accessibility needs..." />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-gold btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
              {submitting ? <><div className="spinner" style={{ width: 18, height: 18, borderTopColor: '#fff' }} />Processing...</> : <><CreditCard size={18} />Confirm Booking</>}
            </button>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <Shield size={13} />Secure booking · Free cancellation within 24 hours
            </p>
          </form>

          {/* Price summary */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--sand)', padding: 28, position: 'sticky', top: 100, boxShadow: 'var(--shadow)' }}>
            <h3 style={{ marginBottom: 20, fontSize: 18 }}>Price Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>${selectedRoom?.price || hotel.pricePerNight} × {nights} night{nights > 1 ? 's' : ''}</span>
                <span>${((selectedRoom?.price || hotel.pricePerNight) * nights).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--muted)' }}>Taxes & fees (10%)</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--success)' }}>
                <span>LuxeStay discount</span>
                <span>-$0.00</span>
              </div>
            </div>
            <div style={{ borderTop: '1.5px solid var(--sand)', marginTop: 18, paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>${(totalPrice * 1.1).toFixed(2)}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12, textAlign: 'center' }}>All prices in USD. Charged at check-in.</p>

            <div style={{ marginTop: 24, padding: '14px 16px', background: 'rgba(46,125,82,0.08)', borderRadius: 12, border: '1px solid rgba(46,125,82,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                <CheckCircle2 size={15} />Free Cancellation
              </div>
              <p style={{ fontSize: 12, color: 'var(--slate)' }}>Cancel before check-in for a full refund.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
