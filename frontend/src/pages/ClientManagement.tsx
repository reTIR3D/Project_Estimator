import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { industriesApi, companiesApi, rateSheetsApi } from '../services/api';
import type { Industry, Company, RateSheet, RateEntry, IndustryCreate, CompanyCreate, RateSheetCreate } from '../types';

export default function ClientManagement() {
  const navigate = useNavigate();

  // State
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRateSheet, setSelectedRateSheet] = useState<RateSheet | null>(null);

  const [loading, setLoading] = useState(true);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showEditCompany, setShowEditCompany] = useState(false);
  const [showAddRateSheet, setShowAddRateSheet] = useState(false);
  const [showEditRates, setShowEditRates] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustryFilter, setSelectedIndustryFilter] = useState<string>('');

  // Forms
  const [newCompany, setNewCompany] = useState<CompanyCreate>({
    industry_id: '',
    name: '',
    client_type: 'STANDARD',
    client_complexity: 5,
    base_contingency: 15,
  });
  const [newRateSheet, setNewRateSheet] = useState<RateSheetCreate>({
    company_id: '',
    name: '',
    rates: {},
  });
  const [editingRates, setEditingRates] = useState<{ [role: string]: number }>({});
  const [editingRateEntries, setEditingRateEntries] = useState<RateEntry[]>([]);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      loadRateSheets(selectedCompany.id);
    } else {
      setRateSheets([]);
      setSelectedRateSheet(null);
    }
  }, [selectedCompany]);

  // Apply filters
  useEffect(() => {
    let filtered = allCompanies;

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustryFilter) {
      filtered = filtered.filter((c) => c.industry_id === selectedIndustryFilter);
    }

    setFilteredCompanies(filtered);
  }, [searchTerm, selectedIndustryFilter, allCompanies]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [industriesData, companiesData] = await Promise.all([
        industriesApi.list(false),
        companiesApi.list(undefined, true),
      ]);
      // Sort companies by name alphabetically
      const sortedCompanies = [...companiesData].sort((a, b) => a.name.localeCompare(b.name));
      setIndustries(industriesData);
      setAllCompanies(sortedCompanies);
      setFilteredCompanies(sortedCompanies);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRateSheets = async (companyId: string) => {
    try {
      const data = await rateSheetsApi.list(companyId, true);
      setRateSheets(data);
    } catch (error) {
      console.error('Failed to load rate sheets:', error);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const companyData: CompanyCreate = {
        ...newCompany,
        code: newCompany.code || undefined,
        description: newCompany.description || undefined,
        contact_name: newCompany.contact_name || undefined,
        contact_email: newCompany.contact_email || undefined,
        contact_phone: newCompany.contact_phone || undefined,
      };

      await companiesApi.create(companyData);
      setNewCompany({ industry_id: '', name: '', client_type: 'STANDARD', client_complexity: 5, base_contingency: 15 });
      setShowAddCompany(false);
      loadData();
    } catch (error) {
      console.error('Failed to create company:', error);
      alert('Failed to create company');
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    console.log('Updating company:', editingCompany.id, {
      contact_name: editingCompany.contact_name,
      contact_email: editingCompany.contact_email,
      contact_phone: editingCompany.contact_phone,
      client_complexity: editingCompany.client_complexity,
      base_contingency: editingCompany.base_contingency,
    });

    try {
      const result = await companiesApi.update(editingCompany.id, {
        contact_name: editingCompany.contact_name,
        contact_email: editingCompany.contact_email,
        contact_phone: editingCompany.contact_phone,
        client_complexity: editingCompany.client_complexity,
        base_contingency: editingCompany.base_contingency,
      });
      console.log('Update successful! Result:', JSON.stringify(result, null, 2));
      setEditingCompany(null);
      setShowEditCompany(false);
      // Update the selected company if it was the one being edited
      if (selectedCompany && selectedCompany.id === editingCompany.id) {
        setSelectedCompany({
          ...selectedCompany,
          contact_name: editingCompany.contact_name,
          contact_email: editingCompany.contact_email,
          contact_phone: editingCompany.contact_phone,
          client_complexity: editingCompany.client_complexity,
          base_contingency: editingCompany.base_contingency,
        });
      }
      await loadData();
    } catch (error) {
      console.error('Failed to update company:', error);
      alert('Failed to update company');
    }
  };

  const handleAddRateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    try {
      await rateSheetsApi.create({
        ...newRateSheet,
        company_id: selectedCompany.id,
      });
      setNewRateSheet({ company_id: '', name: '', rates: {} });
      setShowAddRateSheet(false);
      loadRateSheets(selectedCompany.id);
    } catch (error) {
      console.error('Failed to create rate sheet:', error);
      alert('Failed to create rate sheet');
    }
  };

  const handleSetDefault = async (rateSheetId: string) => {
    try {
      await rateSheetsApi.setDefault(rateSheetId);
      if (selectedCompany) {
        loadRateSheets(selectedCompany.id);
      }
    } catch (error) {
      console.error('Failed to set default:', error);
      alert('Failed to set default rate sheet');
    }
  };

  const handleEditRates = (rateSheet: RateSheet) => {
    setSelectedRateSheet(rateSheet);
    setEditingRates(rateSheet.rates || {});

    // If rate_entries exists and has data, use it; otherwise convert from old rates format
    if (rateSheet.rate_entries && rateSheet.rate_entries.length > 0) {
      setEditingRateEntries(rateSheet.rate_entries);
    } else if (rateSheet.rates && Object.keys(rateSheet.rates).length > 0) {
      // Convert old format to new format with empty disciplines
      const entries = Object.entries(rateSheet.rates).map(([role, rate]) => ({
        role,
        discipline: '',
        rate
      }));
      setEditingRateEntries(entries);
    } else {
      setEditingRateEntries([]);
    }

    setShowEditRates(true);
  };

  const handleSaveRates = async () => {
    if (!selectedRateSheet) return;

    try {
      await rateSheetsApi.update(selectedRateSheet.id, {
        rates: editingRates,
        rate_entries: editingRateEntries
      });
      setShowEditRates(false);
      if (selectedCompany) {
        loadRateSheets(selectedCompany.id);
      }
    } catch (error) {
      console.error('Failed to update rates:', error);
      alert('Failed to update rates');
    }
  };

  const DISCIPLINES = [
    'Civil',
    'Mechanical',
    'Electrical',
    'Structural',
    'Instrumentation',
    'Process',
    'Piping',
    'Controls',
    'Architecture',
    'Equipment',
    'Software'
  ];

  const [selectedDiscipline, setSelectedDiscipline] = useState('');
  const [pendingCompanyChange, setPendingCompanyChange] = useState<Company | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Color mapping for industries
  const getIndustryColor = (industryId: string) => {
    const industryIndex = industries.findIndex(i => i.id === industryId);
    const colors = [
      'border-l-blue-400',
      'border-l-green-400',
      'border-l-purple-400',
      'border-l-orange-400',
      'border-l-pink-400',
      'border-l-indigo-400',
      'border-l-teal-400',
      'border-l-yellow-400',
      'border-l-red-400',
      'border-l-cyan-400',
    ];
    return colors[industryIndex % colors.length] || colors[0];
  };

  const handleCompanyClick = (company: Company) => {
    // If currently editing a rate sheet, check for unsaved changes
    if (showEditRates && selectedRateSheet) {
      setPendingCompanyChange(company);
    } else {
      setSelectedCompany(company);
    }
  };

  const handleSaveAndSwitch = async () => {
    if (pendingCompanyChange && selectedRateSheet) {
      try {
        await rateSheetsApi.update(selectedRateSheet.id, {
          rate_entries: editingRateEntries,
        });
        setShowEditRates(false);
        setSelectedCompany(pendingCompanyChange);
        setPendingCompanyChange(null);
      } catch (error) {
        console.error('Failed to save rate sheet:', error);
        alert('Failed to save rate sheet');
      }
    }
  };

  const handleDiscardAndSwitch = () => {
    if (pendingCompanyChange) {
      setShowEditRates(false);
      setSelectedCompany(pendingCompanyChange);
      setPendingCompanyChange(null);
    }
  };

  const handleCancelSwitch = () => {
    setPendingCompanyChange(null);
    setPendingNavigation(null);
  };

  const handleNavigate = (path: string) => {
    // If currently editing a rate sheet, check for unsaved changes
    if (showEditRates && selectedRateSheet) {
      setPendingNavigation(path);
    } else {
      navigate(path);
    }
  };

  const handleSaveAndNavigate = async () => {
    if (pendingNavigation && selectedRateSheet) {
      try {
        await rateSheetsApi.update(selectedRateSheet.id, {
          rate_entries: editingRateEntries,
        });
        navigate(pendingNavigation);
      } catch (error) {
        console.error('Failed to save rate sheet:', error);
        alert('Failed to save rate sheet');
      }
    }
  };

  const handleDiscardAndNavigate = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const addDiscipline = () => {
    if (!selectedDiscipline) return;

    const disciplineToScroll = selectedDiscipline;
    console.log('Looking for discipline:', disciplineToScroll);

    // Check if discipline already exists
    const disciplineExists = editingRateEntries.some(entry => entry.discipline === selectedDiscipline);
    console.log('Discipline exists:', disciplineExists);

    if (disciplineExists) {
      // Scroll to existing discipline
      setTimeout(() => {
        const elementId = `discipline-${disciplineToScroll}`;
        console.log('Searching for element:', elementId);
        const element = document.getElementById(elementId);
        console.log('Found element:', element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Add new discipline
    setEditingRateEntries([...editingRateEntries, { role: '', discipline: selectedDiscipline, rate: 0 }]);
    setSelectedDiscipline(''); // Reset selection

    // Scroll to newly added discipline
    setTimeout(() => {
      const elementId = `discipline-${disciplineToScroll}`;
      console.log('Searching for new element:', elementId);
      const element = document.getElementById(elementId);
      console.log('Found new element:', element);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 200);
  };

  const addRoleInDiscipline = (discipline: string) => {
    // Find the index where this discipline ends
    const lastIndexOfDiscipline = editingRateEntries.findLastIndex(entry => entry.discipline === discipline);
    const newEntry = { role: '', discipline, rate: 0 };

    if (lastIndexOfDiscipline === -1) {
      setEditingRateEntries([...editingRateEntries, newEntry]);
    } else {
      const updated = [...editingRateEntries];
      updated.splice(lastIndexOfDiscipline + 1, 0, newEntry);
      setEditingRateEntries(updated);
    }
  };

  const removeRateEntry = (index: number) => {
    const updated = [...editingRateEntries];
    updated.splice(index, 1);
    setEditingRateEntries(updated);
  };

  const updateRateEntry = (index: number, field: keyof RateEntry, value: string | number) => {
    const updated = [...editingRateEntries];
    updated[index] = { ...updated[index], [field]: value };
    setEditingRateEntries(updated);
  };

  // Group entries by discipline
  const groupedEntries = editingRateEntries.reduce((acc, entry, index) => {
    if (!acc[entry.discipline]) {
      acc[entry.discipline] = [];
    }
    acc[entry.discipline].push({ ...entry, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<RateEntry & { originalIndex: number }>>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => handleNavigate('/')}
                className="text-blue-600 hover:text-blue-800 text-sm mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage industries, clients, and rate sheets</p>
            </div>
          </div>
        </div>
      </div>


      {/* Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-6">

          {/* Clients Column */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Clients</h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {filteredCompanies.length} clients
                    {searchTerm || selectedIndustryFilter ? ' (filtered)' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCompany(true)}
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition"
                >
                  + Add Client
                </button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                />
                <select
                  value={selectedIndustryFilter}
                  onChange={(e) => setSelectedIndustryFilter(e.target.value)}
                  className="px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="divide-y max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">🏢</div>
                  <div className="text-sm mb-2">
                    {searchTerm || selectedIndustryFilter
                      ? 'No clients match your filters'
                      : 'No clients yet'}
                  </div>
                  {!searchTerm && !selectedIndustryFilter && (
                    <button
                      onClick={() => setShowAddCompany(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Click here to add your first client
                    </button>
                  )}
                </div>
              ) : (
                filteredCompanies.map((company) => {
                  const industry = industries.find((i) => i.id === company.industry_id);
                  const colorClass = getIndustryColor(company.industry_id);
                  return (
                    <div
                      key={company.id}
                      onClick={() => handleCompanyClick(company)}
                      className={`p-3 cursor-pointer transition-all border-l-8 ${colorClass} ${
                        selectedCompany?.id === company.id
                          ? 'bg-blue-50 shadow-sm'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{company.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Created {new Date(company.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {company.code && (
                              <div className="text-xs text-gray-500 font-mono">{company.code}</div>
                            )}
                            {industry && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {industry.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompany(company);
                            setShowEditCompany(true);
                          }}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 flex-shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 flex-wrap">
                        <span>📊 {company.rate_sheet_count || 0}</span>
                        <span>⚙️ {company.client_complexity || 5}/10</span>
                        <span>📈 {company.base_contingency || 15}%</span>
                        {company.contact_name && <span>👤 {company.contact_name}</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rate Sheets Column */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-5 border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {showEditRates && selectedRateSheet
                      ? `Edit Rates: ${selectedRateSheet.name}`
                      : selectedCompany ? `${selectedCompany.name} Rate Sheets` : 'Rate Sheets'
                    }
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {showEditRates
                      ? 'Update billing rates for different roles'
                      : selectedCompany ? 'Manage billing rates for different scenarios' : 'Select a client first'
                    }
                  </p>
                </div>
                {showEditRates ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowEditRates(false);
                        setSelectedRateSheet(null);
                      }}
                      className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 shadow-sm transition"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSaveRates}
                      className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition"
                    >
                      💾 Save
                    </button>
                  </div>
                ) : selectedCompany && (
                  <button
                    onClick={() => setShowAddRateSheet(true)}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm transition"
                  >
                    + Add Rate Sheet
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y max-h-[calc(100vh-350px)] relative flex flex-col">
              {showEditRates && selectedRateSheet ? (
                <>
                  {/* Fixed header with discipline dropdown and button */}
                  <div className="p-4 pb-3 border-b border-gray-200 bg-white flex-shrink-0">
                    <div className="flex gap-2 items-center">
                      <select
                        value={selectedDiscipline}
                        onChange={(e) => {
                          console.log('Dropdown changed to:', e.target.value);
                          setSelectedDiscipline(e.target.value);
                          // Automatically scroll if discipline exists
                          const newValue = e.target.value;
                          if (newValue) {
                            setTimeout(() => {
                              const disciplineExists = editingRateEntries.some(entry => entry.discipline === newValue);
                              console.log('Auto-scroll check - discipline exists?', disciplineExists);
                              if (disciplineExists) {
                                const element = document.getElementById(`discipline-${newValue}`);
                                console.log('Auto-scroll - found element:', element);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }
                            }, 50);
                          }
                        }}
                        className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Discipline...</option>
                        {DISCIPLINES.map(disc => (
                          <option key={disc} value={disc}>{disc}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          console.log('Add Discipline button clicked');
                          addDiscipline();
                        }}
                        disabled={!selectedDiscipline}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        + Add Discipline
                      </button>
                    </div>
                  </div>

                  {/* Scrollable table container */}
                  <div className="flex-1 overflow-y-auto p-4 pt-3 min-h-0">
                    {/* Spreadsheet-style table with discipline sections */}
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-300">
                          <th className="text-left text-xs font-semibold text-gray-700 px-2 py-1.5 border-r border-gray-300">Role</th>
                          <th className="text-left text-xs font-semibold text-gray-700 px-2 py-1.5 border-r border-gray-300">Rate ($)</th>
                          <th className="text-left text-xs font-semibold text-gray-700 px-2 py-1.5 w-24 border-r border-gray-300">Unit</th>
                          <th className="w-10 text-center text-xs font-semibold text-gray-700 px-1 py-1.5"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(groupedEntries).map(([discipline, entries]) => (
                          <React.Fragment key={discipline}>
                            {/* Discipline header row */}
                            <tr id={`discipline-${discipline}`} className="bg-blue-100 border-b border-gray-300">
                              <td colSpan={3} className="px-2 py-1.5 border-r border-gray-300">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-blue-900">{discipline || '(Unnamed Discipline)'}</span>
                                  <button
                                    onClick={() => addRoleInDiscipline(discipline)}
                                    className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700"
                                  >
                                    + Add Role
                                  </button>
                                </div>
                              </td>
                              <td className="px-1 py-1.5 text-center">
                                {/* Empty cell for delete column */}
                              </td>
                            </tr>
                            {/* Roles in this discipline */}
                            {entries.map((entry) => (
                              <tr key={entry.originalIndex} className="border-b border-gray-200 hover:bg-blue-50 bg-white">
                                <td className="px-2 py-1.5 border-r border-gray-200 pl-6">
                                  <input
                                    type="text"
                                    value={entry.role}
                                    onChange={(e) => updateRateEntry(entry.originalIndex, 'role', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                    placeholder="Role name..."
                                  />
                                </td>
                                <td className="px-2 py-1.5 border-r border-gray-200">
                                  <input
                                    type="number"
                                    value={entry.rate}
                                    onChange={(e) => updateRateEntry(entry.originalIndex, 'rate', parseFloat(e.target.value) || 0)}
                                    className="w-full px-2 py-1 text-xs border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                    step="0.01"
                                    min="0"
                                  />
                                </td>
                                <td className="px-2 py-1.5 border-r border-gray-200">
                                  <select
                                    value={entry.unit || 'hourly'}
                                    onChange={(e) => updateRateEntry(entry.originalIndex, 'unit', e.target.value)}
                                    className="w-full px-2 py-1 text-xs border-0 focus:ring-2 focus:ring-blue-500 rounded"
                                  >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="per seat">Per Seat</option>
                                    <option value="per project">Per Project</option>
                                  </select>
                                </td>
                                <td className="px-1 py-1.5 text-center">
                                  <button
                                    onClick={() => removeRateEntry(entry.originalIndex)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="Delete"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    {editingRateEntries.length === 0 && (
                      <div className="text-center text-gray-500 py-12 bg-gray-50">
                        <div className="text-3xl mb-2">💰</div>
                        <div className="text-sm">No disciplines configured yet</div>
                        <button
                          onClick={addDiscipline}
                          className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline"
                        >
                          Add your first discipline
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                </>
              ) : !selectedCompany ? (
                <div className="p-12 text-center text-gray-400">
                  <div className="text-4xl mb-3">💰</div>
                  <div className="text-sm">Select a client to view rate sheets</div>
                </div>
              ) : rateSheets.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="text-4xl mb-3">📝</div>
                  <div className="text-sm mb-2">No rate sheets yet</div>
                  <button
                    onClick={() => setShowAddRateSheet(true)}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    Click here to add your first rate sheet
                  </button>
                </div>
              ) : (
                rateSheets.map((rateSheet) => (
                  <div key={rateSheet.id} className="p-5 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{rateSheet.name}</div>
                          {rateSheet.is_default && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                              ⭐ Default
                            </span>
                          )}
                        </div>
                        {rateSheet.description && (
                          <div className="text-xs text-gray-600 mt-1">{rateSheet.description}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-2">
                          📋 {(rateSheet.rate_entries || []).length} roles configured
                        </div>
                        {rateSheet.rate_entries && rateSheet.rate_entries.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            🏗️ Disciplines: {[...new Set(rateSheet.rate_entries.map(e => e.discipline))].sort().join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleEditRates(rateSheet)}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                        >
                          Edit Rates
                        </button>
                        {!rateSheet.is_default && (
                          <button
                            onClick={() => handleSetDefault(rateSheet.id)}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition"
                          >
                            Set Default
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-lg font-bold mb-4">Add New Client</h3>
            <form onSubmit={handleAddCompany}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code</label>
                  <input
                    type="text"
                    value={newCompany.code || ''}
                    onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Industry *</label>
                  <select
                    value={newCompany.industry_id}
                    onChange={(e) => setNewCompany({ ...newCompany, industry_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Industry</option>
                    {industries.map((ind) => (
                      <option key={ind.id} value={ind.id}>
                        {ind.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Name</label>
                <input
                  type="text"
                  value={newCompany.contact_name || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Primary contact person"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <input
                  type="email"
                  value={newCompany.contact_email || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="email@example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={newCompany.contact_phone || ''}
                  onChange={(e) => setNewCompany({ ...newCompany, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Client Profile Settings */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Client Profile Settings</h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Client Complexity: <span className="font-bold text-blue-600">{newCompany.client_complexity || 5}</span>/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newCompany.client_complexity || 5}
                    onChange={(e) => setNewCompany({ ...newCompany, client_complexity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Easy-going</span>
                    <span>Average</span>
                    <span>Very demanding</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">How demanding is this client?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Base Contingency (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={newCompany.base_contingency || 15}
                    onChange={(e) => setNewCompany({ ...newCompany, base_contingency: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-1">Default contingency for projects with this client</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Profile Modal */}
      {showEditCompany && editingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 my-8">
            <h3 className="text-lg font-bold mb-4">Edit Client Profile: {editingCompany.name}</h3>
            <form onSubmit={handleEditCompany}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Name</label>
                <input
                  type="text"
                  value={editingCompany.contact_name || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Primary contact person"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <input
                  type="email"
                  value={editingCompany.contact_email || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="email@example.com"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={editingCompany.contact_phone || ''}
                  onChange={(e) => setEditingCompany({ ...editingCompany, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Client Profile Settings */}
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">Client Profile Settings</h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Client Complexity: <span className="font-bold text-blue-600">{editingCompany.client_complexity || 5}</span>/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={editingCompany.client_complexity || 5}
                    onChange={(e) => setEditingCompany({ ...editingCompany, client_complexity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Easy-going</span>
                    <span>Average</span>
                    <span>Very demanding</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">How demanding is this client?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Base Contingency (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={editingCompany.base_contingency || 15}
                    onChange={(e) => setEditingCompany({ ...editingCompany, base_contingency: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-600 mt-1">Default contingency for projects with this client</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditCompany(false);
                    setEditingCompany(null);
                  }}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Rate Sheet Modal */}
      {showAddRateSheet && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Add Rate Sheet to {selectedCompany.name}</h3>
            <form onSubmit={handleAddRateSheet}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name *</label>
                <input
                  type="text"
                  value={newRateSheet.name}
                  onChange={(e) => setNewRateSheet({ ...newRateSheet, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Standard Rates, Premium Rates"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newRateSheet.description || ''}
                  onChange={(e) => setNewRateSheet({ ...newRateSheet, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
              <p className="text-xs text-gray-500 mb-4">You can add roles and rates after creating the rate sheet.</p>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRateSheet(false)}
                  className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog - Company Switch */}
      {pendingCompanyChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes to the rate sheet. Do you want to save them before switching to {pendingCompanyChange.name}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndSwitch}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Save & Switch
              </button>
              <button
                onClick={handleDiscardAndSwitch}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Discard
              </button>
              <button
                onClick={handleCancelSwitch}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog - Navigation */}
      {pendingNavigation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unsaved Changes</h3>
            <p className="text-sm text-gray-600 mb-6">
              You have unsaved changes to the rate sheet. Do you want to save them before leaving?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSaveAndNavigate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Save & Leave
              </button>
              <button
                onClick={handleDiscardAndNavigate}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Discard
              </button>
              <button
                onClick={handleCancelSwitch}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
