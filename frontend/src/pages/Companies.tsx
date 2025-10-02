import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companiesApi, industriesApi } from '../services/api';
import type { Company, CompanyCreate, Industry } from '../types';

const Companies: React.FC = () => {
  const { industryId } = useParams<{ industryId: string }>();
  const navigate = useNavigate();
  const [industry, setIndustry] = useState<Industry | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [newCompany, setNewCompany] = useState<CompanyCreate>({
    industry_id: industryId || '',
    name: '',
    code: '',
    description: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    client_type: 'STANDARD',
  });
  const [cloneName, setCloneName] = useState('');
  const [cloneCode, setCloneCode] = useState('');
  const [cloneRateSheets, setCloneRateSheets] = useState(true);

  useEffect(() => {
    if (industryId) {
      loadData();
    }
  }, [industryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [industryData, companiesData] = await Promise.all([
        industriesApi.get(industryId!),
        companiesApi.list(industryId, true),
      ]);
      setIndustry(industryData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyClick = (company: Company) => {
    navigate(`/companies/${company.id}/rate-sheets`);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up empty strings to undefined for optional fields
      const companyData: CompanyCreate = {
        industry_id: newCompany.industry_id,
        name: newCompany.name,
        code: newCompany.code || undefined,
        description: newCompany.description || undefined,
        contact_name: newCompany.contact_name || undefined,
        contact_email: newCompany.contact_email || undefined,
        contact_phone: newCompany.contact_phone || undefined,
        client_type: newCompany.client_type,
      };

      await companiesApi.create(companyData);
      setShowAddModal(false);
      setNewCompany({
        industry_id: industryId || '',
        name: '',
        code: '',
        description: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        client_type: 'STANDARD',
      });
      loadData();
    } catch (error) {
      console.error('Failed to create company:', error);
      alert('Failed to create company');
    }
  };

  const handleCloneCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      await companiesApi.clone(selectedCompany.id, {
        new_name: cloneName,
        new_code: cloneCode || undefined,
        clone_rate_sheets: cloneRateSheets,
      });
      setShowCloneModal(false);
      setSelectedCompany(null);
      setCloneName('');
      setCloneCode('');
      setCloneRateSheets(true);
      loadData();
    } catch (error) {
      console.error('Failed to clone company:', error);
      alert('Failed to clone company');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this company? This cannot be undone.')) {
      try {
        await companiesApi.delete(id);
        loadData();
      } catch (error: any) {
        console.error('Failed to delete company:', error);
        alert(error.response?.data?.detail || 'Failed to delete company');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/industries')}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Industries
        </button>
        <h1 className="text-3xl font-bold mb-2">{industry?.name}</h1>
        <p className="text-gray-600">{industry?.description}</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Add Company
        </button>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No companies found in this industry. Click "Add Company" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1" onClick={() => handleCompanyClick(company)}>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold">{company.name}</h3>
                    {company.code && (
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded">{company.code}</span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      company.client_type === 'STRATEGIC' ? 'bg-purple-100 text-purple-800' :
                      company.client_type === 'PREFERRED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {company.client_type}
                    </span>
                  </div>

                  {company.description && (
                    <p className="text-gray-600 text-sm mb-3">{company.description}</p>
                  )}

                  {(company.contact_name || company.contact_email || company.contact_phone) && (
                    <div className="text-sm text-gray-500 mb-3">
                      {company.contact_name && <div>Contact: {company.contact_name}</div>}
                      {company.contact_email && <div>Email: {company.contact_email}</div>}
                      {company.contact_phone && <div>Phone: {company.contact_phone}</div>}
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    {company.rate_sheet_count || 0} rate {company.rate_sheet_count === 1 ? 'sheet' : 'sheets'}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCompany(company);
                      setCloneName(`${company.name} (Copy)`);
                      setShowCloneModal(true);
                    }}
                    className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Clone
                  </button>
                  <button
                    onClick={(e) => handleDelete(company.id, e)}
                    className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold mb-6">Add New Company</h2>
            <form onSubmit={handleAddCompany}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <input
                    type="text"
                    value={newCompany.code}
                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Client Type</label>
                <select
                  value={newCompany.client_type}
                  onChange={(e) => setNewCompany({ ...newCompany, client_type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREFERRED">Preferred</option>
                  <option value="STRATEGIC">Strategic</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Name</label>
                  <input
                    type="text"
                    value={newCompany.contact_name}
                    onChange={(e) => setNewCompany({ ...newCompany, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={newCompany.contact_email}
                    onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contact Phone</label>
                  <input
                    type="tel"
                    value={newCompany.contact_phone}
                    onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clone Company Modal */}
      {showCloneModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Clone Company</h2>
            <form onSubmit={handleCloneCompany}>
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

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">New Code</label>
                <input
                  type="text"
                  value={cloneCode}
                  onChange={(e) => setCloneCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={cloneRateSheets}
                    onChange={(e) => setCloneRateSheets(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Clone all rate sheets</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Clone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloneModal(false);
                    setSelectedCompany(null);
                    setCloneName('');
                    setCloneCode('');
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

export default Companies;
