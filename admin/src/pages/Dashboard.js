import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccommodations, deleteAccommodation } from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadListings();
  }, [user]);

  const loadListings = async () => {
    try {
      const data = await getAccommodations();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAccommodation(id);
      setListings(listings.filter((l) => l._id !== id));
      setDeleteModal(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const stats = [
    { label: 'Total Listings', value: listings.length, color: 'bg-airbnb' },
    { label: 'Active Listings', value: listings.filter(l => l.price > 0).length, color: 'bg-green-500' },
    { label: 'Bookings', value: '—', color: 'bg-blue-500' },
    { label: 'Revenue', value: '—', color: 'bg-purple-500' },
  ];

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
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

      {/* Error */}
      {error && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-6 border border-red-200">{error}</div>}

      {/* Table */}
      {loading ? (
        <div className="card animate-pulse p-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-12 skeleton flex-1" />
                <div className="h-12 skeleton w-24" />
                <div className="h-12 skeleton w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <p className="text-grey text-lg">No listings yet</p>
          <p className="text-sm text-grey mt-1">Create your first property listing!</p>
          <Link to="/create" className="btn-primary mt-4 inline-block">Create Listing</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grey-bg">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Property Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Price</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Created</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Updated</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing._id} className="border-t border-grey-light hover:bg-grey-bg/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium">{listing.title}</td>
                    <td className="px-4 py-4 text-sm text-grey">{listing.type}</td>
                    <td className="px-4 py-4 text-sm font-semibold">R{listing.price}</td>
                    <td className="px-4 py-4 text-sm text-grey">{formatDate(listing.createdAt)}</td>
                    <td className="px-4 py-4 text-sm text-grey">{formatDate(listing.updatedAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/update/${listing._id}`)}
                          className="px-4 py-1.5 border border-grey-light rounded-lg text-xs font-medium hover:bg-grey-bg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteModal(listing)}
                          className="px-4 py-1.5 border border-airbnb text-airbnb rounded-lg text-xs font-medium hover:bg-airbnb-light transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal(null)}>
          <div className="bg-white rounded-2xl shadow-airbnb-lg max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-airbnb-light text-airbnb flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Delete Listing</h3>
              <p className="text-sm text-grey mb-6">
                Are you sure you want to delete <strong>"{deleteModal.title}"</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-3 border border-grey-light rounded-xl text-sm font-medium hover:bg-grey-bg transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteModal._id)} className="flex-1 py-3 bg-airbnb text-white rounded-xl text-sm font-medium hover:bg-airbnb-dark transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
