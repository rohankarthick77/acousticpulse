import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { AppLayout } from './components/layout/AppLayout.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { DashboardOverview } from './pages/DashboardOverview.jsx';
import { LiveMonitoringPage } from './pages/LiveMonitoringPage.jsx';
import { NoiseMapPage } from './pages/NoiseMapPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { AcousticProfilesPage } from './pages/AcousticProfilesPage.jsx';
import { ComplaintsPage } from './pages/ComplaintsPage.jsx';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage.jsx';
import { AlertsPage } from './pages/AlertsPage.jsx';
import { RecommendationsPage } from './pages/RecommendationsPage.jsx';
import { SimulatorPage } from './pages/SimulatorPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { StationManagementPage } from './pages/StationManagementPage.jsx';
import { UserManagementPage } from './pages/UserManagementPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Landing & Login Route */}
              <Route path="/login" element={<LandingPage />} />

              {/* Main Shell Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="monitoring" element={<LiveMonitoringPage />} />
                <Route path="map" element={<NoiseMapPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="profiles" element={<AcousticProfilesPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="complaints/:identifier" element={<ComplaintDetailPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="simulator" element={<SimulatorPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="stations" element={<StationManagementPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
