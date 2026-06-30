import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role !== 'admin') {
        logout();
        setServerError('Access denied. Admin privileges required.');
        return;
      }
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-airbnb/[0.03] to-airbnb/[0.08] px-4">
      <div className="bg-white rounded-2xl shadow-airbnb-lg w-full max-w-[420px] p-10">
        <div className="text-center mb-8">
          <svg viewBox="0 0 1000 1000" fill="none" className="w-14 h-14 mx-auto mb-4">
            <rect width="1000" height="1000" rx="200" fill="#FF385C"/>
            <path d="M500 200C400 200 300 300 250 400C200 500 200 600 250 650C300 700 400 700 500 800C600 700 700 700 750 650C800 600 800 500 750 400C700 300 600 200 500 200Z" fill="white"/>
          </svg>
          <h1 className="text-2xl font-semibold">Admin Login</h1>
          <p className="text-sm text-grey mt-1">Sign in to manage your listings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && <div className="bg-airbnb-light text-airbnb-dark px-4 py-3 rounded-xl text-sm border border-red-200">{serverError}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-airbnb' : 'border-grey-light'} rounded-xl text-sm outline-none transition-all duration-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="block text-airbnb text-xs mt-1">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-airbnb' : 'border-grey-light'} rounded-xl text-sm outline-none transition-all duration-200 focus:border-charcoal focus:ring-1 focus:ring-charcoal`}
              placeholder="Enter your password"
            />
            {errors.password && <span className="block text-airbnb text-xs mt-1">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary w-full py-3.5" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
