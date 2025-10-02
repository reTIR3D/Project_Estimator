import React from 'react';
import { Link } from 'react-router-dom';
import DeliverableTemplateConfigurator from '../components/DeliverableTemplateConfigurator';

export default function TemplateConfigurator() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Engineering Estimator
              </Link>
              <div className="flex gap-4">
                <Link to="/" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <Link to="/quick-estimate" className="text-gray-600 hover:text-gray-900">
                  New Estimate
                </Link>
                <Link to="/client-management" className="text-gray-600 hover:text-gray-900">
                  Clients
                </Link>
                <Link to="/template-configurator" className="text-blue-600 font-medium">
                  Templates
                </Link>
              </div>
            </div>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <DeliverableTemplateConfigurator />
    </div>
  );
}
