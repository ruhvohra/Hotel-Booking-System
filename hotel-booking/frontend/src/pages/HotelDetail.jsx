import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHotel, checkAvailability, addReview } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MapPin, Star, Wifi, Car, Waves, UtensilsCrossed, Dumbbell, Wind, Clock, CheckCircle2, XCircle, ChevronLeft, Calendar, Users, ArrowRight } from 'lucide-react';

const AMENITY_ICONS = { 'Pool': Waves, 'Gym': Dumbbell, 'WiFi': Wifi, 'Restaurant': UtensilsCrossed, 'Parking': Car, 'AC': Wind };

export default function HotelDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [bookForm, setBookForm] = useState({ checkIn: today, checkOut: tomorrow, guests: 2, roomType: '' });

  useEffect(() => {
    getHotel(id).then(d => { setHotel(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleCheckAvailability = async () => {
    setCheckingAvail(true);
    try {
      const result = await checkAvailability(id, { checkIn: bookForm.checkIn, checkOut: bookForm.checkOut, roomType: bookForm.roomType });
      setAvailability(result);
    } catch { toast.error('Could not check availability'); }
    finally { setCheckingAvail(false); }
  };

  const handleBook = () => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return; }
    if (!availability?.available) { toast.error('Please check availability first'); return; }
    navigate(`/hotels/${id}/book`, { state: { hotel, bookForm, availability } });
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Sign in to leave a review'); return; }
    try {
      await addReview(id, review);
      toast.success('Review submitted!');
      getHotel(id).then(setHotel);
    } catch (e) { toast.error(e.response?.data?.message || 'Error submitting review'); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><div className="spinner" /></div>;
  if (!hotel) return <div style={{ textAlign: 'center', padding: 80 }}><h2>Hotel not found</h2><Link to="/hotels">← Back to Hotels</Link></div>;

  const images = hotel.images?.length ? hotel.images : [hotel.thumbnail];

  return (
    <div className="page" style={{ paddingTop: 80 }}>
      {/* Image Gallery */}
      <div style={{ position: 'relative', height: 480, background: '#000' }}>
        <img src={images[activeImg]} alt={hotel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
          onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'} />
        {images.length > 1 && (
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                style={{ width: i === activeImg ? 28 : 8, height: 8, borderRadius: 4, background: i === activeImg ? 'var(--gold)' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 20, right: 24, display: 'flex', gap: 8 }}>
          {images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
              style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: activeImg === i ? '2px solid var(--gold)' : '2px solid transparent', transition: 'border 0.2s', opacity: activeImg === i ? 1 : 0.7 }} />
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 40, alignItems: 'start' }}>
          {/* Left */}
          <div>
            <Link to="/hotels" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
              <ChevronLeft size={14} />Back to Hotels
            </Link>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <span className="badge badge-gold">{hotel.category}</span>
              {hotel.isFeatured && <span className="badge" style={{ background: 'var(--gold)', color: '#fff' }}>Featured</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', marginBottom: 12 }}>{hotel.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {Array.from({ length: hotel.stars }).map((_, i) => <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={16} fill="var(--gold)" color="var(--gold)" />
                <span style={{ fontWeight: 600 }}>{hotel.rating}</span>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}>({hotel.reviewCount} reviews)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 14 }}>
                <MapPin size={14} />{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country}
              </div>
            </div>

            <p style={{ color: 'var(--slate)', lineHeight: 1.8, fontSize: 15, marginBottom: 32 }}>{hotel.description}</p>

            {/* Amenities */}
            <h3 style={{ marginBottom: 16, fontSize: 20 }}>Amenities</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
              {hotel.amenities?.map(a => {
                const Icon = AMENITY_ICONS[a] || CheckCircle2;
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--cream)', borderRadius: 10, fontSize: 14, border: '1px solid var(--sand)' }}>
                    <Icon size={16} color="var(--gold)" />{a}
                  </div>
                );
              })}
            </div>

            {/* Check-in info */}
            <h3 style={{ marginBottom: 16, fontSize: 20 }}>Hotel Policies</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
              {[[Clock, `Check-in: ${hotel.checkInTime}`], [Clock, `Check-out: ${hotel.checkOutTime}`], [hotel.policies?.pets ? CheckCircle2 : XCircle, 'Pets ' + (hotel.policies?.pets ? 'Allowed' : 'Not Allowed')], [hotel.policies?.smoking ? CheckCircle2 : XCircle, 'Smoking ' + (hotel.policies?.smoking ? 'Allowed' : 'Not Allowed')]].map(([Icon, text], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff', borderRadius: 10, border: '1px solid var(--sand)', fontSize: 14 }}>
                  <Icon size={16} color="var(--gold)" />{text}
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 20px', background: 'rgba(201,168,76,0.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)', fontSize: 14, color: 'var(--slate)', marginBottom: 40 }}>
              📋 {hotel.policies?.cancellation}
            </div>

            {/* Rooms */}
            {hotel.rooms?.length > 0 && (
              <>
                <h3 style={{ marginBottom: 20, fontSize: 20 }}>Available Room Types</h3>
                <div style={{ display: 'grid', gap: 16, marginBottom: 40 }}>
                  {hotel.rooms.map(room => (
                    <div key={room._id} style={{ padding: '20px 24px', background: '#fff', borderRadius: 16, border: '1.5px solid var(--sand)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <h4 style={{ marginBottom: 6 }}>{room.type}</h4>
                        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Up to {room.capacity} guests · {room.amenities?.join(', ')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--charcoal)' }}>${room.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/night</span></div>
                        <button onClick={() => setBookForm(f => ({ ...f, roomType: room.type }))}
                          style={{ fontSize: 12, color: room.type === bookForm.roomType ? 'var(--gold)' : 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', marginTop: 4 }}>
                          {room.type === bookForm.roomType ? '✓ Selected' : 'Select →'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Reviews */}
            <h3 style={{ marginBottom: 20, fontSize: 20 }}>Guest Reviews</h3>
            {hotel.reviews?.length > 0 ? (
              <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
                {hotel.reviews.slice(0, 5).map((r, i) => (
                  <div key={i} style={{ padding: '20px', background: '#fff', borderRadius: 14, border: '1px solid var(--sand)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontWeight: 500 }}>{r.userName}</div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={13} fill="var(--gold)" color="var(--gold)" />)}
                      </div>
                    </div>
                    <p style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.7 }}>{r.comment}</p>
                    <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--muted)', marginBottom: 32 }}>No reviews yet. Be the first!</p>}

            {/* Add review */}
            {user && (
              <form onSubmit={handleReview} style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid var(--sand)' }}>
                <h4 style={{ marginBottom: 16 }}>Write a Review</h4>
                <div style={{ marginBottom: 16 }}>
                  <label>Your Rating</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReview(r => ({ ...r, rating: n }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                        <Star size={24} fill={n <= review.rating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label>Your Comment</label>
                  <textarea value={review.comment} onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} rows={3} placeholder="Share your experience..." required />
                </div>
                <button type="submit" className="btn btn-gold">Submit Review</button>
              </form>
            )}
          </div>

          {/* Booking sidebar */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1.5px solid var(--sand)', padding: 28, boxShadow: 'var(--shadow)' }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600 }}>${hotel.pricePerNight}</span>
                <span style={{ color: 'var(--muted)', fontSize: 14 }}> / night</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Star size={14} fill="var(--gold)" color="var(--gold)" />
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{hotel.rating}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 13 }}>({hotel.reviewCount} reviews)</span>
                </div>
              </div>

              <div style={{ border: '1.5px solid var(--sand)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1.5px solid var(--sand)' }}>
                  <div style={{ padding: '12px 14px', borderRight: '1.5px solid var(--sand)' }}>
                    <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Check-in</label>
                    <input type="date" value={bookForm.checkIn} min={today} onChange={e => setBookForm(f => ({ ...f, checkIn: e.target.value }))}
                      style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', width: '100%' }} />
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Check-out</label>
                    <input type="date" value={bookForm.checkOut} min={bookForm.checkIn} onChange={e => setBookForm(f => ({ ...f, checkOut: e.target.value }))}
                      style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', width: '100%' }} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Guests</label>
                  <select value={bookForm.guests} onChange={e => setBookForm(f => ({ ...f, guests: e.target.value }))}
                    style={{ border: 'none', outline: 'none', fontSize: 13, padding: 0, background: 'transparent', width: '100%' }}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n>1?'s':''}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={handleCheckAvailability} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} disabled={checkingAvail}>
                {checkingAvail ? <><div className="spinner" style={{ width: 16, height: 16 }} />Checking...</> : <><Calendar size={16} />Check Availability</>}
              </button>

              {availability && (
                <div style={{ padding: '14px 16px', borderRadius: 12, marginBottom: 16, background: availability.available ? 'rgba(46,125,82,0.08)' : 'rgba(192,57,43,0.08)', border: `1px solid ${availability.available ? 'rgba(46,125,82,0.2)' : 'rgba(192,57,43,0.2)'}` }}>
                  {availability.available ? (
                    <>
                      <div style={{ color: 'var(--success)', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle2 size={16} />Available!
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--slate)' }}>
                        {availability.nights} nights · {availability.rooms?.length} room type(s) available
                      </div>
                      <div style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--charcoal)', fontWeight: 600 }}>
                        Est. ${availability.priceEstimate?.toLocaleString()}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <XCircle size={16} />Not available for selected dates
                    </div>
                  )}
                </div>
              )}

              <button onClick={handleBook} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
                Book Now <ArrowRight size={16} />
              </button>

              <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 12, marginTop: 14 }}>
                Free cancellation · No hidden fees
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
