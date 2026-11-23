import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { getHotel, createHotel, updateHotel } from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

const AMENITIES_LIST = ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Free Parking', 'WiFi', 'Concierge', 'Room Service', 'Laundry', 'Business Center', 'Airport Shuttle', 'Beach Access', 'Pet Friendly', 'Kid Friendly', 'Sauna', 'Hot Tub', 'Tennis Court'];

const defaultRoom = { type: '', price: '', capacity: 2, amenities: [], available: true, totalRooms: 10 };

const Section = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', padding: 28, marginBottom: 24 }}>
    <h3 style={{ fontSize: 17, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--sand)' }}>{title}</h3>
    {children}
  </div>
);

const Grid = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>
);

export default function AddHotel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', category: 'Standard', stars: 4, pricePerNight: '',
    thumbnail: '', images: [''],
    location: { address: '', city: '', state: '', country: '' },
    amenities: [], checkInTime: '14:00', checkOutTime: '11:00',
    isFeatured: false, isActive: true,
    policies: { cancellation: 'Free cancellation up to 24 hours before check-in', pets: false, smoking: false },
    rooms: [{ ...defaultRoom }]
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getHotel(id).then(h => {
        setForm({ ...h, images: h.images?.length ? h.images : [''] });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const toggle = (list, val) => list.includes(val) ? list.filter(i => i !== val) : [...list, val];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, images: form.images.filter(Boolean) };
      if (isEdit) await updateHotel(id, payload);
      else await createHotel(payload);
      toast.success(isEdit ? 'Hotel updated!' : 'Hotel created!');
      navigate('/admin/hotels');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save hotel'); }
    finally { setSaving(false); }
  };

  const updateRoom = (i, key, val) => {
    const rooms = [...form.rooms];
    rooms[i] = { ...rooms[i], [key]: val };
    setForm(f => ({ ...f, rooms }));
  };

  const addRoom = () => setForm(f => ({ ...f, rooms: [...f.rooms, { ...defaultRoom }] }));
  const removeRoom = (i) => setForm(f => ({ ...f, rooms: f.rooms.filter((_, idx) => idx !== i) }));



  if (loading) return <AdminLayout title={isEdit ? 'Edit Hotel' : 'Add Hotel'}><div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div></AdminLayout>;

  return (
    <AdminLayout title={isEdit ? 'Edit Hotel' : 'Add New Hotel'}
      action={<Link to="/admin/hotels" className="btn btn-outline btn-sm"><ArrowLeft size={15} />Back</Link>}>
      <form onSubmit={handleSubmit}>
        <Section title="Basic Information">
          <Grid>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Hotel Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="The Grand Meridian" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Description *</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={4} placeholder="Describe the hotel experience..." />
            </div>
            <div>
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {['Budget', 'Standard', 'Luxury', 'Resort', 'Boutique'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>Star Rating</label>
              <select value={form.stars} onChange={e => setForm(f => ({ ...f, stars: parseInt(e.target.value) }))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label>Starting Price (per night) *</label>
              <input type="number" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} required placeholder="299" min="1" />
            </div>
            <div>
              <label>Check-in Time</label>
              <input type="time" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))} />
            </div>
            <div>
              <label>Check-out Time</label>
              <input type="time" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', paddingTop: 28 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} />Featured Hotel
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />Active
              </label>
            </div>
          </Grid>
        </Section>

        <Section title="Location">
          <Grid>
            <div style={{ gridColumn: '1/-1' }}>
              <label>Street Address</label>
              <input value={form.location.address} onChange={e => setForm(f => ({ ...f, location: { ...f.location, address: e.target.value } }))} placeholder="123 Ocean Drive" />
            </div>
            <div>
              <label>City *</label>
              <input value={form.location.city} onChange={e => setForm(f => ({ ...f, location: { ...f.location, city: e.target.value } }))} required placeholder="Miami" />
            </div>
            <div>
              <label>State / Province</label>
              <input value={form.location.state} onChange={e => setForm(f => ({ ...f, location: { ...f.location, state: e.target.value } }))} placeholder="FL" />
            </div>
            <div>
              <label>Country *</label>
              <input value={form.location.country} onChange={e => setForm(f => ({ ...f, location: { ...f.location, country: e.target.value } }))} required placeholder="USA" />
            </div>
          </Grid>
        </Section>

        <Section title="Images">
          <div>
            <label>Thumbnail URL</label>
            <input value={form.thumbnail} onChange={e => setForm(f => ({ ...f, thumbnail: e.target.value }))} placeholder="https://images.unsplash.com/..." style={{ marginBottom: 16 }} />
          </div>
          <label>Gallery Images</label>
          {form.images.map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input value={img} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm(f => ({ ...f, images: imgs })); }} placeholder={`Image URL ${i + 1}`} style={{ flex: 1 }} />
              {form.images.length > 1 && (
                <button type="button" onClick={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setForm(f => ({ ...f, images: [...f.images, ''] }))} className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
            <Plus size={14} />Add Image
          </button>
        </Section>

        <Section title="Amenities">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {AMENITIES_LIST.map(a => (
              <button key={a} type="button" onClick={() => setForm(f => ({ ...f, amenities: toggle(f.amenities, a) }))}
                style={{ padding: '8px 16px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', transition: 'var(--transition)', borderColor: form.amenities.includes(a) ? 'var(--gold)' : 'var(--sand)', background: form.amenities.includes(a) ? 'var(--gold)' : 'transparent', color: form.amenities.includes(a) ? '#fff' : 'var(--slate)' }}>
                {a}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Room Types">
          {form.rooms.map((room, i) => (
            <div key={i} style={{ background: 'var(--cream)', borderRadius: 12, padding: 20, marginBottom: 16, position: 'relative' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, color: 'var(--slate)' }}>Room Type {i + 1}</div>
              {form.rooms.length > 1 && (
                <button type="button" onClick={() => removeRoom(i)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                  <Trash2 size={16} />
                </button>
              )}
              <Grid>
                <div>
                  <label>Room Type Name *</label>
                  <input value={room.type} onChange={e => updateRoom(i, 'type', e.target.value)} required placeholder="Deluxe King" />
                </div>
                <div>
                  <label>Price Per Night ($) *</label>
                  <input type="number" value={room.price} onChange={e => updateRoom(i, 'price', e.target.value)} required placeholder="299" min="1" />
                </div>
                <div>
                  <label>Max Capacity (guests)</label>
                  <input type="number" value={room.capacity} onChange={e => updateRoom(i, 'capacity', parseInt(e.target.value))} min="1" max="10" />
                </div>
                <div>
                  <label>Total Rooms Available</label>
                  <input type="number" value={room.totalRooms} onChange={e => updateRoom(i, 'totalRooms', parseInt(e.target.value))} min="1" />
                </div>
              </Grid>
            </div>
          ))}
          <button type="button" onClick={addRoom} className="btn btn-outline btn-sm">
            <Plus size={14} />Add Room Type
          </button>
        </Section>

        <Section title="Policies">
          <div style={{ marginBottom: 16 }}>
            <label>Cancellation Policy</label>
            <textarea value={form.policies.cancellation} onChange={e => setForm(f => ({ ...f, policies: { ...f.policies, cancellation: e.target.value } }))} rows={2} />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
              <input type="checkbox" checked={form.policies.pets} onChange={e => setForm(f => ({ ...f, policies: { ...f.policies, pets: e.target.checked } }))} />Pets Allowed
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 0 }}>
              <input type="checkbox" checked={form.policies.smoking} onChange={e => setForm(f => ({ ...f, policies: { ...f.policies, smoking: e.target.checked } }))} />Smoking Allowed
            </label>
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Link to="/admin/hotels" className="btn btn-outline">Cancel</Link>
          <button type="submit" className="btn btn-gold" disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Hotel' : 'Create Hotel'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
