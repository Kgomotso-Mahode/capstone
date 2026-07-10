import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getListingImage } from '../api';

const PropertyCard = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div
      className="group cursor-pointer"
      onClick={() => navigate(`/location/${listing._id}`)}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-xl mb-2 bg-grey-bg">
        <img
          src={getListingImage(listing)}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
          <p className="text-xs text-grey truncate">{listing.type} · {listing.location}</p>
          <p className="text-sm mt-1">
            <span className="font-semibold">R{listing.price}</span>
            <span className="text-grey text-xs"> / night</span>
          </p>
        </div>
        <span className="flex items-center gap-0.5 text-xs whitespace-nowrap flex-shrink-0 mt-0.5">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="#FF385C">
            <path d="M8 1.5l2.12 4.29 4.74.69-3.43 3.34.81 4.72L8 11.77l-4.24 2.77.81-4.72L1.14 6.48l4.74-.69L8 1.5z"/>
          </svg>
          {listing.rating}
        </span>
      </div>
    </div>
  );
};

export default PropertyCard;
