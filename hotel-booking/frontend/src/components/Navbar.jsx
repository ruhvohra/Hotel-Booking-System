import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, Menu, X, Hotel, LogOut, LayoutDashboard, BookOpen, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    transition: 'all 0.4s ease',
    background: isHome && !scrolled ? 'transparent' : 'rgba(250,248,243,0.95)',
    backdropFilter: scrolled || !isHome ? 'blur(12px)' : 'none',
    borderBottom: scrolled || !isHome ? '1px solid rgba(201,168,76,0.15)' : 'none',
    padding: scrolled ? '12px 0' : '20px 0',
  };

  const logoColor = isHome && !scrolled ? '#fff' : '#1C1C1E';
  const linkColor = isHome && !scrolled ? 'rgba(255,255,255,0.9)' : '#3A3A3C';

  return (
    <nav style={navStyle}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'var(--gold)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hotel size={20} color="#fff" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: logoColor, letterSpacing: '-0.5px' }}>
            LuxeStay
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, fontWeight: 500 }}>
          {[['Hotels', '/hotels'], ['Destinations', '/hotels?featured=true']].map(([label, href]) => (
            <Link key={label} to={href} style={{ color: linkColor, textDecoration: 'none', opacity: 0.85, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.85}>
              {label}
            </Link>
          ))}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid', borderColor: isHome && !scrolled ? 'rgba(255,255,255,0.4)' : 'var(--sand)', borderRadius: 40, padding: '8px 16px', cursor: 'pointer', color: linkColor, fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500 }}>
                {user.avatar ? <img src={user.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} /> : <UserCircle size={20} />}
                <span>{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {dropdownOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: 14, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--sand)', minWidth: 200, overflow: 'hidden', zIndex: 100 }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--sand)', background: 'var(--cream)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{user.email}</div>
                  </div>
                  {[
                    [<BookOpen size={15}/>, 'My Bookings', '/my-bookings'],
                    [<UserCircle size={15}/>, 'Profile', '/profile'],
                    ...(isAdmin ? [[<LayoutDashboard size={15}/>, 'Admin Dashboard', '/admin']] : [])
                  ].map(([icon, label, href]) => (
                    <Link key={href} to={href} onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--charcoal)', textDecoration: 'none', fontSize: 14, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <span style={{ color: 'var(--gold)' }}>{icon}</span>{label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontSize: 14, fontFamily: 'var(--font-body)', borderTop: '1px solid var(--sand)' }}>
                    <LogOut size={15} />Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/login" className="btn btn-sm btn-outline" style={{ borderColor: isHome && !scrolled ? 'rgba(255,255,255,0.5)' : 'var(--sand)', color: isHome && !scrolled ? '#fff' : 'var(--charcoal)', background: 'transparent' }}>Sign In</Link>
              <Link to="/register" className="btn btn-sm btn-gold">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
