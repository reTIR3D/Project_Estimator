import React, { useState, useEffect } from 'react';
import { clientsApi } from '../services/api';
import type { Client } from '../types';

interface ClientRateComparisonProps {
  onClose: () => void;
}

export default function ClientRateComparison({ onClose }: ClientRateComparisonProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Roles organized by discipline
  const ROLE_CATEGORIES = {
    'Project Management': [
      'Project Manager',
      'Project Engineer',
      'Project Coordinator',
      'Scheduler',
      'Cost Estimator',
    ],
    'Mechanical': [
      'Lead Mechanical Engineer',
      'Senior Mechanical Engineer',
      'Mechanical Engineer',
      'Mechanical Designer',
      'Piping Designer',
    ],
    'Process': [
      'Lead Process Engineer',
      'Senior Process Engineer',
      'Process Engineer',
      'Process Designer',
    ],
    'Civil': [
      'Lead Civil Engineer',
      'Senior Civil Engineer',
      'Civil Engineer',
      'Civil Designer',
    ],
    'Structural': [
      'Lead Structural Engineer',
      'Senior Structural Engineer',
      'Structural Engineer',
      'Structural Designer',
    ],
    'Electrical/Instrumentation': [
      'Lead Electrical Engineer',
      'Senior Electrical Engineer',
      'Electrical Engineer',
      'Electrical Designer',
      'Instrumentation Engineer',
      'I&C Designer',
    ],
    'Automation': [
      'Lead Automation Engineer',
      'Senior Automation Engineer',
      'Automation Engineer',
      'Controls Designer',
    ],
    'Survey': [
      'Lead Surveyor',
      'Senior Surveyor',
      'Surveyor',
      'Survey Technician',
    ],
    'Quality & Document Control': [
      'QA/QC Manager',
      'QA/QC Engineer',
      'Technical Reviewer',
      'Document Control Specialist',
      'Document Controller',
    ],
    'Software': [
      'AutoCAD',
      'Revit',
      'Plant 3D',
      'MicroStation',
      'SmartPlant 3D',
      'PDMS',
      'Navisworks',
      'Microsoft Project',
      'Primavera P6',
    ],
    'Equipment': [
      'Survey Equipment (per day)',
      'GPS Unit (per day)',
      'Total Station (per day)',
      'Drone (per day)',
      'Laptop/Workstation (per month)',
      'Plotter (per month)',
    ],
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await clientsApi.list(true);
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClient = (clientId: string) => {
    setSelectedClientIds(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const selectedClients = clients.filter(c => selectedClientIds.includes(c.id));

  const getRate = (client: Client, role: string): number | null => {
    return client.custom_rates?.[role] || null;
  };

  const getMinMaxAvg = (role: string) => {
    const rates = selectedClients
      .map(c => getRate(c, role))
      .filter(r => r !== null) as number[];

    if (rates.length === 0) return null;

    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      avg: rates.reduce((a, b) => a + b, 0) / rates.length,
    };
  };

  const getRateCellColor = (rate: number | null, role: string) => {
    if (!rate) return '';
    const stats = getMinMaxAvg(role);
    if (!stats) return '';

    if (rate === stats.min) return 'bg-green-100 text-green-900 font-semibold';
    if (rate === stats.max) return 'bg-red-100 text-red-900 font-semibold';
    return '';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Client Rate Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select clients to compare their hourly rates across different roles
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Client Selection */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Clients to Compare:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {clients.map(client => (
              <label
                key={client.id}
                className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedClientIds.includes(client.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedClientIds.includes(client.id)}
                  onChange={() => toggleClient(client.id)}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">{client.name}</span>
              </label>
            ))}
          </div>
          {selectedClients.length === 0 && (
            <p className="text-amber-600 text-sm mt-3 font-medium">
              Please select at least one client to view rate comparison
            </p>
          )}
        </div>

        {/* Comparison Table */}
        {selectedClients.length > 0 && (
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Comparing {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-gray-600">Lowest Rate</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                  <span className="text-gray-600">Highest Rate</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-100 z-10">
                        Role / Discipline
                      </th>
                      {selectedClients.map(client => (
                        <th
                          key={client.id}
                          className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          <div>{client.name}</div>
                          <div className="text-[10px] font-normal text-gray-500 mt-1">
                            {client.client_type}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider bg-blue-50">
                        Statistics
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(ROLE_CATEGORIES).map(([category, roles]) => (
                      <React.Fragment key={category}>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                          <td
                            colSpan={selectedClients.length + 2}
                            className="px-4 py-2 text-sm font-bold text-gray-800 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100"
                          >
                            {category}
                          </td>
                        </tr>
                        {roles.map(role => {
                          const stats = getMinMaxAvg(role);
                          const hasAnyRate = selectedClients.some(c => getRate(c, role) !== null);

                          if (!hasAnyRate) return null;

                          return (
                            <tr key={role} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white">
                                {role}
                              </td>
                              {selectedClients.map(client => {
                                const rate = getRate(client, role);
                                return (
                                  <td
                                    key={client.id}
                                    className={`px-4 py-3 text-sm text-center ${getRateCellColor(rate, role)}`}
                                  >
                                    {rate ? `$${rate.toFixed(2)}` : '-'}
                                  </td>
                                );
                              })}
                              <td className="px-4 py-3 text-xs text-gray-600 text-center bg-blue-50">
                                {stats && (
                                  <div className="space-y-1">
                                    <div>Min: ${stats.min.toFixed(2)}</div>
                                    <div>Avg: ${stats.avg.toFixed(2)}</div>
                                    <div>Max: ${stats.max.toFixed(2)}</div>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
