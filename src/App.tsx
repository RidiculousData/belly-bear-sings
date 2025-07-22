import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PartyJoinPage } from './pages/PartyJoinPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartyPage } from './pages/PartyPage';
import { ParticipantPage } from './pages/ParticipantPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/party/:partyCode/join" element={<PartyJoinPage />} />
      {/* Main Party view for both host and participants */}
      <Route path="/party/:partyCode" element={<PartyPage />} />
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      {/* Optionally keep /party for legacy or direct access */}
      <Route path="/party" element={
        <ProtectedRoute>
          <PartyPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App; 