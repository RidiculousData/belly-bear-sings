import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PartyHostPage } from './pages/PartyHostPage';
import { PartyJoinPage } from './pages/PartyJoinPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartyPage } from './pages/PartyPage';
import { ParticipantPage } from './pages/ParticipantPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/party/:partyId/join" element={<PartyJoinPage />} />
      <Route path="/party/:partyId/participant" element={<ParticipantPage />} />
      
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
      <Route path="/party" element={
        <ProtectedRoute>
          <PartyPage />
        </ProtectedRoute>
      } />
      <Route path="/party/:partyId" element={
        <ProtectedRoute>
          <PartyHostPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App; 