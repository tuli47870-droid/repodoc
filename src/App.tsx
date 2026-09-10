import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { FindingsPage } from './pages/FindingsPage';
import { FindingDetailPage } from './pages/FindingDetailPage';
import { SecurityPage } from './pages/SecurityPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DependenciesPage } from './pages/DependenciesPage';
import { BuildPage } from './pages/BuildPage';
import { TestsPage } from './pages/TestsPage';
import { RuntimePage } from './pages/RuntimePage';
import { ScanProgressPage } from './pages/ScanProgressPage';
import { FixWorkspacePage } from './pages/FixWorkspacePage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [hasRepository, setHasRepository] = useState(false);

  return (
    <div className="dark">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              hasRepository ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage onRepositoryConnected={() => setHasRepository(true)} />
              )
            }
          />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/findings" element={<FindingsPage />} />
            <Route path="/findings/:id" element={<FindingDetailPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/dependencies" element={<DependenciesPage />} />
            <Route path="/build" element={<BuildPage />} />
            <Route path="/tests" element={<TestsPage />} />
            <Route path="/runtime" element={<RuntimePage />} />
            <Route path="/scan" element={<ScanProgressPage />} />
            <Route path="/fix/:id" element={<FixWorkspacePage />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
