const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const request = async (endpoint, options = {}) => {
  const token = getToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  if (config.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  let res;
  try {
    res = await fetch(`${API_URL}${endpoint}`, config);
  } catch {
    throw new Error('Network error — please check your connection and ensure the server is running');
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid response from server');
  }

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const login = (email, password) =>
  request('/api/users/login', {
    method: 'POST',
    body: { email, password },
  });

export const getAccommodations = () => request('/api/accommodations');

export const getAccommodationById = (id) => request(`/api/accommodations/${id}`);

export const createAccommodation = (formData) =>
  request('/api/accommodations', {
    method: 'POST',
    body: formData,
    headers: {},
  });

export const updateAccommodation = (id, formData) =>
  request(`/api/accommodations/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {},
  });

export const deleteAccommodation = (id) =>
  request(`/api/accommodations/${id}`, {
    method: 'DELETE',
  });

export const getReservationsByUser = () => request('/api/reservations/user');

export const getReservationsByHost = () => request('/api/reservations/host');
