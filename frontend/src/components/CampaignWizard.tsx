import React, { useState, useEffect } from 'react';
import { companiesApi, rateSheetsApi } from '../services/api';
import type { ProjectCreate, Company, RateSheet } from '../types';

interface CampaignWizardProps {
  onClose: () => void;
  onCreate: (data: ProjectCreate) => void;
  onBack: () => void;
}

export default function CampaignWizard({ onClose, onCreate, onBack }: CampaignWizardProps) {
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rateSheets, setRateSheets] = useState<RateSheet[]>([]);
  const [loadingRateSheets, setLoadingRateSheets] = useState(false);

  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    work_type: 'CAMPAIGN',
    project_code: '',
    client_name: '',
    description: '',
    selected_disciplines: [],
    company_id: undefined,
    rate_sheet_id: undefined,
    campaign_duration_months: 12,
    campaign_service_level: 'STANDARD',
    campaign_site_count: 1,
    campaign_response_requirement: '5_BUSINESS_DAYS',
    campaign_pricing_model: 'MONTHLY_RETAINER',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (formData.company_id) {
      loadRateSheets(formData.company_id);
    } else {
      setRateSheets([]);
    }
  }, [formData.company_id]);

  const loadCompanies = async () => {
    try {
      const data = await companiesApi.list();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const loadRateSheets = async (companyId: string) => {
    setLoadingRateSheets(true);
    try {
      const data = await rateSheetsApi.listByCompany(companyId);
      setRateSheets(data);

      const defaultSheet = data.find(sheet => sheet.is_default);
      if (defaultSheet && !formData.rate_sheet_id) {
        setFormData(prev => ({ ...prev, rate_sheet_id: defaultSheet.id }));
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

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Engineering Support Campaign</h2>
            <p className="text-sm text-gray-600 mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            ← Change Work Type
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>Basic Info</span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>Campaign Details</span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>Resources & Pricing</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Site Maintenance Support 2025"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Campaign Code</label>
                  <input
                    type="text"
                    value={formData.project_code}
                    onChange={(e) => setFormData({ ...formData, project_code: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="CAMP-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Client name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Describe the ongoing support requirements..."
                />
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
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campaign Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Campaign Duration (months) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="60"
                  value={formData.campaign_duration_months}
                  onChange={(e) => setFormData({ ...formData, campaign_duration_months: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Typical range: 6-36 months</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Level *
                </label>
                <select
                  required
                  value={formData.campaign_service_level}
                  onChange={(e) => setFormData({ ...formData, campaign_service_level: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="BASIC">Basic - Limited hours, best effort</option>
                  <option value="STANDARD">Standard - Regular support with SLA</option>
                  <option value="PREMIUM">Premium - Priority support with dedicated resources</option>
                  <option value="ENTERPRISE">Enterprise - 24/7 coverage with guaranteed response</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Response Time Requirement *
                </label>
                <select
                  required
                  value={formData.campaign_response_requirement}
                  onChange={(e) => setFormData({ ...formData, campaign_response_requirement: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="24_HOURS">24 Hours - Emergency response</option>
                  <option value="48_HOURS">48 Hours - High priority</option>
                  <option value="5_BUSINESS_DAYS">5 Business Days - Standard</option>
                  <option value="10_BUSINESS_DAYS">10 Business Days - Low priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Sites/Facilities *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={formData.campaign_site_count}
                  onChange={(e) => setFormData({ ...formData, campaign_site_count: parseInt(e.target.value) || 1 })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">How many sites will this campaign support?</p>
              </div>
            </div>
          )}

          {/* Step 3: Resources & Pricing */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pricing Model *
                </label>
                <select
                  required
                  value={formData.campaign_pricing_model}
                  onChange={(e) => setFormData({ ...formData, campaign_pricing_model: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="MONTHLY_RETAINER">Monthly Retainer - Fixed monthly fee</option>
                  <option value="HOURLY_BUCKET">Hourly Bucket - Pre-purchased hour blocks</option>
                  <option value="TIME_AND_MATERIALS">Time & Materials - Pay as you go</option>
                  <option value="HYBRID">Hybrid - Base retainer + overage billing</option>
                </select>
              </div>

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
                      className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.selected_disciplines?.includes(discipline.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selected_disciplines?.includes(discipline.value)}
                        onChange={(e) => {
                          const disciplines = formData.selected_disciplines || [];
                          setFormData({
                            ...formData,
                            selected_disciplines: e.target.checked
                              ? [...disciplines, discipline.value]
                              : disciplines.filter(d => d !== discipline.value)
                          });
                        }}
                        className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-lg">{discipline.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{discipline.value}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Campaign Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Duration:</strong> {formData.campaign_duration_months} months</p>
                  <p><strong>Service Level:</strong> {formData.campaign_service_level}</p>
                  <p><strong>Sites:</strong> {formData.campaign_site_count}</p>
                  <p><strong>Pricing:</strong> {formData.campaign_pricing_model?.replace(/_/g, ' ')}</p>
                  <p><strong>Disciplines:</strong> {formData.selected_disciplines?.length || 0} selected</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold"
            >
              Cancel
            </button>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Previous
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Create Campaign
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
