import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { PartyPage } from './pages/PartyPage';
import { ParticipantPage } from './pages/ParticipantPage';

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
      {/* Protected Participant Page - requires Google sign-in */}
      <Route path="/participant/:partyId" element={
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