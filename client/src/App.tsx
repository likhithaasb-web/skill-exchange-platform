import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PassportPage } from './pages/PassportPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ExchangesPage } from './pages/ExchangesPage';
import { StudioPage } from './pages/StudioPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { TermsPage, PrivacyPolicyPage, GuidelinesPage } from './pages/LegalPages';
import { RightSettingsDrawer } from './components/RightSettingsDrawer';
import { useSettingsDrawer } from './context/SettingsDrawerContext';

// Route Guard for authenticated pages
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
        Loading SkillX session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't completed onboarding, direct them to complete it
  if (!user.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { isSettingsOpen, closeSettings } = useSettingsDrawer();

  return (
    <>
      <RightSettingsDrawer isOpen={isSettingsOpen} onClose={closeSettings} />
      <Routes>

      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />

      {/* Protected Pages */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/passport"
        element={
          <ProtectedRoute>
            <PassportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exchanges"
        element={
          <ProtectedRoute>
            <ExchangesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studio/:studioId"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <ReviewsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/privacy"
        element={<Navigate to="/settings?tab=privacy" replace />}
      />
      <Route
        path="/privacy-center"
        element={<Navigate to="/settings?tab=privacy" replace />}
      />
      <Route
        path="/security"
        element={<Navigate to="/settings?tab=security" replace />}
      />
      <Route
        path="/security-center"
        element={<Navigate to="/settings?tab=security" replace />}
      />
      <Route
        path="/appearance"
        element={<Navigate to="/settings?tab=appearance" replace />}
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};

