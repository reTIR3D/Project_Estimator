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
import DeliverablesPrototype from './pages/DeliverablesPrototype';
import EquipmentPrototype from './pages/EquipmentPrototype';
import IntegratedEstimationPrototype from './pages/IntegratedEstimationPrototype';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 text-center font-bold text-lg shadow-lg">
          🎯 BEETZ BRANCH - Testing Live Updates! 🚀
        </div>
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
          <Route
            path="/deliverables-prototype"
            element={
              <ProtectedRoute>
                <DeliverablesPrototype />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment-prototype"
            element={
              <ProtectedRoute>
                <EquipmentPrototype />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integrated-prototype"
            element={
              <ProtectedRoute>
                <IntegratedEstimationPrototype />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;