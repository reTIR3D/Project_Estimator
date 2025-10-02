import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { industriesApi } from '../services/api';
import type { Industry, IndustryCreate } from '../types';

const Industries: React.FC = () => {
  const navigate = useNavigate();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIndustry, setNewIndustry] = useState<IndustryCreate>({
    name: '',
    description: '',
    display_order: 0,
  });

  useEffect(() => {
    loadIndustries();
  }, [showArchived]);

  const loadIndustries = async () => {
    try {
      setLoading(true);
      const data = await industriesApi.list(showArchived);
      setIndustries(data);
    } catch (error) {
      console.error('Failed to load industries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryClick = (industry: Industry) => {
    navigate(`/industries/${industry.id}/companies`);
  };

  const handleAddIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await industriesApi.create(newIndustry);
      setShowAddModal(false);
      setNewIndustry({ name: '', description: '', display_order: 0 });
      loadIndustries();
    } catch (error) {
      console.error('Failed to create industry:', error);
      alert('Failed to create industry');
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Archive this industry? Companies will remain accessible.')) {
      try {
        await industriesApi.archive(id);
        loadIndustries();
      } catch (error) {
        console.error('Failed to archive industry:', error);
        alert('Failed to archive industry');
      }
    }
  };

  const handleUnarchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await industriesApi.unarchive(id);
      loadIndustries();
    } catch (error) {
      console.error('Failed to unarchive industry:', error);
      alert('Failed to unarchive industry');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading industries...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Client Management</h1>
        <p className="text-gray-600">Select an industry to manage companies and rate sheets</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Industry
        </button>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Show Archived</span>
        </label>
      </div>

      {industries.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No industries found. Click "Add Industry" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <div
              key={industry.id}
              onClick={() => !industry.is_archived && handleIndustryClick(industry)}
              className={`
                p-6 rounded-lg border-2 transition-all cursor-pointer
                ${
                  industry.is_archived
                    ? 'bg-gray-100 border-gray-300 opacity-60'
                    : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg'
                }
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{industry.name}</h3>
                {industry.is_archived && (
                  <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
                    Archived
                  </span>
                )}
              </div>

              {industry.description && (
                <p className="text-gray-600 text-sm mb-4">{industry.description}</p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {industry.company_count || 0} {industry.company_count === 1 ? 'company' : 'companies'}
                </span>

                <div className="flex space-x-2">
                  {industry.is_archived ? (
                    <button
                      onClick={(e) => handleUnarchive(industry.id, e)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Unarchive
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleArchive(industry.id, e)}
                      className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Industry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New Industry</h2>
            <form onSubmit={handleAddIndustry}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newIndustry.name}
                  onChange={(e) => setNewIndustry({ ...newIndustry, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newIndustry.description}
                  onChange={(e) => setNewIndustry({ ...newIndustry, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <input
                  type="number"
                  value={newIndustry.display_order}
                  onChange={(e) => setNewIndustry({ ...newIndustry, display_order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
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
                    setNewIndustry({ name: '', description: '', display_order: 0 });
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

export default Industries;
