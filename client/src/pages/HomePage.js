import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAccommodations } from "../api";
import PropertyCard from "../components/PropertyCard";

const sections = [
  { title: "Explore Cape Town", location: "Cape Town" },
  { title: "Discover Johannesburg", location: "Johannesburg" },
  { title: "Durban getaways", location: "Durban" },
  { title: "Live in Midrand", location: "Midrand" },
  { title: "More destinations", location: "Stellenbosch" },
];

const SkeletonRow = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[4/3] skeleton mb-2" />
        <div className="space-y-1.5">
          <div className="h-3 skeleton w-3/4" />
          <div className="h-2.5 skeleton w-1/2" />
          <div className="h-3 skeleton w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const PropertySection = ({ title, location }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAccommodations({ location })
      .then((data) => { if (!cancelled) setListings(data.slice(0, 5)); })
      .catch(() => { if (!cancelled) setListings([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [location]);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="py-6 md:py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
        <button
          onClick={() => navigate(`/location?location=${encodeURIComponent(location)}`)}
          className="text-sm text-airbnb font-semibold hover:underline bg-none border-none cursor-pointer"
        >
          Show all
        </button>
      </div>
      {loading ? (
        <SkeletonRow />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {listings.map((listing) => (
            <PropertyCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden my-4 md:my-6 h-[300px] md:h-[500px] bg-gradient-to-br from-airbnb via-airbnb-dark to-airbnb">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img
          src="https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=1400&h=800&fit=crop"
          alt="South Africa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20" />
        <div className="relative z-30 h-full flex flex-col justify-center items-start px-6 md:px-16">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight max-w-xl mb-4 md:mb-6">
            Not sure where to go? Perfect.
          </h1>
          <button
            onClick={() => navigate("/location")}
            className="bg-white text-charcoal font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            I'm flexible
          </button>
        </div>
      </section>

      {/* Property Sections */}
      {sections.map((s) => (
        <PropertySection key={s.location} title={s.title} location={s.location} />
      ))}

      {/* Gift Cards Section */}
      <section className="py-8 md:py-12">
        <div className="bg-grey-bg rounded-2xl p-6 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-3">
                Shop Airbnb Gift Cards
              </h2>
              <p className="text-sm text-grey mb-4 leading-relaxed">
                Give the gift of travel with Airbnb gift cards. Perfect for any
                occasion, they can be used for stays and experiences worldwide.
              </p>
              <button className="btn-primary">Shop now</button>
            </div>
            <div className="relative h-[200px] md:h-[280px] rounded-xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1607083206968-2f89b3f0d0c0?w=600&h=400&fit=crop"
                alt="Gift cards"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hosting Section */}
      <section className="pb-8 md:pb-12">
        <div className="relative rounded-2xl overflow-hidden h-[280px] md:h-[400px]">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img
            src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&h=800&fit=crop"
            alt="Questions about hosting"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-6">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold text-white mb-4 md:mb-6">
              Questions about hosting?
            </h2>
            <button className="bg-white text-charcoal font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200">
              Ask a Superhost
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
