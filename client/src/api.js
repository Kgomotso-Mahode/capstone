const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('client_token');

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
