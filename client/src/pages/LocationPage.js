import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAccommodations } from '../api';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="h-48 skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton w-3/4" />
      <div className="h-3 skeleton w-1/2" />
      <div className="h-3 skeleton w-2/3" />
      <div className="h-5 skeleton w-1/3" />
    </div>
  </div>
);

const LocationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialLocation = searchParams.get('location') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState(initialLocation);
  const [filterType, setFilterType] = useState('');
  const [filterGuests, setFilterGuests] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterBedrooms, setFilterBedrooms] = useState('');
  const [filterBathrooms, setFilterBathrooms] = useState('');
  const [favorites, setFavorites] = useState({});
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async (filters = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (filterLocation) params.location = filterLocation;
      if (filterType) params.type = filterType;
      if (filterGuests) params.guests = filterGuests;
      if (filterPrice) params.maxPrice = filterPrice;
      const data = await getAccommodations({ ...filters, ...params });
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleClear = () => {
    setFilterLocation('');
    setFilterType('');
    setFilterGuests('');
    setFilterPrice('');
    setFilterBedrooms('');
    setFilterBathrooms('');
    loadListings({ location: '', type: '', guests: '', maxPrice: '' });
  };

  const getImage = (listing) => {
    if (listing.images && listing.images.length > 0) {
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${listing.images[0]}`;
    }
    return `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop`;
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-grey-bg min-h-[calc(100vh-80px)]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full btn-secondary mb-4 flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2.5" width="14" height="2" rx="1" fill="currentColor"/>
            <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor"/>
            <rect x="1" y="11.5" width="14" height="2" rx="1" fill="currentColor"/>
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-airbnb p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-5">Filters</h3>
              <form onSubmit={handleFilter} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Location</label>
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="City or region"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Type of place</label>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field">
                    <option value="">All types</option>
                    <option value="Entire apartment">Entire apartment</option>
                    <option value="Private room">Private room</option>
                    <option value="Shared room">Shared room</option>
                    <option value="Entire house">Entire house</option>
                    <option value="Entire villa">Entire villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Max price/night</label>
                  <input
                    type="number"
                    min="0"
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(e.target.value)}
                    placeholder="Any price"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Min guests</label>
                  <input
                    type="number"
                    min="1"
                    value={filterGuests}
                    onChange={(e) => setFilterGuests(e.target.value)}
                    placeholder="1+"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Bedrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={filterBedrooms}
                    onChange={(e) => setFilterBedrooms(e.target.value)}
                    placeholder="Any"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5">Bathrooms</label>
                  <input
                    type="number"
                    min="0"
                    value={filterBathrooms}
                    onChange={(e) => setFilterBathrooms(e.target.value)}
                    placeholder="Any"
                    className="input-field"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Apply Filters</button>
                <button type="button" onClick={handleClear} className="w-full py-2.5 border border-grey-light rounded-xl text-sm text-grey cursor-pointer hover:bg-grey-bg transition-colors">
                  Clear All
                </button>
              </form>
            </div>
          </aside>

          {/* Listings */}
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold">
                {listings.length > 0
                  ? `${listings.length} accommodation${listings.length !== 1 ? 's' : ''}${filterLocation ? ` in ${filterLocation}` : ''}`
                  : 'Accommodations'}
              </h1>
              {filterLocation && <p className="text-sm text-grey mt-1">{filterLocation}</p>}
            </div>

            {error && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-5 border border-red-200">{error}</div>}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-4">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <p className="text-grey text-lg">No listings found</p>
                <p className="text-sm text-grey mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="card overflow-hidden cursor-pointer group"
                    onClick={() => navigate(`/location/${listing._id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImage(listing)}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(listing._id); }}
                        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                      >
                        {favorites[listing._id] ? (
                          <HeartSolid className="w-5 h-5 text-airbnb" />
                        ) : (
                          <HeartOutline className="w-5 h-5 text-charcoal" />
                        )}
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-grey">{listing.type}</span>
                        <span className="flex items-center gap-0.5 text-xs">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="#FF385C">
                            <path d="M8 1.5l2.12 4.29 4.74.69-3.43 3.34.81 4.72L8 11.77l-4.24 2.77.81-4.72L1.14 6.48l4.74-.69L8 1.5z"/>
                          </svg>
                          {listing.rating} ({listing.reviews})
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm leading-tight mb-0.5 line-clamp-1">{listing.title}</h3>
                      <p className="text-xs text-grey mb-2 leading-tight line-clamp-1">
                        {listing.amenities?.slice(0, 3).join(' · ')}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold text-sm">R{listing.price}</span>
                        <span className="text-grey text-xs"> / night</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Map placeholder - desktop only */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20 bg-white rounded-xl shadow-airbnb h-[calc(100vh-120px)] overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-grey-bg text-grey text-sm">
                <div className="text-center p-8">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <p>Map view</p>
                  <p className="text-xs mt-1">Explore nearby listings</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
