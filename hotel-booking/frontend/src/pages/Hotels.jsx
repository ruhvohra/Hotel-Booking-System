import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHotels } from '../utils/api';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Luxury', 'Resort', 'Boutique', 'Standard', 'Budget'];
const STAR_OPTIONS = [5, 4, 3, 2];

export default function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    stars: searchParams.get('stars') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: 'rating',
  });

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 12 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const data = await getHotels(params);
      setHotels(data.hotels);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const updateFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', stars: '', minPrice: '', maxPrice: '', sortBy: 'rating' });
    setPage(1);
  };

  const hasFilters = filters.category || filters.stars || filters.minPrice || filters.maxPrice;

  return (
    <div className="page" style={{ paddingTop: 90 }}>
      {/* Search bar */}
      <div style={{ background: 'var(--ivory)', padding: '24px 0', borderBottom: '1px solid var(--sand)' }}>
        <div className="container">
          <SearchBar compact onSearch={f => { updateFilter('search', f.search); }} />
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>
              {filters.search ? `Results for "${filters.search}"` : 'All Hotels'}
            </h1>
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{total} properties found</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select value={filters.sortBy} onChange={e => updateFilter('sortBy', e.target.value)}
              style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--sand)', fontSize: 13, background: '#fff', width: 'auto' }}>
              <option value="rating">Top Rated</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline btn-sm" style={{ gap: 8 }}>
              <SlidersHorizontal size={15} />Filters {hasFilters && <span style={{ background: 'var(--gold)', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>!</span>}
            </button>
            {hasFilters && <button onClick={clearFilters} className="btn btn-sm" style={{ color: 'var(--danger)', background: 'transparent', border: '1.5px solid var(--sand)' }}><X size={14} />Clear</button>}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--sand)', padding: 24, marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            <div>
              <label>Category</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => updateFilter('category', filters.category === c ? '' : c)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', transition: 'var(--transition)', borderColor: filters.category === c ? 'var(--gold)' : 'var(--sand)', background: filters.category === c ? 'var(--gold)' : 'transparent', color: filters.category === c ? '#fff' : 'var(--slate)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Minimum Stars</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {STAR_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateFilter('stars', filters.stars == s ? '' : s)}
                    style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', borderColor: filters.stars == s ? 'var(--gold)' : 'var(--sand)', background: filters.stars == s ? 'var(--gold)' : 'transparent', color: filters.stars == s ? '#fff' : 'var(--slate)' }}>
                    {s}★+
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label>Price Range (per night)</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <input type="number" placeholder="Min $" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} style={{ width: '50%' }} />
                <input type="number" placeholder="Max $" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} style={{ width: '50%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Hotel grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 380, borderRadius: 20 }} />)}
          </div>
        ) : hotels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
            <h3 style={{ marginBottom: 8 }}>No hotels found</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn btn-gold">Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {hotels.map(h => <HotelCard key={h._id} hotel={h} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 48 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-outline btn-sm" style={{ opacity: page === 1 ? 0.4 : 1 }}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 36, height: 36, borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, transition: 'var(--transition)', borderColor: page === p ? 'var(--gold)' : 'var(--sand)', background: page === p ? 'var(--gold)' : 'transparent', color: page === p ? '#fff' : 'var(--slate)' }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn btn-outline btn-sm" style={{ opacity: page === pages ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
