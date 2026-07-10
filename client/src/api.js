const API_URL = process.env.REACT_APP_API_URL || '';

const getToken = () => localStorage.getItem('client_token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, config);
  } catch (err) {
    throw new Error('Network error — please check your connection and ensure the server is running');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server');
  }

  if (res.status === 401) {
    localStorage.removeItem('client_token');
    localStorage.removeItem('client_user');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error(data.message || 'Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL || 'http://localhost:5000'}${imagePath}`;
};

export const DEFAULT_LISTING_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';

export const getListingImage = (listing) => {
  const url = getImageUrl(listing?.images?.[0]);
  return url || DEFAULT_LISTING_IMAGE;
};

export const login = (email, password) =>
  request('/api/users/login', {
    method: 'POST',
    body: { email, password },
  });

export const register = (username, email, password) =>
  request('/api/users/register', {
    method: 'POST',
    body: { username, email, password },
  });

export const updateUserRole = (role) =>
  request('/api/users/role', {
    method: 'PUT',
    body: { role },
  });

export const getAccommodations = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/api/accommodations${query ? `?${query}` : ''}`);
};

export const getAccommodationById = (id) =>
  request(`/api/accommodations/${id}`);

export const createReservation = (reservationData) =>
  request('/api/reservations', {
    method: 'POST',
    body: reservationData,
  });

export const getReservationsByUser = () =>
  request('/api/reservations/user');

export const createAccommodation = (formData) =>
  request('/api/accommodations', {
    method: 'POST',
    body: formData,
  });
