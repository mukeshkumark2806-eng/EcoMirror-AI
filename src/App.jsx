/**
 * @fileoverview Root application component.
 * All page routes are lazily loaded for optimal bundle splitting.
 * @module App
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSwitcher from './components/ui/LanguageSwitcher';
import Layout from './components/layout/Layout';
import ToastContainer from './components/ui/Toast';
import LoadingScreen from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import ScrollToTop from './components/ui/ScrollToTop';

/* ── Lazily-loaded page modules (route-level code-splitting) ── */
const LandingPage      = lazy(() => import('./pages/Landing/LandingPage'));
const OnboardingPage   = lazy(() => import('./pages/Onboarding/OnboardingPage'));
const AssessmentPage   = lazy(() => import('./pages/Assessment/AssessmentPage'));
const ResultsPage      = lazy(() => import('./pages/Results/ResultsPage'));
const DetectivePage    = lazy(() => import('./pages/Detective/DetectivePage'));
const ActionPlanPage   = lazy(() => import('./pages/ActionPlan/ActionPlanPage'));
const EcoCoachPage     = lazy(() => import('./pages/EcoCoach/EcoCoachPage'));
const DashboardPage    = lazy(() => import('./pages/Dashboard/DashboardPage'));
const LoggerPage       = lazy(() => import('./pages/Logger/LoggerPage'));
const MirrorPage       = lazy(() => import('./pages/Mirror/MirrorPage'));
const InsightsPage     = lazy(() => import('./pages/Insights/InsightsPage'));
const ChallengesPage   = lazy(() => import('./pages/Challenges/ChallengesPage'));
const LearnPage        = lazy(() => import('./pages/Learn/LearnPage'));
const AchievementsPage = lazy(() => import('./pages/Achievements/AchievementsPage'));
const SettingsPage     = lazy(() => import('./pages/Settings/SettingsPage'));

/** Shared Suspense fallback for all lazy pages. */
const PageLoader = <LoadingScreen />;

/**
 * Guards authenticated-only routes, redirecting unauthenticated users to
 * the landing page.
 */
function ProtectedRoute({ children }) {
  const { isOnboarded } = useUser();
  if (!isOnboarded) return <Navigate to="/" replace />;
  return children;
}

/** Declares all application routes. */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public (full-screen) pages ── */}
      <Route path="/" element={
        <Suspense fallback={PageLoader}><LandingPage /></Suspense>
      } />
      <Route path="/onboarding" element={
        <Suspense fallback={PageLoader}><OnboardingPage /></Suspense>
      } />
      <Route path="/assessment" element={
        <Suspense fallback={PageLoader}><AssessmentPage /></Suspense>
      } />
      <Route path="/results" element={
        <Suspense fallback={PageLoader}><ResultsPage /></Suspense>
      } />
      <Route path="/detective" element={
        <Suspense fallback={PageLoader}><DetectivePage /></Suspense>
      } />
      <Route path="/action-plan" element={
        <Suspense fallback={PageLoader}><ActionPlanPage /></Suspense>
      } />
      <Route path="/eco-coach" element={
        <Suspense fallback={PageLoader}><EcoCoachPage /></Suspense>
      } />

      {/* ── Authenticated pages (with sidebar nav) ── */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"    element={<Suspense fallback={PageLoader}><DashboardPage /></Suspense>} />
        <Route path="/log"          element={<Suspense fallback={PageLoader}><LoggerPage /></Suspense>} />
        <Route path="/mirror"       element={<Suspense fallback={PageLoader}><MirrorPage /></Suspense>} />
        <Route path="/insights"     element={<Suspense fallback={PageLoader}><InsightsPage /></Suspense>} />
        <Route path="/challenges"   element={<Suspense fallback={PageLoader}><ChallengesPage /></Suspense>} />
        <Route path="/learn"        element={<Suspense fallback={PageLoader}><LearnPage /></Suspense>} />
        <Route path="/achievements" element={<Suspense fallback={PageLoader}><AchievementsPage /></Suspense>} />
        <Route path="/settings"     element={<Suspense fallback={PageLoader}><SettingsPage /></Suspense>} />
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Root application component.
 * Provides context providers, error boundary, and global UI (toast, language switcher).
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <UserProvider>
          <ToastProvider>
            <LanguageProvider>
              <AppRoutes />
              <LanguageSwitcher />
              <ToastContainer />
            </LanguageProvider>
          </ToastProvider>
        </UserProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
