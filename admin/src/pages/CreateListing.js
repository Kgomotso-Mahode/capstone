import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createAccommodation } from '../api';

const TYPES = ['Entire apartment', 'Private room', 'Shared room', 'Entire house', 'Entire villa'];
const AMENITY_OPTIONS = ['wifi', 'kitchen', 'free parking', 'pool', 'air conditioning', 'heating', 'washer', 'dryer', 'tv', 'workspace'];

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', location: '', description: '', type: TYPES[0],
    bedrooms: 1, bathrooms: 1, guests: 1, price: '',
    weeklyDiscount: 0, cleaningFee: 0, serviceFee: 0, occupancyTaxes: 0,
    amenities: [],
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) { navigate('/login'); return null; }

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: inputType === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleAmenity = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImages = (e) => {
    setImages([...e.target.files]);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.price || form.price <= 0) errs.price = 'Price must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'amenities') {
          value.forEach((a) => formData.append('amenities', a));
        } else {
          formData.append(key, value);
        }
      });
      images.forEach((img) => formData.append('images', img));

      await createAccommodation(formData);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 border ${errors[field] ? 'border-airbnb' : 'border-grey-light'} rounded-xl text-sm outline-none transition-all duration-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal`;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      <div className="card p-8 md:p-10">
        <h1 className="text-2xl font-semibold mb-8">Create New Listing</h1>
        {serverError && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm mb-6 border border-red-200">{serverError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input name="title" value={form.title} onChange={handleChange} className={inputClass('title')} />
              {errors.title && <span className="block text-airbnb text-xs mt-1">{errors.title}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className={inputClass('location')} />
              {errors.location && <span className="block text-airbnb text-xs mt-1">{errors.location}</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea name="description" rows="3" value={form.description} onChange={handleChange} className={inputClass('description')} />
            {errors.description && <span className="block text-airbnb text-xs mt-1">{errors.description}</span>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="input-field">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bedrooms</label>
              <input name="bedrooms" type="number" min="1" value={form.bedrooms} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Bathrooms</label>
              <input name="bathrooms" type="number" min="1" value={form.bathrooms} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Guests</label>
              <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price per night (R)</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className={inputClass('price')} />
              {errors.price && <span className="block text-airbnb text-xs mt-1">{errors.price}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Weekly Discount (%)</label>
              <input name="weeklyDiscount" type="number" min="0" value={form.weeklyDiscount} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Cleaning Fee (R)</label>
              <input name="cleaningFee" type="number" min="0" value={form.cleaningFee} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Service Fee (R)</label>
              <input name="serviceFee" type="number" min="0" value={form.serviceFee} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Occupancy Taxes (R)</label>
              <input name="occupancyTaxes" type="number" min="0" value={form.occupancyTaxes} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => handleAmenity(a)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                    form.amenities.includes(a)
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-grey-light hover:border-charcoal'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Images</label>
            <div className="border-2 border-dashed border-grey-light rounded-xl p-6 text-center hover:border-charcoal transition-colors cursor-pointer">
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" className="mx-auto mb-2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                <p className="text-sm text-grey">Click to upload images</p>
                {images.length > 0 && <p className="text-sm text-airbnb mt-2">{images.length} file(s) selected</p>}
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
