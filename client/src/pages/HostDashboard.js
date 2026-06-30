import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccommodations } from '../api';

const HostDashboard = () => {
  const { user, becomeHost, logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadListings();
  }, [user]);

  const loadListings = async () => {
    try {
      const data = await getAccommodations();
      const myListings = user?.role === 'host'
        ? data.filter((l) => l.host_id === user._id)
        : [];
      setListings(myListings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isHost = user.role === 'host';

  if (!isHost) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-airbnb/10 flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
        <h1 className="text-3xl font-semibold mb-4">Become a Host</h1>
        <p className="text-grey mb-8 max-w-md mx-auto leading-relaxed">
          Share your space and earn extra income. List your property on Airbnb and connect with travellers from around the world.
        </p>
        <button
          onClick={becomeHost}
          className="btn-primary text-lg px-10 py-4"
        >
          Become a Host
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Listings', value: listings.length, color: 'bg-airbnb' },
    { label: 'Active Listings', value: listings.filter((l) => l.price > 0).length, color: 'bg-green-500' },
    { label: 'Bookings', value: '—', color: 'bg-blue-500' },
    { label: 'Earnings', value: '—', color: 'bg-purple-500' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Host Dashboard</h1>
        <Link to="/create" className="btn-primary">+ New Listing</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-grey">{stat.label}</p>
          </div>
        ))}
      </div>

      {error && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-6 border border-red-200">{error}</div>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex gap-4">
                <div className="w-24 h-20 skeleton rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 skeleton w-1/2" />
                  <div className="h-3 skeleton w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <p className="text-grey text-lg">No listings yet</p>
          <p className="text-sm text-grey mt-1">Create your first property listing to start hosting.</p>
          <Link to="/create" className="btn-primary mt-4 inline-block">Create Listing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div key={listing._id} className="card overflow-hidden flex">
              <div className="w-32 h-32 flex-shrink-0 bg-grey-bg overflow-hidden">
                {listing.images?.[0] ? (
                  <img src={`http://localhost:5000${listing.images[0]}`} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-grey text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{listing.title}</h3>
                  <p className="text-xs text-grey">{listing.location}</p>
                  <p className="text-sm font-semibold text-airbnb mt-1">R{listing.price} / night</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => navigate(`/location/${listing._id}`)} className="text-xs px-3 py-1.5 border border-grey-light rounded-lg hover:bg-grey-bg transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostDashboard;
