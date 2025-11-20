import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartyPage } from './pages/PartyPage';
import { ParticipantPage } from './pages/ParticipantPage';
import { DomainModelPage } from './pages/DomainModelPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
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
      <Route path="/domain-model" element={
        <ProtectedRoute>
          <DomainModelPage />
        </ProtectedRoute>
      } />
      {/* Protected Participant Page - requires Google sign-in - now uses partyCode like party page */}
      <Route path="/participant/:partyCode" element={
        <ProtectedRoute>
          <ParticipantPage />
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