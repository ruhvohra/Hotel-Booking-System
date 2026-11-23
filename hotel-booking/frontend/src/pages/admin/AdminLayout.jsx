import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Hotel, BookOpen, Users, Plus, ArrowLeft } from 'lucide-react';

const NAV = [
  [LayoutDashboard, 'Dashboard', '/admin'],
  [Hotel, 'Hotels', '/admin/hotels'],
  [BookOpen, 'Bookings', '/admin/bookings'],
  [Users, 'Users', '/admin/users'],
];

export default function AdminLayout({ children, title, action }) {
  const { pathname } = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 72 }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--charcoal)', flexShrink: 0, padding: '32px 0', position: 'sticky', top: 72, height: 'calc(100vh - 72px)', overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 16 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Admin Panel</div>
          <div style={{ color: '#fff', fontFamily: 'var(--font-display)', fontSize: 18 }}>LuxeStay</div>
        </div>
        {NAV.map(([Icon, label, href]) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link key={href} to={href}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', color: active ? 'var(--gold)' : 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'var(--transition)', background: active ? 'rgba(201,168,76,0.1)' : 'transparent', borderLeft: active ? '3px solid var(--gold)' : '3px solid transparent' }}
              onMouseEnter={e => !active && (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => !active && (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
              <Icon size={17} />{label}
            </Link>
          );
        })}
        <div style={{ padding: '24px 20px 0', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 24 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>
            <ArrowLeft size={14} />Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '40px 40px', background: 'var(--cream)', minHeight: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontSize: 28 }}>{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
