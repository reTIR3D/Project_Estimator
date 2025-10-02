import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, companiesApi, rateSheetsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CampaignWizard from '../components/CampaignWizard';
import type { Project, ProjectCreate, Company, RateSheet } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companiesMap, setCompaniesMap] = useState<Map<string, Company>>(new Map());
  const [rateSheetsMap, setRateSheetsMap] = useState<Map<string, RateSheet>>(new Map());

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.list();
      // Filter out child modules - they'll be shown under their parent
      const topLevelProjects = data.filter(p => !p.parent_project_id);
      setProjects(topLevelProjects);

      // Load company and rate sheet details for projects that have them
      const companyIds = [...new Set(topLevelProjects.filter(p => p.company_id).map(p => p.company_id!))];
      const rateSheetIds = [...new Set(topLevelProjects.filter(p => p.rate_sheet_id).map(p => p.rate_sheet_id!))];

      const companiesData = new Map<string, Company>();
      const rateSheetsData = new Map<string, RateSheet>();

      await Promise.all([
        ...companyIds.map(async (id) => {
          try {
            const company = await companiesApi.get(id);
            companiesData.set(id, company);
          } catch (error) {
            console.error(`Failed to load company ${id}:`, error);
          }
        }),
        ...rateSheetIds.map(async (id) => {
          try {
            const rateSheet = await rateSheetsApi.get(id);
            rateSheetsData.set(id, rateSheet);
          } catch (error) {
            console.error(`Failed to load rate sheet ${id}:`, error);
          }
        }),
      ]);

      setCompaniesMap(companiesData);
      setRateSheetsMap(rateSheetsData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: ProjectCreate) => {
    try {
      const newProject = await projectsApi.create(data);
      navigate(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ESTIMATION: 'bg-blue-100 text-blue-800',
      REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-200 text-green-900',
    };
    return colors[status as keyof typeof colors] || colors.DRAFT;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Engineering Estimation System</h1>
              <p className="text-gray-600 mt-1">Manage and estimate your engineering projects</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg min-h-screen p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Navigation</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full text-left px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
            >
              + New Project
            </button>
            <button
              onClick={() => navigate('/quick-estimate')}
              className="w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Quick Estimate
            </button>
            <button
              onClick={() => navigate('/client-management')}
              className="w-full text-left px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
            >
              Client Management
            </button>
            <button
              onClick={() => navigate('/template-configurator')}
              className="w-full text-left px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors"
            >
              Template Configurator
            </button>
            <button
              onClick={() => navigate('/size-settings')}
              className="w-full text-left px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
            >
              Size Settings
            </button>
          </nav>
        </div>

        {/* Projects Grid */}
        <div className="flex-1 px-4 py-8">
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {project.size === 'PHASE_GATE' && (
                        <span className="inline-block px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold rounded">
                          🎯 Phase-Gate
                        </span>
                      )}
                      {project.current_phase && (
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {project.current_phase}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Campaign-specific display */}
                {project.work_type === 'CAMPAIGN' ? (
                  <div className="space-y-2 text-sm">
                    {project.client_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client:</span>
                        <span className="font-semibold">{project.client_name}</span>
                      </div>
                    )}
                    {project.campaign_duration_months && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{project.campaign_duration_months} months</span>
                      </div>
                    )}
                    {project.campaign_service_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Level:</span>
                        <span className="font-semibold capitalize">
                          {project.campaign_service_level.toLowerCase()}
                        </span>
                      </div>
                    )}
                    {project.campaign_site_count && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sites:</span>
                        <span className="font-semibold">{project.campaign_site_count}</span>
                      </div>
                    )}
                    {project.campaign_response_requirement && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Time:</span>
                        <span className="font-semibold">
                          {project.campaign_response_requirement.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {project.campaign_pricing_model && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pricing:</span>
                        <span className="font-semibold capitalize">
                          {project.campaign_pricing_model.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    )}
                    {project.total_hours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Hours:</span>
                        <span className="font-semibold">{project.total_hours.toLocaleString()}</span>
                      </div>
                    )}
                    {project.total_cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Cost:</span>
                        <span className="font-semibold">${project.total_cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Discrete project display */
                  <div className="space-y-2 text-sm">
                    {project.client_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Client:</span>
                        <span className="font-semibold">{project.client_name}</span>
                      </div>
                    )}
                    {project.project_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Type:</span>
                        <span className="font-semibold capitalize">
                          {project.project_type.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                    {project.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-semibold capitalize">{project.size.toLowerCase()}</span>
                      </div>
                    )}
                    {project.process_type && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Process:</span>
                        <span className="font-semibold capitalize">
                          {project.process_type.replace('_', '-')}
                        </span>
                      </div>
                    )}
                    {project.rate_sheet_id && rateSheetsMap.get(project.rate_sheet_id) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate Sheet:</span>
                        <span className="font-semibold">{rateSheetsMap.get(project.rate_sheet_id)!.name}</span>
                      </div>
                    )}
                    {project.total_hours && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hours:</span>
                        <span className="font-semibold">{project.total_hours.toLocaleString()}</span>
                      </div>
                    )}
                    {project.duration_weeks && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{project.duration_weeks} weeks</span>
                      </div>
                    )}
                    {project.total_cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-semibold">${project.total_cost.toLocaleString()}</span>
                      </div>
                    )}
                    {project.confidence_level && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-semibold capitalize">
                          {project.confidence_level.replace('_', ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (data: ProjectCreate) => void;
}

function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [workTypeStep, setWorkTypeStep] = useState(true); // Step 1: Choose work type
  const [selectedWorkType, setSelectedWorkType] = useState<'DISCRETE_PROJECT' | 'CAMPAIGN' | null>(null);

  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    project_code: '',
    description: '',
    size: 'MEDIUM',
    discipline: 'MULTIDISCIPLINE',
    project_type: 'STANDARD',
    client_profile: 'TYPE_B',
    client_name: '',
    contingency_percent: 15,
    selected_disciplines: [],
    work_type: 'DISCRETE_PROJECT',
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);
  const [loadingRateSheets, setLoadingRateSheets] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (formData.company_id) {
      loadRateSheets(formData.company_id);
    } else {
      setRateSheets([]);
      setFormData({ ...formData, rate_sheet_id: undefined });
    }
  }, [formData.company_id]);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.list(undefined, true);
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const loadRateSheets = async (companyId: string) => {
    setLoadingRateSheets(true);
    try {
      const data = await rateSheetsApi.list(companyId, true);
      setRateSheets(data);
      // Auto-select default rate sheet if available
      const defaultSheet = data.find(rs => rs.is_default);
      if (defaultSheet) {
        setFormData({ ...formData, rate_sheet_id: defaultSheet.id });
      }
    } catch (error) {
      console.error('Failed to load rate sheets:', error);
    } finally {
      setLoadingRateSheets(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  const selectWorkType = (type: 'DISCRETE_PROJECT' | 'CAMPAIGN') => {
    setSelectedWorkType(type);
    setFormData({ ...formData, work_type: type });
    setWorkTypeStep(false);
  };

  // Show Campaign Wizard for campaigns
  if (!workTypeStep && selectedWorkType === 'CAMPAIGN') {
    return (
      <CampaignWizard
        onClose={onClose}
        onCreate={onCreate}
        onBack={() => setWorkTypeStep(true)}
      />
    );
  }

  // Work Type Selection Step
  if (workTypeStep) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">What type of work are you estimating?</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Discrete Project Option */}
            <button
              onClick={() => selectWorkType('DISCRETE_PROJECT')}
              className="p-8 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Discrete Project
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                One-time project with defined scope, milestones, and deliverables
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Fixed scope and timeline</li>
                <li>• Milestone-based planning</li>
                <li>• Deliverable-focused</li>
                <li>• Budget tied to project completion</li>
              </ul>
            </button>

            {/* Campaign Option */}
            <button
              onClick={() => selectWorkType('CAMPAIGN')}
              className="p-8 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
            >
              <div className="text-5xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">
                Engineering Support Campaign
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Ongoing support with allocated capacity and recurring deliverables
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>• Duration-based (monthly/annual)</li>
                <li>• Capacity allocation model</li>
                <li>• Mix of reactive & scheduled work</li>
                <li>• Monthly burn rate pricing</li>
              </ul>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New {selectedWorkType === 'CAMPAIGN' ? 'Campaign' : 'Project'}
          </h2>
          <button
            onClick={() => setWorkTypeStep(true)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Change Work Type
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Enter project name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Project Code</label>
              <input
                type="text"
                value={formData.project_code}
                onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="PRJ-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name</label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Client name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
              <select
                value={formData.company_id || ''}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value || undefined, rate_sheet_id: undefined })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a company (optional)</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Sheet</label>
              <select
                value={formData.rate_sheet_id || ''}
                onChange={(e) => setFormData({ ...formData, rate_sheet_id: e.target.value || undefined })}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={!formData.company_id || loadingRateSheets}
              >
                <option value="">Select a rate sheet (optional)</option>
                {rateSheets.map((rateSheet) => (
                  <option key={rateSheet.id} value={rateSheet.id}>
                    {rateSheet.name} {rateSheet.is_default ? '(Default)' : ''}
                  </option>
                ))}
              </select>
              {formData.company_id && rateSheets.length === 0 && !loadingRateSheets && (
                <p className="mt-1 text-sm text-amber-600">No rate sheets available for this company</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              placeholder="Project description"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Size *</label>
            <select
              required
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="SMALL">Small (&lt; 500h)</option>
              <option value="MEDIUM">Medium (500-2000h)</option>
              <option value="LARGE">Large (&gt; 2000h)</option>
              <option value="PHASE_GATE">Phase-Gate (Large/Complex with staged approach)</option>
            </select>
            {formData.size === 'PHASE_GATE' && (
              <p className="mt-2 text-sm text-purple-600">
                🎯 Phase-gate projects use Frame → Screen → Refine → Implement workflow
              </p>
            )}
          </div>

          {/* Disciplines Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">Active Disciplines *</label>
              <button
                type="button"
                onClick={() => {
                  const allDisciplines = ['Mechanical', 'Process', 'Civil', 'Structural', 'Survey', 'Electrical/Instrumentation', 'Automation'];
                  setFormData({
                    ...formData,
                    selected_disciplines: formData.selected_disciplines?.length === allDisciplines.length ? [] : allDisciplines
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                {formData.selected_disciplines?.length === 7 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'Mechanical', icon: '⚙️' },
                { value: 'Process', icon: '🔧' },
                { value: 'Civil', icon: '🏗️' },
                { value: 'Structural', icon: '🏛️' },
                { value: 'Survey', icon: '📐' },
                { value: 'Electrical/Instrumentation', icon: '⚡' },
                { value: 'Automation', icon: '🤖' },
              ].map((discipline) => (
                <label
                  key={discipline.value}
                  className="flex items-center p-2 rounded-lg border-2 border-gray-200 hover:border-blue-300 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData.selected_disciplines?.includes(discipline.value) || false}
                    onChange={(e) => {
                      const current = formData.selected_disciplines || [];
                      if (e.target.checked) {
                        setFormData({ ...formData, selected_disciplines: [...current, discipline.value] });
                      } else {
                        setFormData({ ...formData, selected_disciplines: current.filter(d => d !== discipline.value) });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-lg">{discipline.icon}</span>
                  <span className="ml-1 text-sm font-medium text-gray-900">{discipline.value}</span>
                </label>
              ))}
            </div>
            {(!formData.selected_disciplines || formData.selected_disciplines.length === 0) && (
              <p className="mt-2 text-sm text-amber-600">
                ⚠️ Select at least one discipline
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client Profile *</label>
            <select
              required
              value={formData.client_profile}
              onChange={(e) => setFormData({ ...formData, client_profile: e.target.value as any })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="TYPE_A">Type A - Heavy Oversight (+40%)</option>
              <option value="TYPE_B">Type B - Standard Process</option>
              <option value="TYPE_C">Type C - Minimal Oversight (-15%)</option>
              <option value="NEW_CLIENT">New Client - Conservative (+25%)</option>
            </select>
          </div>

          {/* Phase Selector - Only for Phase-Gate Projects */}
          {formData.size === 'PHASE_GATE' && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Starting Phase *
              </label>
              <select
                required
                value={formData.current_phase || 'FRAME'}
                onChange={(e) => setFormData({ ...formData, current_phase: e.target.value as any })}
                className="w-full p-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none bg-white"
              >
                <option value="FRAME">Frame - Conceptual Design (±50% accuracy)</option>
                <option value="SCREEN">Screen - Feasibility Study (±30% accuracy)</option>
                <option value="REFINE">Refine - FEED/Define (±10-15% accuracy)</option>
                <option value="IMPLEMENT">Implement - Detail Design (Final)</option>
              </select>
              <p className="mt-2 text-xs text-purple-700">
                💡 Most projects start at Frame phase. You can advance through phases later.
              </p>
            </div>
          )}

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
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}