import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import LocationDetailsPage from './pages/LocationDetailsPage';
import LoginPage from './pages/LoginPage';
import ReservationsPage from './pages/ReservationsPage';
import HostDashboard from './pages/HostDashboard';
import CreateListing from './pages/HostCreateListing';

const App = () => (
  <AuthProvider>
    <Header />
    <main className="min-h-[calc(100vh-80px)]">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/location/:id" element={<LocationDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/create" element={<CreateListing />} />
      </Routes>
    </main>
    <Footer />
  </AuthProvider>
);

export default App;
