import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReservationsByHost, getReservationsByUser } from '../api';

const Reservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }

  useEffect(() => {
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    try {
      let data;
      if (user.role === 'host' || user.role === 'admin') {
        data = await getReservationsByHost();
      } else {
        data = await getReservationsByUser();
      }
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const statusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700';
      case 'cancelled': return 'bg-red-50 text-red-600';
      case 'pending': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-grey-bg text-grey';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Reservations</h1>
      </div>

      {error && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-6 border border-red-200">{error}</div>}

      {loading ? (
        <div className="card animate-pulse p-8">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-10 skeleton flex-[2]" />
                <div className="h-10 skeleton flex-1" />
                <div className="h-10 skeleton flex-1" />
                <div className="h-10 skeleton flex-1" />
                <div className="h-10 skeleton w-16" />
              </div>
            ))}
          </div>
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-20 card">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <p className="text-grey text-lg">No reservations found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-grey-bg">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Property</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Guest</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Check In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Check Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Nights</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Guests</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-grey tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r._id} className="border-t border-grey-light hover:bg-grey-bg/50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium">{r.accommodation?.title || 'Deleted'}</td>
                    <td className="px-4 py-4 text-sm text-grey">{r.user?.username || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm">{formatDate(r.checkIn)}</td>
                    <td className="px-4 py-4 text-sm">{formatDate(r.checkOut)}</td>
                    <td className="px-4 py-4 text-sm">{r.totalNights}</td>
                    <td className="px-4 py-4 text-sm">{r.guests}</td>
                    <td className="px-4 py-4 text-sm font-semibold">R{r.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
