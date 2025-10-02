import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi, clientTemplatesApi } from '../services/api';
import type { Client, ClientCreate } from '../types';
import ClientRateComparison from '../components/ClientRateComparison';

export default function ClientConfiguration() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRateEditor, setShowRateEditor] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRateComparison, setShowRateComparison] = useState(false);
  const [showArchivedClients, setShowArchivedClients] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

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
    loadTemplates();
  }, [showArchivedClients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.list(!showArchivedClients);
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      alert('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await clientTemplatesApi.list(true);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleCreateClient = async (clientData: ClientCreate) => {
    try {
      await clientsApi.create(clientData);
      setShowCreateModal(false);
      loadClients();
      alert('Client created successfully!');
    } catch (error: any) {
      console.error('Failed to create client:', error);
      alert(error.response?.data?.detail || 'Failed to create client');
    }
  };

  const handleArchiveClient = async (id: string) => {
    if (!confirm('Are you sure you want to archive this client? The client can be reactivated later.')) return;

    try {
      await clientsApi.delete(id, false);
      loadClients();
      setSelectedClient(null);
      alert('Client archived successfully');
    } catch (error) {
      console.error('Failed to archive client:', error);
      alert('Failed to archive client');
    }
  };

  const handleReactivateClient = async (id: string) => {
    try {
      // Reactivate by updating the client (the backend should support this)
      const client = await clientsApi.get(id);
      await clientsApi.update(id, { ...client, is_active: true });
      loadClients();
      alert('Client reactivated successfully');
    } catch (error) {
      console.error('Failed to reactivate client:', error);
      alert('Failed to reactivate client');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      await clientsApi.delete(id, true);
      loadClients();
      setSelectedClient(null);
      setShowDeleteConfirm(false);
      alert('Client permanently deleted');
    } catch (error) {
      console.error('Failed to delete client:', error);
      alert('Failed to delete client');
    }
  };

  const handleSaveAsTemplate = async (templateName: string, description: string) => {
    if (!selectedClient) return;

    try {
      await clientsApi.saveAsTemplate(selectedClient.id, templateName, description);
      alert('Template saved successfully!');
      setShowTemplateModal(false);
      // Reload templates
      const templatesData = await clientTemplatesApi.list();
      setTemplates(templatesData);
    } catch (error: any) {
      console.error('Failed to save template:', error);
      alert(error.response?.data?.detail || 'Failed to save template');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <button
                onClick={() => navigate('/')}
                className="text-blue-600 hover:text-blue-800 mb-2 inline-block text-sm"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Client Configuration</h1>
              <p className="text-gray-600 text-sm mt-1">Manage clients and their rate sheets</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRateComparison(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
              >
                📊 Compare Rates
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                + New Client
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Clients</h2>
                    <p className="text-xs text-gray-500 mt-1">
                      {clients.length} {showArchivedClients ? 'archived' : 'active'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowArchivedClients(!showArchivedClients)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      showArchivedClients
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showArchivedClients ? '📋 Active' : '🗄️ Archived'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading...</div>
                ) : clients.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No clients yet. Create one to get started.
                  </div>
                ) : (
                  clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client);
                        setShowRateEditor(false);
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                          {client.code && (
                            <p className="text-xs text-gray-500 mt-0.5">Code: {client.code}</p>
                          )}
                          {client.industry && (
                            <p className="text-xs text-gray-600 mt-1">{client.industry}</p>
                          )}
                        </div>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                          client.client_type === 'STRATEGIC' ? 'bg-purple-100 text-purple-800' :
                          client.client_type === 'PREFERRED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {client.client_type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {Object.keys(client.custom_rates || {}).length > 0
                            ? `${Object.keys(client.custom_rates).length} custom rates`
                            : 'No custom rates'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Client Details & Rate Editor */}
          <div className="lg:col-span-2">
            {selectedClient ? (
              <div className="space-y-6">
                {/* Client Details Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedClient.name}</h2>
                      {selectedClient.code && (
                        <p className="text-sm text-gray-600 mt-1">Code: {selectedClient.code}</p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {selectedClient.is_active ? (
                        <>
                          <button
                            onClick={() => setShowRateEditor(!showRateEditor)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                          >
                            {showRateEditor ? 'Hide' : 'Edit'} Rate Sheet
                          </button>
                          <button
                            onClick={() => setShowTemplateModal(true)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                          >
                            💾 Save as Template
                          </button>
                          <button
                            onClick={() => handleArchiveClient(selectedClient.id)}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-semibold"
                          >
                            🗄️ Archive Client
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                          >
                            🗑️ Delete Permanently
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReactivateClient(selectedClient.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                          >
                            ✅ Reactivate Client
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                          >
                            🗑️ Delete Permanently
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-semibold">{selectedClient.client_type}</span>
                    </div>
                    {selectedClient.industry && (
                      <div>
                        <span className="text-gray-600">Industry:</span>
                        <span className="ml-2 font-semibold">{selectedClient.industry}</span>
                      </div>
                    )}
                    {selectedClient.contact_name && (
                      <div>
                        <span className="text-gray-600">Contact:</span>
                        <span className="ml-2 font-semibold">{selectedClient.contact_name}</span>
                      </div>
                    )}
                    {selectedClient.contact_email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-semibold">{selectedClient.contact_email}</span>
                      </div>
                    )}
                  </div>

                  {selectedClient.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700">{selectedClient.description}</p>
                    </div>
                  )}
                </div>

                {/* Rate Analytics Dashboard */}
                {showRateEditor && selectedClient.custom_rates && Object.keys(selectedClient.custom_rates).length > 0 && (
                  <RateAnalyticsDashboard
                    rates={selectedClient.custom_rates}
                    roleCategories={ROLE_CATEGORIES}
                  />
                )}

                {/* Rate Sheet Editor */}
                {showRateEditor && (
                  <RateSheetEditor
                    client={selectedClient}
                    roleCategories={ROLE_CATEGORIES}
                    onSave={async (rates) => {
                      try {
                        const updated = await clientsApi.updateRates(selectedClient.id, rates);
                        setSelectedClient(updated);
                        setClients(clients.map(c => c.id === updated.id ? updated : c));
                        alert('Rates updated successfully!');
                      } catch (error) {
                        console.error('Failed to update rates:', error);
                        alert('Failed to update rates');
                      }
                    }}
                    onCancel={() => setShowRateEditor(false)}
                  />
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Client Selected</h3>
                <p className="text-gray-600">Select a client from the list to view details and edit rates</p>
              </div>
            )}

            {/* Template Management Section */}
            {!selectedClient && templates.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">📋 Saved Templates</h3>
                    <p className="text-sm text-gray-600 mt-1">{templates.length} template{templates.length !== 1 ? 's' : ''} available</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        {template.description && (
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        )}
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          {template.industry && <span>📍 {template.industry}</span>}
                          {template.custom_rates && Object.keys(template.custom_rates).length > 0 && (
                            <span>💵 {Object.keys(template.custom_rates).length} rates configured</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete template "${template.name}"?`)) {
                            try {
                              await clientTemplatesApi.delete(template.id);
                              await loadTemplates();
                              alert('Template deleted successfully');
                            } catch (error) {
                              console.error('Failed to delete template:', error);
                              alert('Failed to delete template');
                            }
                          }
                        }}
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <CreateClientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClient}
          templates={templates}
        />
      )}

      {/* Save as Template Modal */}
      {showTemplateModal && selectedClient && (
        <SaveAsTemplateModal
          clientName={selectedClient.name}
          onClose={() => setShowTemplateModal(false)}
          onSave={handleSaveAsTemplate}
        />
      )}

      {/* Rate Comparison Modal */}
      {showRateComparison && (
        <ClientRateComparison
          onClose={() => setShowRateComparison(false)}
        />
      )}

      {/* Permanent Delete Confirmation Modal */}
      {showDeleteConfirm && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ Permanently Delete Client?</h3>
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                You are about to <strong>permanently delete</strong> the client:
              </p>
              <p className="text-lg font-semibold text-gray-900 mb-3">
                {selectedClient.name}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ This action cannot be undone!
                </p>
                <p className="text-xs text-red-700 mt-1">
                  All client data, including rates, settings, and history will be permanently removed from the database.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                If you want to temporarily remove this client, use the "Archive Client" option instead.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(selectedClient.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Rate Analytics Dashboard Component
interface RateAnalyticsDashboardProps {
  rates: { [role: string]: number };
  roleCategories: { [category: string]: string[] };
}

function RateAnalyticsDashboard({ rates, roleCategories }: RateAnalyticsDashboardProps) {
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Project Management': '📊',
      'Mechanical': '⚙️',
      'Process': '🔧',
      'Civil': '🏗️',
      'Structural': '🏛️',
      'Electrical/Instrumentation': '⚡',
      'Automation': '🤖',
      'Survey': '📐',
      'Quality & Document Control': '✅',
      'Software': '💻',
      'Equipment': '🔨',
    };
    return icons[category] || '📋';
  };

  // Calculate statistics
  const allRolesWithRates = Object.entries(rates).filter(([_, rate]) => rate > 0);
  const totalConfigured = allRolesWithRates.length;
  const avgRate = totalConfigured > 0
    ? allRolesWithRates.reduce((sum, [_, rate]) => sum + rate, 0) / totalConfigured
    : 0;

  // Get top 5 highest and lowest paid roles
  const sortedRoles = [...allRolesWithRates].sort((a, b) => b[1] - a[1]);
  const topRoles = sortedRoles.slice(0, 5);
  const bottomRoles = sortedRoles.slice(-5).reverse();

  // Calculate average rate per discipline
  const disciplineStats = Object.entries(roleCategories).map(([category, roleList]) => {
    const categoryRates = roleList
      .map(role => rates[role])
      .filter(rate => rate && rate > 0);

    const avg = categoryRates.length > 0
      ? categoryRates.reduce((sum, rate) => sum + rate, 0) / categoryRates.length
      : 0;

    const max = categoryRates.length > 0 ? Math.max(...categoryRates) : 0;
    const min = categoryRates.length > 0 ? Math.min(...categoryRates) : 0;
    const count = categoryRates.length;

    return { category, avg, max, min, count };
  }).filter(stat => stat.count > 0);

  // Sort by average rate descending
  const sortedDisciplines = [...disciplineStats].sort((a, b) => b.avg - a.avg);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Rate Analytics</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-xs text-blue-600 font-semibold mb-1">Total Roles Configured</div>
          <div className="text-2xl font-bold text-blue-900">{totalConfigured}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-xs text-green-600 font-semibold mb-1">Average Rate</div>
          <div className="text-2xl font-bold text-green-900">${avgRate.toFixed(2)}/hr</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-xs text-purple-600 font-semibold mb-1">Disciplines with Rates</div>
          <div className="text-2xl font-bold text-purple-900">{disciplineStats.length}</div>
        </div>
      </div>

      {/* Discipline Rate Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Average Rates by Discipline</h4>
        <div className="space-y-2">
          {sortedDisciplines.map(({ category, avg, max, min, count }) => (
            <div key={category} className="flex items-center gap-3">
              <div className="w-40 text-xs text-gray-700 flex items-center gap-1 truncate">
                <span>{getCategoryIcon(category)}</span>
                <span>{category}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full flex items-center justify-end px-2"
                      style={{ width: `${(avg / Math.max(...sortedDisciplines.map(d => d.avg))) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">${avg.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 w-20">
                    {count} role{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top and Bottom Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Highest Paid Roles */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">🔝 Highest Paid Roles</h4>
          <div className="space-y-2">
            {topRoles.map(([role, rate], idx) => (
              <div key={role} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-mono">#{idx + 1}</span>
                  <span className="text-gray-700 truncate">{role}</span>
                </div>
                <span className="font-semibold text-green-700">${rate.toFixed(2)}/hr</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Paid Roles */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">💰 Most Economical Roles</h4>
          <div className="space-y-2">
            {bottomRoles.map(([role, rate], idx) => (
              <div key={role} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-mono">#{idx + 1}</span>
                  <span className="text-gray-700 truncate">{role}</span>
                </div>
                <span className="font-semibold text-blue-700">${rate.toFixed(2)}/hr</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Rate Sheet Editor Component
interface RateSheetEditorProps {
  client: Client;
  roleCategories: { [category: string]: string[] };
  onSave: (rates: { [role: string]: number }) => void;
  onCancel: () => void;
}

function RateSheetEditor({ client, roleCategories, onSave, onCancel }: RateSheetEditorProps) {
  const [rates, setRates] = useState<{ [role: string]: number }>(client.custom_rates || {});
  const [customRoles, setCustomRoles] = useState<{ [category: string]: string[] }>({});
  const [newRoleName, setNewRoleName] = useState<{ [category: string]: string }>({});
  const [editingRole, setEditingRole] = useState<{ category: string; oldName: string; newName: string } | null>(null);
  const [renamedDefaultRoles, setRenamedDefaultRoles] = useState<{ [category: string]: { [oldName: string]: string } }>({});
  const [filterMode, setFilterMode] = useState<'all' | 'with-rates' | 'without-rates'>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(Object.keys(roleCategories));

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Project Management': '📊',
      'Mechanical': '⚙️',
      'Process': '🔧',
      'Civil': '🏗️',
      'Structural': '🏛️',
      'Electrical/Instrumentation': '⚡',
      'Automation': '🤖',
      'Survey': '📐',
      'Quality & Document Control': '✅',
      'Software': '💻',
      'Equipment': '🔨',
    };
    return icons[category] || '📋';
  };

  const getRateUnit = (category: string) => {
    if (category === 'Software') return '/mo';
    if (category === 'Equipment') return '';
    return '/hr';
  };

  const addCustomRole = (category: string) => {
    const roleName = newRoleName[category]?.trim();
    if (!roleName) return;

    setCustomRoles({
      ...customRoles,
      [category]: [...(customRoles[category] || []), roleName],
    });
    setNewRoleName({ ...newRoleName, [category]: '' });
  };

  const removeCustomRole = (category: string, role: string) => {
    setCustomRoles({
      ...customRoles,
      [category]: (customRoles[category] || []).filter(r => r !== role),
    });
    // Also remove the rate
    const newRates = { ...rates };
    delete newRates[role];
    setRates(newRates);
  };

  const startEditingRole = (category: string, roleName: string) => {
    setEditingRole({ category, oldName: roleName, newName: roleName });
  };

  const saveRoleRename = () => {
    if (!editingRole || !editingRole.newName.trim()) {
      setEditingRole(null);
      return;
    }

    const { category, oldName, newName } = editingRole;
    const trimmedNewName = newName.trim();

    // Check if this is a custom role or default role
    const isCustom = customRoles[category]?.includes(oldName);

    if (isCustom) {
      // Update custom roles array
      setCustomRoles({
        ...customRoles,
        [category]: (customRoles[category] || []).map(r => r === oldName ? trimmedNewName : r),
      });
    } else {
      // Track renamed default role
      setRenamedDefaultRoles({
        ...renamedDefaultRoles,
        [category]: {
          ...(renamedDefaultRoles[category] || {}),
          [oldName]: trimmedNewName,
        },
      });
    }

    // Update rate key
    const newRates = { ...rates };
    if (rates[oldName] !== undefined) {
      newRates[trimmedNewName] = rates[oldName];
      delete newRates[oldName];
      setRates(newRates);
    }

    setEditingRole(null);
  };

  const cancelRoleRename = () => {
    setEditingRole(null);
  };

  const getDisplayName = (category: string, roleName: string) => {
    // Check if this default role has been renamed
    return renamedDefaultRoles[category]?.[roleName] || roleName;
  };

  const getAllRolesForCategory = (category: string) => {
    return [...roleCategories[category], ...(customRoles[category] || [])];
  };

  const shouldShowRole = (role: string) => {
    const displayName = getDisplayName('', role);
    const hasRate = rates[displayName] || rates[role];

    if (filterMode === 'with-rates') return hasRate && hasRate > 0;
    if (filterMode === 'without-rates') return !hasRate || hasRate === 0;
    return true; // 'all'
  };

  const getFilteredRolesForCategory = (category: string) => {
    return getAllRolesForCategory(category).filter(role => {
      const displayName = getDisplayName(category, role);
      const hasRate = rates[displayName] || rates[role];

      if (filterMode === 'with-rates') return hasRate && hasRate > 0;
      if (filterMode === 'without-rates') return !hasRate || hasRate === 0;
      return true; // 'all'
    });
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleAllCategories = () => {
    if (selectedCategories.length === Object.keys(roleCategories).length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(Object.keys(roleCategories));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Rate Sheet Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Set custom rates for each discipline. Leave blank to use system defaults.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Filter:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('with-rates')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  filterMode === 'with-rates'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                With Rates
              </button>
              <button
                onClick={() => setFilterMode('without-rates')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  filterMode === 'without-rates'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Without Rates
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Categories:</span>
            <button
              onClick={toggleAllCategories}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
            >
              {selectedCategories.length === Object.keys(roleCategories).length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(roleCategories).map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {Object.entries(roleCategories).map(([category, roleList]) => {
          // Skip if category is not selected
          if (!selectedCategories.includes(category)) return null;

          const filteredRoles = getFilteredRolesForCategory(category);
          if (filteredRoles.length === 0 && filterMode !== 'all') return null;

          return (
            <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-2">
                  <span>{getCategoryIcon(category)}</span>
                  <span>{category}</span>
                </h4>
                <span className="text-xs text-gray-500">
                  {filteredRoles.length}
                  {filterMode !== 'all' && ` / ${getAllRolesForCategory(category).length}`} roles
                </span>
              </div>

              {/* Roles List */}
              <div className="bg-white divide-y divide-gray-100">
                {filteredRoles.map((role) => {
                const isCustom = customRoles[category]?.includes(role);
                const displayName = getDisplayName(category, role);
                const isEditing = editingRole?.category === category && editingRole?.oldName === role;

                return (
                  <div
                    key={role}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingRole.newName}
                        onChange={(e) => setEditingRole({ ...editingRole, newName: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveRoleRename();
                          if (e.key === 'Escape') cancelRoleRename();
                        }}
                        onBlur={saveRoleRename}
                        autoFocus
                        className="flex-1 px-2 py-1 border border-blue-500 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    ) : (
                      <div className="flex-1 flex items-center gap-1 group">
                        <label className="text-xs text-gray-700 truncate">{displayName}</label>
                        <button
                          onClick={() => startEditingRole(category, role)}
                          className="opacity-0 group-hover:opacity-100 text-blue-500 hover:text-blue-700 text-xs transition-opacity"
                          title="Edit role name"
                        >
                          ✎
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        value={rates[displayName] || rates[role] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          const key = displayName;
                          setRates({
                            ...rates,
                            [key]: value ? parseFloat(value) : 0,
                          });
                        }}
                        placeholder="--"
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs text-right"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-gray-400 text-xs w-8">{getRateUnit(category)}</span>
                      {isCustom && (
                        <button
                          onClick={() => removeCustomRole(category, role)}
                          className="ml-1 text-red-500 hover:text-red-700 text-xs"
                          title="Remove role"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add New Role Row */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50">
                <input
                  type="text"
                  value={newRoleName[category] || ''}
                  onChange={(e) => setNewRoleName({ ...newRoleName, [category]: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCustomRole(category);
                    }
                  }}
                  placeholder="Add custom role..."
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => addCustomRole(category)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 font-semibold"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Remove zero/empty values before saving
            const cleanedRates = Object.fromEntries(
              Object.entries(rates).filter(([_, value]) => value > 0)
            );
            onSave(cleanedRates);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Save Rates
        </button>
      </div>
    </div>
  );
}

// Save as Template Modal Component
interface SaveAsTemplateModalProps {
  clientName: string;
  onClose: () => void;
  onSave: (templateName: string, description: string) => void;
}

function SaveAsTemplateModal({ clientName, onClose, onSave }: SaveAsTemplateModalProps) {
  const [templateName, setTemplateName] = useState(`${clientName} Template`);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      alert('Template name is required');
      return;
    }
    onSave(templateName, description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">💾 Save as Template</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="e.g., Oil & Gas Standard Rates"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Optional description for this template..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>What will be saved:</strong> Client type, industry, custom rates, and settings from "{clientName}"
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Save Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Client Modal Component
interface CreateClientModalProps {
  onClose: () => void;
  onCreate: (client: ClientCreate) => void;
  templates?: any[];
}

function CreateClientModal({ onClose, onCreate, templates = [] }: CreateClientModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [formData, setFormData] = useState<ClientCreate>({
    name: '',
    code: '',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    client_type: 'STANDARD',
    industry: '',
    custom_rates: {},
    is_active: true,
  });

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData({
          ...formData,
          client_type: template.client_type || 'STANDARD',
          industry: template.industry || '',
          custom_rates: template.custom_rates || {},
          settings: template.settings || {},
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Client</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Template Selection */}
          {templates.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                📋 Start from Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
              >
                <option value="">-- Create from scratch --</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} {template.industry ? `(${template.industry})` : ''}
                  </option>
                ))}
              </select>
              {selectedTemplate && (
                <p className="mt-2 text-xs text-purple-700">
                  ✓ Template applied! Client type, industry, and rates have been pre-filled.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Acme Corporation"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="ACME"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Brief description of the client..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Type
              </label>
              <select
                value={formData.client_type}
                onChange={(e) => setFormData({ ...formData, client_type: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREFERRED">Preferred</option>
                <option value="STRATEGIC">Strategic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Oil & Gas, Manufacturing..."
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Contact Name"
              />
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="contact@example.com"
              />
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
