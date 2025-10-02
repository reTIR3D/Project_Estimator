import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProjectEstimation from './pages/ProjectEstimation';
import CampaignDetail from './pages/CampaignDetail';
import ClientManagement from './pages/ClientManagement';
import Industries from './pages/Industries';
import Companies from './pages/Companies';
import RateSheets from './pages/RateSheets';
import TemplateConfigurator from './pages/TemplateConfigurator';
import SizeSettings from './pages/SizeSettings';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectEstimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaign/:id"
            element={
              <ProtectedRoute>
                <CampaignDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quick-estimate"
            element={
              <ProtectedRoute>
                <ProjectEstimation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client-management"
            element={
              <ProtectedRoute>
                <ClientManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industries"
            element={
              <ProtectedRoute>
                <Industries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/industries/:industryId/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies/:companyId/rate-sheets"
            element={
              <ProtectedRoute>
                <RateSheets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/template-configurator"
            element={
              <ProtectedRoute>
                <TemplateConfigurator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/size-settings"
            element={
              <ProtectedRoute>
                <SizeSettings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;