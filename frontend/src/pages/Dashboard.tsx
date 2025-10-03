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

  // Filter and sort state
  const [filterWorkType, setFilterWorkType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('created_desc');

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

  // Filter and sort projects
  const filteredAndSortedProjects = React.useMemo(() => {
    let filtered = [...projects];

    // Apply work type filter
    if (filterWorkType !== 'ALL') {
      filtered = filtered.filter(p => p.work_type === filterWorkType);
    }

    // Apply status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated_desc':
          return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, filterWorkType, filterStatus, sortBy]);

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

            {/* Prototype Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Experimental</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/integrated-prototype')}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 font-semibold transition-colors shadow-lg border-2 border-green-400"
                >
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <div>
                      <div className="font-bold text-lg">Complete Workflow</div>
                      <div className="text-xs opacity-90">Equipment + Deliverables + Review</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/equipment-prototype')}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 font-semibold transition-colors shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span>⚙️</span>
                    <div>
                      <div className="font-bold">Equipment Builder</div>
                      <div className="text-xs opacity-90">Equipment → Deliverables</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/deliverables-prototype')}
                  className="w-full text-left px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 font-semibold transition-colors shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <span>🧪</span>
                    <div>
                      <div className="font-bold">Deliverables Config</div>
                      <div className="text-xs opacity-90">Issue States & Review Cycles</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Projects List */}
        <div className="flex-1 px-4 py-8">
          {/* Filters and Sort Controls */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Structure Type</label>
                <select
                  value={filterWorkType}
                  onChange={(e) => setFilterWorkType(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="ALL">All Structures</option>
                  <option value="CONVENTIONAL">📊 Conventional</option>
                  <option value="PHASE_GATE">🎯 Phase-Gate</option>
                  <option value="CAMPAIGN">🔄 Campaign</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ESTIMATION">Estimation</option>
                  <option value="REVIEW">Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                >
                  <option value="created_desc">Newest First</option>
                  <option value="created_asc">Oldest First</option>
                  <option value="updated_desc">Recently Updated</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="text-sm text-gray-600 font-semibold">
                  {filteredAndSortedProjects.length} {filteredAndSortedProjects.length === 1 ? 'project' : 'projects'}
                </div>
              </div>
            </div>
          </div>

        {filteredAndSortedProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {projects.length === 0 ? 'Create your first project to get started' : 'Try adjusting your filters'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedProjects.map((project) => {
              // Determine card styling based on work type
              const getCardStyle = () => {
                switch (project.work_type) {
                  case 'PHASE_GATE':
                    return {
                      bg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
                      border: 'border-2 border-indigo-200',
                      icon: '🎯',
                      label: 'Phase-Gate Structure',
                      labelColor: 'text-indigo-700 bg-indigo-100'
                    };
                  case 'CAMPAIGN':
                    return {
                      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
                      border: 'border-2 border-purple-200',
                      icon: '🔄',
                      label: 'Campaign Structure',
                      labelColor: 'text-purple-700 bg-purple-100'
                    };
                  default: // CONVENTIONAL
                    return {
                      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
                      border: 'border-2 border-blue-200',
                      icon: '📊',
                      label: 'Conventional Structure',
                      labelColor: 'text-blue-700 bg-blue-100'
                    };
                }
              };

              const cardStyle = getCardStyle();

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    if (project.work_type === 'CAMPAIGN') {
                      navigate(`/campaign/${project.id}`);
                    } else {
                      navigate(`/project/${project.id}`);
                    }
                  }}
                  className={`${cardStyle.bg} ${cardStyle.border} rounded-lg shadow hover:shadow-lg transition-all cursor-pointer p-4 relative overflow-hidden`}
                >
                  {/* Large icon badge - watermark */}
                  <div className="absolute top-2 right-4 text-6xl opacity-10">
                    {cardStyle.icon}
                  </div>

                  <div className="flex items-center gap-4 relative z-10">
                    {/* Left: Icon Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-lg ${cardStyle.labelColor} flex items-center justify-center text-3xl`}>
                        {cardStyle.icon}
                      </div>
                    </div>

                    {/* Center: Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{project.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cardStyle.labelColor}`}>
                          {cardStyle.label}
                        </span>
                        {project.current_phase && (
                          <span className="px-2 py-0.5 bg-white/70 border border-gray-300 rounded text-xs font-semibold">
                            {project.current_phase}
                          </span>
                        )}
                        {project.client_name && (
                          <span className="text-xs">Client: <span className="font-semibold">{project.client_name}</span></span>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{project.description}</p>
                      )}
                    </div>

                    {/* Right: Key Metrics */}
                    <div className="flex-shrink-0 flex items-center gap-6 text-sm">
                      {project.work_type === 'CAMPAIGN' ? (
                        <>
                          {project.campaign_site_count && (
                            <div className="text-center">
                              <div className="text-gray-500 text-xs">Sites</div>
                              <div className="font-bold text-gray-900">{project.campaign_site_count}</div>
                            </div>
                          )}
                          {project.campaign_duration_months && (
                            <div className="text-center">
                              <div className="text-gray-500 text-xs">Duration</div>
                              <div className="font-bold text-gray-900">{project.campaign_duration_months}mo</div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {project.size && (
                            <div className="text-center">
                              <div className="text-gray-500 text-xs">Size</div>
                              <div className="font-bold text-gray-900 capitalize">{project.size.toLowerCase()}</div>
                            </div>
                          )}
                          {project.duration_weeks && (
                            <div className="text-center">
                              <div className="text-gray-500 text-xs">Duration</div>
                              <div className="font-bold text-gray-900">{project.duration_weeks}wk</div>
                            </div>
                          )}
                        </>
                      )}
                      {project.total_cost && (
                        <div className="text-center">
                          <div className="text-gray-500 text-xs">Cost</div>
                          <div className="font-bold text-gray-900">${(project.total_cost / 1000).toFixed(0)}k</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-gray-500 text-xs">Created</div>
                        <div className="font-semibold text-gray-700 text-xs">{new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
  const [selectedWorkType, setSelectedWorkType] = useState<'CONVENTIONAL' | 'PHASE_GATE' | 'CAMPAIGN' | null>(null);

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
    work_type: 'CONVENTIONAL',
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

  const selectWorkType = (type: 'CONVENTIONAL' | 'PHASE_GATE' | 'CAMPAIGN') => {
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
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-5xl w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Choose Project Structure</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Conventional Structure Option */}
            <button
              onClick={() => selectWorkType('CONVENTIONAL')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600">
                Conventional Structure
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Standard project with defined scope and deliverables
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Fixed scope and timeline</li>
                <li>• Milestone-based planning</li>
                <li>• Small, Medium, or Large</li>
                <li>• Single-phase delivery</li>
              </ul>
            </button>

            {/* Phase-Gate Structure Option */}
            <button
              onClick={() => selectWorkType('PHASE_GATE')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all group text-left"
            >
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600">
                Phase-Gate Structure
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Complex projects with staged decision gates
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Frame → Screen → Refine → Implement</li>
                <li>• Stage-gate approvals</li>
                <li>• Small, Medium, or Large</li>
                <li>• Progressive accuracy refinement</li>
              </ul>
            </button>

            {/* Campaign Structure Option */}
            <button
              onClick={() => selectWorkType('CAMPAIGN')}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group text-left"
            >
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600">
                Campaign Structure
              </h3>
              <p className="text-gray-600 text-sm mb-3">
                Multi-site ongoing support campaigns
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Duration-based (monthly/annual)</li>
                <li>• Multi-team deployment</li>
                <li>• Capacity allocation model</li>
                <li>• Recurring work patterns</li>
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
            </select>
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
          {selectedWorkType === 'PHASE_GATE' && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-2 border-indigo-200">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Starting Phase *
              </label>
              <select
                required
                value={formData.current_phase || 'FRAME'}
                onChange={(e) => setFormData({ ...formData, current_phase: e.target.value as any })}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none bg-white"
              >
                <option value="FRAME">Frame - Conceptual Design (±50% accuracy)</option>
                <option value="SCREEN">Screen - Feasibility Study (±30% accuracy)</option>
                <option value="REFINE">Refine - FEED/Define (±10-15% accuracy)</option>
                <option value="IMPLEMENT">Implement - Detail Design (Final)</option>
              </select>
              <p className="mt-2 text-xs text-indigo-700">
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