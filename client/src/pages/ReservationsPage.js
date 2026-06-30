import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReservationsByUser } from '../api';

const ReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, [user]);

  const loadReservations = async () => {
    try {
      const data = await getReservationsByUser();
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-8">Your Reservations</h1>
      {error && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-6 border border-red-200">{error}</div>}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="flex">
                <div className="w-48 h-32 skeleton flex-shrink-0" />
                <div className="flex-1 p-4 space-y-3">
                  <div className="h-4 skeleton w-2/3" />
                  <div className="h-3 skeleton w-1/3" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="text-center py-20">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18"/>
            <path d="M9 21V9"/>
          </svg>
          <p className="text-grey text-lg">No reservations yet</p>
          <button onClick={() => navigate('/location')} className="btn-primary mt-4">Browse listings</button>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r._id} className="card overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-32 flex-shrink-0 overflow-hidden bg-grey-bg">
                {r.accommodation?.images?.[0] ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${r.accommodation.images[0]}`}
                    alt={r.accommodation.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-grey text-sm">No Image</div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col gap-1.5">
                <h3 className="font-semibold text-base">{r.accommodation?.title || 'Deleted listing'}</h3>
                <p className="text-sm text-grey">{r.accommodation?.location || ''}</p>
                <p className="text-sm">{formatDate(r.checkIn)} - {formatDate(r.checkOut)}</p>
                <p className="text-xs text-grey">{r.guests} guests, {r.totalNights} nights</p>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-lg font-semibold text-airbnb">R{r.totalPrice?.toFixed(2)}</span>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                    r.status === 'confirmed' ? 'bg-green-50 text-green-700' :
                    r.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
