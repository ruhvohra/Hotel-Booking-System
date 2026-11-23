import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--charcoal)', color: 'rgba(255,255,255,0.7)', marginTop: 80 }}>
      <div className="container" style={{ padding: '64px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: 'var(--gold)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hotel size={20} color="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#fff', fontWeight: 600 }}>LuxeStay</span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>Curating extraordinary stays for discerning travelers around the world.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', transition: 'var(--transition)', textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Explore</h4>
            {[['Hotels', '/hotels'], ['Destinations', '/hotels?featured=true'], ['Special Offers', '/hotels'], ['Luxury Collection', '/hotels?category=Luxury']].map(([label, href]) => (
              <Link key={label} to={href} style={{ display: 'block', marginBottom: 10, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--gold-light)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Company</h4>
            {['About Us', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service'].map(label => (
              <a key={label} href="#" style={{ display: 'block', marginBottom: 10, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--gold-light)'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                {label}
              </a>
            ))}
          </div>
          <div>
            <h4 style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 20 }}>Contact</h4>
            {[[Mail, 'hello@luxestay.com'], [Phone, '+1 (800) 123-4567'], [MapPin, 'New York, NY 10001']].map(([Icon, text], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                <Icon size={15} color="var(--gold)" />{text}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 13 }}>© 2025 LuxeStay. All rights reserved.</p>
          <p style={{ fontSize: 13, color: 'var(--gold)' }}>Built with ♥ for remarkable travel experiences</p>
        </div>
      </div>
    </footer>
  );
}
