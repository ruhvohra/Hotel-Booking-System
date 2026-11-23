import { Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Car, UtensilsCrossed, Waves } from 'lucide-react';

const amenityIcons = { 'WiFi': Wifi, 'Pool': Waves, 'Restaurant': UtensilsCrossed, 'Free Parking': Car };

export default function HotelCard({ hotel }) {
  const { _id, name, location, category, stars, thumbnail, pricePerNight, rating, reviewCount, amenities = [], isFeatured } = hotel;

  return (
    <div className="card" style={{ cursor: 'pointer' }}>
      <Link to={`/hotels/${_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', overflow: 'hidden', height: 220 }}>
          <img src={thumbnail || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600`}
            alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'} />
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            {isFeatured && <span className="badge" style={{ background: 'var(--gold)', color: '#fff', fontSize: 11 }}>Featured</span>}
            <span className="badge badge-gold" style={{ background: 'rgba(28,28,30,0.75)', color: '#fff', fontSize: 11, backdropFilter: 'blur(4px)' }}>{category}</span>
          </div>
          <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(28,28,30,0.8)', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 4, color: '#fff', fontSize: 13, backdropFilter: 'blur(4px)' }}>
            <Star size={13} fill="var(--gold)" color="var(--gold)" />
            <span style={{ fontWeight: 600 }}>{rating}</span>
            <span style={{ opacity: 0.7 }}>({reviewCount})</span>
          </div>
        </div>
        <div style={{ padding: '18px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <h3 style={{ fontSize: 17, fontWeight: 500, flex: 1, paddingRight: 8, lineHeight: 1.3 }}>{name}</h3>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: stars }).map((_, i) => <Star key={i} size={11} fill="var(--gold)" color="var(--gold)" />)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', fontSize: 13, marginBottom: 14 }}>
            <MapPin size={13} />
            <span>{location?.city}, {location?.country}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {amenities.slice(0, 3).map(a => {
              const Icon = amenityIcons[a];
              return (
                <span key={a} style={{ fontSize: 11, color: 'var(--slate)', background: 'var(--cream)', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {Icon && <Icon size={11} />}{a}
                </span>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--charcoal)', fontFamily: 'var(--font-display)' }}>${pricePerNight}</span>
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>/ night</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, background: 'rgba(201,168,76,0.1)', padding: '6px 14px', borderRadius: 20 }}>View Deal →</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
