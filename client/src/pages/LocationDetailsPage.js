import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccommodationById, createReservation, getImageUrl, DEFAULT_LISTING_IMAGE } from '../api';

const SkeletonDetails = () => (
  <div className="max-w-[1120px] mx-auto px-6 py-8 animate-pulse">
    <div className="h-8 skeleton w-2/3 mb-6" />
    <div className="h-[450px] skeleton mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
      <div className="space-y-6">
        <div className="h-6 skeleton w-1/2" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-3/4" />
        <div className="h-32 skeleton" />
      </div>
      <div className="h-96 skeleton" />
    </div>
  </div>
);

const LocationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveMsg, setReserveMsg] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const data = await getAccommodationById(id);
      setListing(data);
      setGuests(data.guests || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImage = (imgPath) => {
    return getImageUrl(imgPath) || DEFAULT_LISTING_IMAGE;
  };

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const totalNights = calcNights();

  const calcTotal = () => {
    if (!listing || totalNights <= 0) return 0;
    let total = listing.price * totalNights;
    if (listing.weeklyDiscount > 0 && totalNights >= 7) {
      total -= total * (listing.weeklyDiscount / 100);
    }
    total += (listing.cleaningFee || 0) + (listing.serviceFee || 0) + (listing.occupancyTaxes || 0);
    return total;
  };

  const getSavings = () => {
    if (!listing || totalNights < 7 || !listing.weeklyDiscount) return 0;
    return (listing.price * totalNights) * (listing.weeklyDiscount / 100);
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut) {
      setReserveMsg('Please select check-in and check-out dates');
      return;
    }
    if (totalNights <= 0) {
      setReserveMsg('Check-out must be after check-in');
      return;
    }

    setReserving(true);
    setReserveMsg('');
    try {
      const total = calcTotal();
      const reservation = await createReservation({
        accommodation: listing._id,
        checkIn,
        checkOut,
        guests,
      });
      setReserveMsg(`Reservation confirmed! Total: R${reservation.totalPrice?.toFixed(2) || total.toFixed(2)}`);
    } catch (err) {
      setReserveMsg(err.message || 'Reservation failed');
    } finally {
      setReserving(false);
    }
  };

  if (loading) return <SkeletonDetails />;
  if (error) return <div className="max-w-[1120px] mx-auto px-6 py-20 text-center text-grey text-lg">Error: {error}</div>;
  if (!listing) return <div className="max-w-[1120px] mx-auto px-6 py-20 text-center text-grey text-lg">Listing not found</div>;

  const images = listing.images?.length > 0
    ? listing.images.map((img) => getImage(img))
    : [DEFAULT_LISTING_IMAGE];

  while (images.length < 5) {
    images.push(images[0]);
  }

  return (
    <div className="max-w-[1120px] mx-auto px-4 md:px-6 py-4">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-xl md:text-2xl font-semibold">{listing.type} in {listing.location}</h1>
        <div className="flex items-center gap-2 mt-1 text-sm">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="#FF385C">
              <path d="M8 1.5l2.12 4.29 4.74.69-3.43 3.34.81 4.72L8 11.77l-4.24 2.77.81-4.72L1.14 6.48l4.74-.69L8 1.5z"/>
            </svg>
            {listing.rating} · {listing.reviews} reviews
          </span>
          <span className="text-grey">·</span>
          <span className="text-grey">{listing.location}</span>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-1 max-h-[400px]">
          <div className="overflow-hidden cursor-pointer min-h-[300px] md:min-h-0" onClick={() => setShowAllImages(true)}>
            <img src={images[0]} alt={listing.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-1">
            {images.slice(1, 5).map((img, i) => (
              <div key={i} className="overflow-hidden cursor-pointer" onClick={() => { setSelectedImage(i + 1); setShowAllImages(true); }}>
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowAllImages(true)}
          className="absolute bottom-4 right-4 bg-white text-charcoal text-sm font-semibold px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-shadow z-10"
        >
          Show all photos
        </button>
      </div>

      {/* Image Lightbox */}
      {showAllImages && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8" onClick={() => setShowAllImages(false)}>
          <button className="absolute top-4 right-4 text-white text-2xl z-10 w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors" onClick={() => setShowAllImages(false)}>
            ✕
          </button>
          <img src={images[selectedImage]} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${selectedImage === i ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
        {/* Left Column */}
        <div>
          {/* Title & Host */}
          <div className="pb-6 border-b border-grey-light">
            <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
            <p className="text-sm text-grey">
              {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms
            </p>
          </div>

          {/* Host Info */}
          <div className="py-6 border-b border-grey-light flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-airbnb text-white flex items-center justify-center text-lg font-semibold flex-shrink-0">
              {(listing.host || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">Hosted by {listing.host || 'Airbnb'}</p>
              <p className="text-sm text-grey">Superhost · {listing.reviews || 0} reviews</p>
            </div>
          </div>

          {/* Accomodation details */}
          <div className="py-6 border-b border-grey-light">
            <h3 className="font-semibold text-base mb-4">About this place</h3>
            <p className="text-sm text-grey leading-relaxed">{listing.description}</p>
          </div>

          {/* Sleep */}
          <div className="py-6 border-b border-grey-light">
            <h3 className="font-semibold text-base mb-4">Where you'll sleep</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border border-grey-light rounded-xl p-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3">
                  <rect x="2" y="3" width="20" height="18" rx="2"/>
                  <path d="M2 9h20"/>
                </svg>
                <p className="font-medium text-sm">Bedroom 1</p>
                <span className="text-xs text-grey">1 double bed</span>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="py-6 border-b border-grey-light">
            <h3 className="font-semibold text-base mb-4">What this place offers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listing.amenities?.map((a) => (
                <div key={a} className="flex items-center gap-3 text-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M13.5 3.5l-8 8-3-3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="py-6 border-b border-grey-light">
            <h3 className="font-semibold text-base mb-4">
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#FF385C">
                  <path d="M8 1.5l2.12 4.29 4.74.69-3.43 3.34.81 4.72L8 11.77l-4.24 2.77.81-4.72L1.14 6.48l4.74-.69L8 1.5z"/>
                </svg>
                {listing.rating} · {listing.reviews} reviews
              </span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Cleanliness', value: listing.specificRatings?.cleanliness },
                { label: 'Communication', value: listing.specificRatings?.communication },
                { label: 'Check-in', value: listing.specificRatings?.checkIn },
                { label: 'Accuracy', value: listing.specificRatings?.accuracy },
                { label: 'Location', value: listing.specificRatings?.location },
                { label: 'Value', value: listing.specificRatings?.value },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <span className="flex-1">{item.label}</span>
                  <div className="w-24 h-1 bg-grey-light rounded-full overflow-hidden">
                    <div className="h-full bg-charcoal rounded-full" style={{ width: `${(item.value || 0) * 20}%` }} />
                  </div>
                  <span className="w-4 text-right font-medium">{item.value || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* House Rules */}
          <div className="py-6 border-b border-grey-light">
            <h3 className="font-semibold text-base mb-4">House Rules</h3>
            <div className="space-y-2 text-sm text-grey">
              <p>Check-in: 3:00 PM · Check-out: 11:00 AM</p>
              <p>Self check-in with smart lock</p>
              <p>No pets, no parties, no smoking</p>
            </div>
          </div>

          {/* Cancellation */}
          <div className="py-6">
            <h3 className="font-semibold text-base mb-4">Cancellation Policy</h3>
            <p className="text-sm text-grey leading-relaxed">
              Free cancellation for 48 hours. After that, cancel up to 24 hours before check-in for a partial refund.
            </p>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div>
          <div className="sticky top-24 bg-white border border-grey-light rounded-xl shadow-airbnb-lg p-5">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-2xl font-semibold">R{listing.price}</span>
              <span className="text-grey text-sm"> / night</span>
            </div>
            {listing.weeklyDiscount > 0 && (
              <p className="text-sm text-green-600 mb-4">
                R{(listing.price * 7 * (listing.weeklyDiscount / 100)).toFixed(2)} off weekly stays
              </p>
            )}

            <div className="border border-grey-light rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-b border-grey-light">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full border-none p-0 text-sm outline-none bg-transparent" />
                </div>
                <div className="p-3 border-b border-grey-light">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full border-none p-0 text-sm outline-none bg-transparent" />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1">Guests</label>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full border-none p-0 text-sm outline-none bg-transparent cursor-pointer">
                  {[...Array(listing.guests || 10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{(i > 0) ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="btn-primary w-full py-3.5 text-base mb-3"
              onClick={handleReserve}
              disabled={reserving}
            >
              {reserving ? 'Reserving...' : 'Reserve'}
            </button>

            {reserveMsg && (
              <p className={`text-center text-sm px-3 py-2 rounded-lg mb-3 ${
                reserveMsg.includes('confirmed')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-600'
              }`}>
                {reserveMsg}
              </p>
            )}

            <p className="text-center text-xs text-grey mb-4">You won't be charged yet</p>

            {totalNights > 0 && (
              <div className="space-y-2 pt-4 border-t border-grey-light">
                <div className="flex justify-between text-sm">
                  <span>R{listing.price} x {totalNights} nights</span>
                  <span>R{(listing.price * totalNights).toFixed(2)}</span>
                </div>
                {getSavings() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Weekly discount</span>
                    <span>-R{getSavings().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Cleaning fee</span>
                  <span>R{listing.cleaningFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service fee</span>
                  <span>R{listing.serviceFee?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Occupancy taxes and fees</span>
                  <span>R{listing.occupancyTaxes?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-grey-light">
                  <span>Total</span>
                  <span>R{calcTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationDetailsPage;
