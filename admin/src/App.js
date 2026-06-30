import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Reservations from './pages/Reservations';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-grey text-lg">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') {
    return <div className="flex items-center justify-center h-screen text-grey text-lg">Access denied. Admin only.</div>;
  }
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-grey text-lg">Loading...</div>;

  return (
    <>
      {user && <Header />}
      <main className={user ? 'min-h-[calc(100vh-64px)]' : ''}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/update/:id" element={<ProtectedRoute><UpdateListing /></ProtectedRoute>} />
          <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
