import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getHotels, deleteHotel } from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Star, MapPin, Eye } from 'lucide-react';

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = () => {
    setLoading(true);
    getHotels({ page, limit: 10 }).then(d => { setHotels(d.hotels); setTotal(d.total); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [page]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}"?`)) return;
    try {
      await deleteHotel(id);
      toast.success('Hotel removed');
      fetch();
    } catch { toast.error('Failed to remove hotel'); }
  };

  return (
    <AdminLayout title={`Hotels (${total})`}
      action={<Link to="/admin/hotels/add" className="btn btn-gold btn-sm"><Plus size={15} />Add Hotel</Link>}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12, borderRadius: 10 }} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--sand)' }}>
                {['Hotel', 'Location', 'Category', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hotels.map(h => (
                <tr key={h._id} style={{ borderBottom: '1px solid var(--sand)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={h.thumbnail} alt="" style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 8 }} onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{h.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.stars}★ · {h.rooms?.length || 0} rooms</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--slate)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <MapPin size={12} color="var(--gold)" />{h.location?.city}, {h.location?.country}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}><span className="badge badge-gold">{h.category}</span></td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>${h.pricePerNight}/night</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="var(--gold)" color="var(--gold)" />
                      <span style={{ fontWeight: 600 }}>{h.rating}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>({h.reviewCount})</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {h.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-danger">Inactive</span>}
                    {h.isFeatured && <span className="badge badge-gold" style={{ marginLeft: 6 }}>Featured</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/hotels/${h._id}`} style={{ color: 'var(--muted)', display: 'flex' }} title="View"><Eye size={16} /></Link>
                      <Link to={`/admin/hotels/edit/${h._id}`} style={{ color: 'var(--gold)', display: 'flex' }} title="Edit"><Edit size={16} /></Link>
                      <button onClick={() => handleDelete(h._id, h.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', padding: 0 }} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {hotels.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <p style={{ marginBottom: 16 }}>No hotels yet.</p>
            <Link to="/admin/hotels/add" className="btn btn-gold btn-sm">Add your first hotel</Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
