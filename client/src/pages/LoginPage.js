import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (isSignUp && !username.trim()) errs.username = 'Name is required';
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
      if (isSignUp) {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setServerError(err.message || (isSignUp ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-airbnb/[0.03] to-airbnb/[0.08] px-4">
      <div className="bg-white rounded-2xl shadow-airbnb-lg w-full max-w-[420px] p-8 md:p-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <svg width="30" height="32" viewBox="0 0 1007 1080" style={{display:'block'}}>
              <path d="M949.278 666.715C875.957 506.859 795.615 344.664 713.713 184.809C698.893 155.177 670.813 98.2527 645.852 67.8412C609.971 24.1733 556.93 0.779785 503.109 0.779785C449.288 0.779785 396.247 24.1733 360.366 67.8412C335.406 98.2527 307.325 155.177 292.505 184.809C210.603 344.664 130.262 506.859 56.9404 666.715C47.5802 687.769 24.9598 737.675 16.3796 760.289C6.23941 787.581 0.779297 817.213 0.779297 846.845C0.779297 975.509 101.401 1079.22 235.564 1079.22C346.326 1079.22 434.468 1008.26 503.109 934.18C571.751 1008.26 659.892 1079.22 770.655 1079.22C904.817 1079.22 1006.22 975.509 1006.22 846.845C1006.22 817.213 999.979 787.581 989.839 760.289C981.259 737.675 958.638 687.769 949.278 666.715ZM503.109 810.195C447.728 738.455 396.247 649.56 396.247 577.819C396.247 506.079 446.948 470.209 503.109 470.209C559.27 470.209 610.751 508.419 610.751 577.819C610.751 647.22 558.49 738.455 503.109 810.195ZM770.655 998.902C688.628 998.902 618.271 941.557 555.955 872.656C620.205 792.541 691.093 679.121 691.093 577.819C691.093 458.513 598.271 389.892 503.109 389.892C407.947 389.892 315.906 458.513 315.906 577.819C315.906 679.098 386.294 792.478 450.318 872.593C387.995 941.526 317.614 998.902 235.564 998.902C146.642 998.902 81.1209 931.061 81.1209 846.845C81.1209 826.57 84.241 807.856 91.2611 788.361C98.2812 770.426 120.902 720.52 130.262 701.025C203.583 541.17 282.365 380.534 364.267 220.679C379.087 191.047 404.047 141.921 422.768 119.307C443.048 94.3538 471.129 81.0975 503.109 81.0975C535.09 81.0975 563.17 94.3538 583.451 119.307C602.171 141.921 627.132 191.047 641.952 220.679C723.854 380.534 802.635 541.17 875.957 701.025C885.317 720.52 907.937 770.426 914.957 788.361C921.978 807.856 925.878 826.57 925.878 846.845C925.878 931.061 859.576 998.902 770.655 998.902Z" fill="currentcolor"/>
            </svg>
            <span className="text-xl font-semibold text-charcoal">airbnb</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">{isSignUp ? 'Create an account' : 'Welcome to Airbnb'}</h1>
          <p className="text-sm text-grey mt-0.5">{isSignUp ? 'Start your journey' : 'Sign in to continue'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && <div className="bg-airbnb-light text-airbnb-dark px-3 py-2.5 rounded-xl text-xs border border-red-200">{serverError}</div>}

          {isSignUp && (
            <div>
              <label htmlFor="username" className="block text-xs font-medium mb-1">Name</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`input-field py-2.5 ${errors.username ? '!border-airbnb' : ''}`}
                placeholder="Enter your name"
              />
              {errors.username && <span className="block text-airbnb text-xs mt-0.5">{errors.username}</span>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field py-2.5 ${errors.email ? '!border-airbnb' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && <span className="block text-airbnb text-xs mt-0.5">{errors.email}</span>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field py-2.5 ${errors.password ? '!border-airbnb' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && <span className="block text-airbnb text-xs mt-0.5">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? (isSignUp ? 'Signing up...' : 'Logging in...') : (isSignUp ? 'Sign up' : 'Log in')}
          </button>
        </form>

        <p className="text-center text-sm text-grey mt-5">
          {isSignUp ? (
            <>Already have an account?{' '}
              <button onClick={() => { setIsSignUp(false); setServerError(''); }} className="text-airbnb font-semibold hover:underline bg-none border-none cursor-pointer text-sm">
                Log in
              </button>
            </>
          ) : (
            <>Don't have an account?{' '}
              <button onClick={() => { setIsSignUp(true); setServerError(''); }} className="text-airbnb font-semibold hover:underline bg-none border-none cursor-pointer text-sm">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
