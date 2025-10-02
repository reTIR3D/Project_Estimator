import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rateSheetsApi, companiesApi } from '../services/api';
import type { RateSheet, RateSheetCreate, Company } from '../types';

const RateSheets: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedRateSheet, setSelectedRateSheet] = useState<RateSheet | null>(null);
  const [editingRates, setEditingRates] = useState<{ [role: string]: number }>({});

  const [newRateSheet, setNewRateSheet] = useState<RateSheetCreate>({
    company_id: companyId || '',
    name: '',
    description: '',
    rates: {},
    is_default: false,
  });

  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');

  // Common engineering roles with default rates
  const defaultRoles = [
    { name: 'Project Manager', rate: 150 },
    { name: 'Senior Engineer', rate: 135 },
    { name: 'Engineer', rate: 115 },
    { name: 'Junior Engineer', rate: 95 },
    { name: 'Senior Designer', rate: 125 },
    { name: 'Designer', rate: 105 },
    { name: 'Drafter', rate: 85 },
    { name: 'Technician', rate: 75 },
  ];

  useEffect(() => {
    if (companyId) {
      loadData();
    }
  }, [companyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, rateSheetsData] = await Promise.all([
        companiesApi.get(companyId!),
        rateSheetsApi.list(companyId, true),
      ]);
      setCompany(companyData);
      setRateSheets(rateSheetsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rateSheetsApi.create(newRateSheet);
      setShowAddModal(false);
      setNewRateSheet({
        company_id: companyId || '',
        name: '',
        description: '',
        rates: {},
        is_default: false,
      });
      loadData();
    } catch (error) {
      console.error('Failed to create rate sheet:', error);
      alert('Failed to create rate sheet');
    }
  };

  const handleEditRateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRateSheet) return;

    try {
      await rateSheetsApi.update(selectedRateSheet.id, {
        rates: editingRates,
      });
      setShowEditModal(false);
      setSelectedRateSheet(null);
      setEditingRates({});
      loadData();
    } catch (error) {
      console.error('Failed to update rate sheet:', error);
      alert('Failed to update rate sheet');
    }
  };

  const handleCloneRateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRateSheet) return;

    try {
      await rateSheetsApi.clone(selectedRateSheet.id, {
        new_name: cloneName,
        new_description: cloneDescription || undefined,
      });
      setShowCloneModal(false);
      setSelectedRateSheet(null);
      setCloneName('');
      setCloneDescription('');
      loadData();
    } catch (error) {
      console.error('Failed to clone rate sheet:', error);
      alert('Failed to clone rate sheet');
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await rateSheetsApi.setDefault(id);
      loadData();
    } catch (error) {
      console.error('Failed to set default:', error);
      alert('Failed to set as default');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this rate sheet? This cannot be undone.')) {
      try {
        await rateSheetsApi.delete(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete rate sheet:', error);
        alert('Failed to delete rate sheet');
      }
    }
  };

  const openEditModal = (rateSheet: RateSheet) => {
    setSelectedRateSheet(rateSheet);
    setEditingRates({ ...rateSheet.rates });
    setShowEditModal(true);
  };

  const openCloneModal = (rateSheet: RateSheet) => {
    setSelectedRateSheet(rateSheet);
    setCloneName(`${rateSheet.name} (Copy)`);
    setCloneDescription(rateSheet.description || '');
    setShowCloneModal(true);
  };

  const addRoleToEditing = (roleName: string, rate: number) => {
    setEditingRates({ ...editingRates, [roleName]: rate });
  };

  const removeRoleFromEditing = (roleName: string) => {
    const updated = { ...editingRates };
    delete updated[roleName];
    setEditingRates(updated);
  };

  const updateRoleRate = (roleName: string, rate: number) => {
    setEditingRates({ ...editingRates, [roleName]: rate });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading rate sheets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/industries/${company?.industry_id}/companies`)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Companies
        </button>
        <h1 className="text-3xl font-bold mb-2">{company?.name} - Rate Sheets</h1>
        <p className="text-gray-600">Manage billing rate sheets for different project types</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Rate Sheet
        </button>
      </div>

      {rateSheets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No rate sheets found. Click "Add Rate Sheet" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {rateSheets.map((rateSheet) => (
            <div
              key={rateSheet.id}
              className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold">{rateSheet.name}</h3>
                    {rateSheet.is_default && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {rateSheet.description && (
                    <p className="text-gray-600 text-sm mb-3">{rateSheet.description}</p>
                  )}

                  <div className="text-sm text-gray-500">
                    {Object.keys(rateSheet.rates).length} roles configured
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => openEditModal(rateSheet)}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Edit Rates
                  </button>
                  {!rateSheet.is_default && (
                    <button
                      onClick={(e) => handleSetDefault(rateSheet.id, e)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => openCloneModal(rateSheet)}
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                  >
                    Clone
                  </button>
                  <button
                    onClick={(e) => handleDelete(rateSheet.id, e)}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Show rates preview */}
              {Object.keys(rateSheet.rates).length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Rate Preview:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(rateSheet.rates)
                      .slice(0, 8)
                      .map(([role, rate]) => (
                        <div key={role} className="text-xs">
                          <span className="text-gray-600">{role}:</span>{' '}
                          <span className="font-semibold">${rate}/hr</span>
                        </div>
                      ))}
                  </div>
                  {Object.keys(rateSheet.rates).length > 8 && (
                    <div className="text-xs text-gray-500 mt-2">
                      +{Object.keys(rateSheet.rates).length - 8} more roles
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Rate Sheet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Add New Rate Sheet</h2>
            <form onSubmit={handleAddRateSheet}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newRateSheet.name}
                  onChange={(e) => setNewRateSheet({ ...newRateSheet, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Standard Rates, Aggressive Pricing, Premium Rates"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newRateSheet.description}
                  onChange={(e) => setNewRateSheet({ ...newRateSheet, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="e.g., For competitive bids on new projects"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newRateSheet.is_default}
                    onChange={(e) => setNewRateSheet({ ...newRateSheet, is_default: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Set as default rate sheet</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Initial Rates (optional - can add/edit later)</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    {defaultRoles.map((role) => (
                      <div key={role.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={role.name in (newRateSheet.rates || {})}
                          onChange={(e) => {
                            const rates = { ...(newRateSheet.rates || {}) };
                            if (e.target.checked) {
                              rates[role.name] = role.rate;
                            } else {
                              delete rates[role.name];
                            }
                            setNewRateSheet({ ...newRateSheet, rates });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm flex-1">{role.name}</span>
                        {role.name in (newRateSheet.rates || {}) && (
                          <input
                            type="number"
                            value={newRateSheet.rates![role.name]}
                            onChange={(e) => {
                              const rates = { ...(newRateSheet.rates || {}) };
                              rates[role.name] = parseFloat(e.target.value);
                              setNewRateSheet({ ...newRateSheet, rates });
                            }}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            step="0.01"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewRateSheet({
                      company_id: companyId || '',
                      name: '',
                      description: '',
                      rates: {},
                      is_default: false,
                    });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Rate Sheet Modal */}
      {showEditModal && selectedRateSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Rates - {selectedRateSheet.name}</h2>
            <form onSubmit={handleEditRateSheet}>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Roles and Rates</label>
                  <button
                    type="button"
                    onClick={() => {
                      const roleName = prompt('Enter role name:');
                      if (roleName) {
                        const rate = prompt('Enter hourly rate:', '100');
                        if (rate) {
                          addRoleToEditing(roleName, parseFloat(rate));
                        }
                      }
                    }}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    + Add Role
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  {Object.keys(editingRates).length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No roles configured. Click "Add Role" to add one.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.entries(editingRates).map(([role, rate]) => (
                        <div key={role} className="flex items-center space-x-3">
                          <span className="flex-1 text-sm font-medium">{role}</span>
                          <span className="text-sm text-gray-500">$</span>
                          <input
                            type="number"
                            value={rate}
                            onChange={(e) => updateRoleRate(role, parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border rounded"
                            step="0.01"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">/hr</span>
                          <button
                            type="button"
                            onClick={() => removeRoleFromEditing(role)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRateSheet(null);
                    setEditingRates({});
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Rate Sheet Modal */}
      {showCloneModal && selectedRateSheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Clone Rate Sheet</h2>
            <form onSubmit={handleCloneRateSheet}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">New Name *</label>
                <input
                  type="text"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={cloneDescription}
                  onChange={(e) => setCloneDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Clone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloneModal(false);
                    setSelectedRateSheet(null);
                    setCloneName('');
                    setCloneDescription('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateSheets;
