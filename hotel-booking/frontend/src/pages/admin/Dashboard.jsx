import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getAdminStats, seedData } from '../../utils/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Hotel, BookOpen, Users, DollarSign, TrendingUp, Sparkles, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const STATUS_COLORS = { confirmed: '#2E7D52', pending: '#D4890A', cancelled: '#C0392B', completed: '#1A6B9A' };

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    getAdminStats().then(d => { setStats(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedData();
      toast.success(res.message);
      getAdminStats().then(setStats);
    } catch (e) { toast.error(e.response?.data?.message || 'Seeding failed'); }
    finally { setSeeding(false); }
  };

  const chartData = stats?.monthlyBookings?.map(d => ({
    name: MONTHS[d._id.month - 1],
    bookings: d.count,
    revenue: d.revenue
  })) || [];

  const pieData = stats?.statusBreakdown?.map(s => ({ name: s._id, value: s.count })) || [];

  const STAT_CARDS = [
    { icon: Hotel, label: 'Total Hotels', value: stats?.totalHotels ?? '—', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
    { icon: BookOpen, label: 'Total Bookings', value: stats?.totalBookings ?? '—', color: '#2E7D52', bg: 'rgba(46,125,82,0.1)' },
    { icon: Users, label: 'Registered Users', value: stats?.totalUsers ?? '—', color: '#1A6B9A', bg: 'rgba(26,107,154,0.1)' },
    { icon: DollarSign, label: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '—', color: '#9B59B6', bg: 'rgba(155,89,182,0.1)' },
  ];

  return (
    <AdminLayout title="Dashboard"
      action={
        <button onClick={handleSeed} disabled={seeding} className="btn btn-gold btn-sm">
          <Sparkles size={15} />{seeding ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      }>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            {STAT_CARDS.map(({ icon: Icon, label, value, color, bg }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 16, padding: '24px 20px', border: '1px solid var(--sand)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, marginBottom: 4 }}>{value}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
            {/* Revenue chart */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--sand)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17 }}>Revenue & Bookings</h3>
                <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={13} />Monthly</span>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--sand)" />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--sand)', fontFamily: 'var(--font-body)', fontSize: 13 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue ($)" />
                    <Area type="monotone" dataKey="bookings" stroke="#2E7D52" strokeWidth={2} fill="none" name="Bookings" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>No data yet. Seed demo data to see charts.</div>}
            </div>

            {/* Booking status pie */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--sand)' }}>
              <h3 style={{ fontSize: 17, marginBottom: 20 }}>Booking Status</h3>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#ccc'} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: 13 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {pieData.map(d => (
                      <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[d.name] || '#ccc' }} />
                          <span style={{ textTransform: 'capitalize' }}>{d.name}</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>No bookings yet</div>}
            </div>
          </div>

          {/* Recent bookings & top hotels */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Recent bookings */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--sand)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17 }}>Recent Bookings</h3>
                <Link to="/admin/bookings" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>View all <ArrowRight size={13} /></Link>
              </div>
              {stats?.recentBookings?.length > 0 ? stats.recentBookings.map(b => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--sand)', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.user?.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.hotel?.name}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>${b.totalPrice?.toLocaleString()}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: STATUS_COLORS[b.status] + '20', color: STATUS_COLORS[b.status], textTransform: 'capitalize' }}>{b.status}</span>
                  </div>
                </div>
              )) : <p style={{ color: 'var(--muted)', fontSize: 14 }}>No bookings yet.</p>}
            </div>

            {/* Top hotels */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--sand)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontSize: 17 }}>Top Hotels</h3>
                <Link to="/admin/hotels" style={{ fontSize: 13, color: 'var(--gold)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Manage <ArrowRight size={13} /></Link>
              </div>
              {stats?.topHotels?.length > 0 ? stats.topHotels.map((h, i) => (
                <div key={h._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--sand)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? 'var(--gold)' : 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? '#fff' : 'var(--muted)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>{h.location?.city} · ${h.pricePerNight}/night</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Star size={13} fill="var(--gold)" color="var(--gold)" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{h.rating}</span>
                  </div>
                </div>
              )) : <p style={{ color: 'var(--muted)', fontSize: 14 }}>No hotels yet. Seed demo data!</p>}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
