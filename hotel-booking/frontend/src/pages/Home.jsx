import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHotels } from '../utils/api';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import { Shield, Clock, CreditCard, HeadphonesIcon, ArrowRight, Star } from 'lucide-react';

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600',
];

const CATEGORIES = ['All', 'Luxury', 'Resort', 'Boutique', 'Standard', 'Budget'];
const DESTINATIONS = [
  { city: 'New York', country: 'USA', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400', hotels: 240 },
  { city: 'Kyoto', country: 'Japan', img: 'https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8a3lvdG98ZW58MHx8MHx8fDA%3D', hotels: 132 },
  { city: 'Cancun', country: 'Mexico', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', hotels: 89 },
  { city: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400', hotels: 74 },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    getHotels({ featured: true, limit: 6 }).then(d => { setFeatured(d.hotels); setLoading(false); }).catch(() => setLoading(false));
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const filtered = activeCategory === 'All' ? featured : featured.filter(h => h.category === activeCategory);

  return (
    <div className="page">
      {/* Hero */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {HERO_IMAGES.map((src, i) => (
          <div key={i} style={{ position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'opacity 1.5s ease', opacity: heroIdx === i ? 1 : 0 }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.3) 50%, rgba(10,10,10,0.7) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 80 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 40, padding: '6px 16px', marginBottom: 20 }}>
              <Star size={13} fill="var(--gold)" color="var(--gold)" />
              <span style={{ color: 'var(--gold-light)', fontSize: 13, fontWeight: 500 }}>World's Finest Hotels & Resorts</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#fff', fontWeight: 400, lineHeight: 1.1, marginBottom: 20 }}>
              Your Perfect Stay<br /><em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Awaits</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500 }}>
              Discover curated luxury hotels, boutique hideaways, and breathtaking resorts across the globe.
            </p>
            <SearchBar />
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6))', animation: 'pulse 2s infinite' }} />
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--charcoal)', padding: '48px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {[['500+', 'Premium Hotels'], ['50+', 'Countries'], ['100K+', 'Happy Guests'], ['4.9★', 'Average Rating']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--gold)', fontWeight: 500 }}>{n}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Hotels */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Handpicked For You</div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Featured Properties</h2>
            </div>
            <Link to="/hotels" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              View All Hotels <ArrowRight size={16} />
            </Link>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: '8px 20px', borderRadius: 40, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'var(--transition)', fontFamily: 'var(--font-body)', borderColor: activeCategory === cat ? 'var(--gold)' : 'var(--sand)', background: activeCategory === cat ? 'var(--gold)' : 'transparent', color: activeCategory === cat ? '#fff' : 'var(--slate)' }}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 20 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
              <p>No hotels found in this category. <Link to="/hotels">Browse all hotels →</Link></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
              {filtered.map(h => <HotelCard key={h._id} hotel={h} />)}
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      <section style={{ padding: '0 0 80px', background: 'var(--ivory)' }}>
        <div className="container" style={{ paddingTop: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Around The Globe</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Popular Destinations</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            {DESTINATIONS.map(d => (
              <Link key={d.city} to={`/hotels?search=${d.city}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', height: 280, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'}
                  onMouseLeave={e => e.currentTarget.querySelector('img').style.transform = 'scale(1)'}>
                  <img src={d.img} alt={d.city} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 40%, transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 20, left: 20, color: '#fff' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>{d.city}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{d.country} · {d.hotels} Hotels</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ color: 'var(--gold)', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Why Choose Us</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>Travel With Confidence</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 32 }}>
            {[
              [Shield, 'Best Price Guarantee', 'Find a lower price? We\'ll match it and refund the difference.'],
              [Clock, 'Free Cancellation', 'Plans change. Enjoy free cancellation up to 24 hours before check-in.'],
              [CreditCard, 'Secure Payments', 'Your payment info is always protected with bank-level encryption.'],
              [HeadphonesIcon, '24/7 Support', 'Our concierge team is available around the clock for any assistance.'],
            ].map(([Icon, title, desc]) => (
              <div key={title} style={{ padding: 32, background: 'var(--white)', borderRadius: 20, border: '1px solid var(--sand)', textAlign: 'center', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Icon size={26} color="var(--gold)" />
                </div>
                <h3 style={{ fontSize: 18, marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'var(--charcoal)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#fff', marginBottom: 16 }}>Ready to Explore?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 17, marginBottom: 40 }}>Join over 100,000 travelers who trust LuxeStay</p>
          <Link to="/hotels" className="btn btn-gold btn-lg">Discover Hotels <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
