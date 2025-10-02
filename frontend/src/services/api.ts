import axios from 'axios';
import type {
  Project,
  ProjectCreate,
  EstimationRequest,
  EstimationResponse,
  ComplexityFactorsResponse,
  LoginRequest,
  TokenResponse,
  CostCalculationRequest,
  CostCalculationResponse,
  Client,
  ClientCreate,
  Industry,
  IndustryCreate,
  IndustryUpdate,
  IndustryWithCompanies,
  Company,
  CompanyCreate,
  CompanyUpdate,
  CompanyWithRateSheets,
  CompanyClone,
  RateSheet,
  RateSheetCreate,
  RateSheetUpdate,
  RateSheetClone,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication
export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', data);
    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },
};

// Projects
export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const response = await api.get<{ items: Project[] }>('/projects/');
    return response.data.items;
  },

  get: async (id: string): Promise<Project> => {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post<Project>('/projects/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.put<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },

  getModules: async (projectId: string): Promise<Project[]> => {
    const response = await api.get<Project[]>(`/projects/${projectId}/modules`);
    return response.data;
  },

  getCostSummary: async (projectId: string): Promise<any> => {
    const response = await api.get(`/projects/${projectId}/cost-summary`);
    return response.data;
  },
};

// Estimation
export const estimationApi = {
  calculate: async (projectId: string, data: EstimationRequest): Promise<EstimationResponse> => {
    const response = await api.post<EstimationResponse>(
      `/estimation/${projectId}/estimate`,
      data
    );
    return response.data;
  },

  quickEstimate: async (data: EstimationRequest): Promise<EstimationResponse> => {
    const response = await api.post<EstimationResponse>('/estimation/quick-estimate', data);
    return response.data;
  },

  getComplexityFactors: async (): Promise<ComplexityFactorsResponse> => {
    const response = await api.get<ComplexityFactorsResponse>('/estimation/complexity-factors');
    return response.data;
  },

  calculateCosts: async (data: CostCalculationRequest): Promise<CostCalculationResponse> => {
    const response = await api.post<CostCalculationResponse>('/estimation/calculate-costs', data);
    return response.data;
  },
};

// Clients
export const clientsApi = {
  list: async (activeOnly: boolean = true): Promise<Client[]> => {
    const response = await api.get<{ clients: Client[]; total: number }>(`/clients/?active_only=${activeOnly}`);
    return response.data.clients;
  },

  get: async (id: string): Promise<Client> => {
    const response = await api.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientCreate): Promise<Client> => {
    const response = await api.post<Client>('/clients/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ClientCreate>): Promise<Client> => {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  updateRates: async (id: string, rates: { [role: string]: number }): Promise<Client> => {
    const response = await api.patch<Client>(`/clients/${id}/rates`, { custom_rates: rates });
    return response.data;
  },

  delete: async (id: string, hardDelete: boolean = false): Promise<void> => {
    await api.delete(`/clients/${id}?hard_delete=${hardDelete}`);
  },

  saveAsTemplate: async (id: string, templateName: string, description?: string): Promise<any> => {
    const client = await clientsApi.get(id);
    const template = {
      name: templateName,
      description: description || `Template from ${client.name}`,
      client_type: client.client_type,
      industry: client.industry,
      custom_rates: client.custom_rates,
      settings: client.settings,
    };
    const response = await api.post('/client-templates/', template);
    return response.data;
  },
};

// Client Templates
export const clientTemplatesApi = {
  list: async (activeOnly: boolean = true): Promise<any[]> => {
    const response = await api.get<{ templates: any[]; total: number }>(`/client-templates/?active_only=${activeOnly}`);
    return response.data.templates;
  },

  get: async (id: string): Promise<any> => {
    const response = await api.get(`/client-templates/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post('/client-templates/', data);
    return response.data;
  },

  update: async (id: string, data: any): Promise<any> => {
    const response = await api.put(`/client-templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string, hardDelete: boolean = false): Promise<void> => {
    await api.delete(`/client-templates/${id}?hard_delete=${hardDelete}`);
  },

  createClientFromTemplate: async (templateId: string, clientData: Partial<ClientCreate>): Promise<Client> => {
    const template = await clientTemplatesApi.get(templateId);
    const newClient: ClientCreate = {
      ...clientData,
      client_type: template.client_type,
      industry: template.industry,
      custom_rates: template.custom_rates,
      settings: template.settings,
    } as ClientCreate;
    return await clientsApi.create(newClient);
  },
};

// Industries (New Hierarchical Client Management)
export const industriesApi = {
  list: async (includeArchived: boolean = false): Promise<Industry[]> => {
    const response = await api.get<Industry[]>(`/industries/?include_archived=${includeArchived}`);
    return response.data;
  },

  get: async (id: string): Promise<Industry> => {
    const response = await api.get<Industry>(`/industries/${id}`);
    return response.data;
  },

  getWithCompanies: async (id: string): Promise<{ industry: Industry; companies: Company[] }> => {
    const [industry, companies] = await Promise.all([
      industriesApi.get(id),
      companiesApi.list(id, true),
    ]);
    return { industry, companies };
  },

  create: async (data: IndustryCreate): Promise<Industry> => {
    const response = await api.post<Industry>('/industries/', data);
    return response.data;
  },

  update: async (id: string, data: IndustryUpdate): Promise<Industry> => {
    const response = await api.patch<Industry>(`/industries/${id}`, data);
    return response.data;
  },

  archive: async (id: string): Promise<Industry> => {
    const response = await api.post<Industry>(`/industries/${id}/archive`);
    return response.data;
  },

  unarchive: async (id: string): Promise<Industry> => {
    const response = await api.post<Industry>(`/industries/${id}/unarchive`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/industries/${id}`);
  },
};

// Companies (New Hierarchical Client Management)
export const companiesApi = {
  list: async (industryId?: string, activeOnly: boolean = true): Promise<Company[]> => {
    const params = new URLSearchParams();
    if (industryId) params.append('industry_id', industryId);
    params.append('active_only', String(activeOnly));
    const response = await api.get<Company[]>(`/companies/?${params.toString()}`);
    return response.data;
  },

  get: async (id: string): Promise<Company> => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  getWithRateSheets: async (id: string): Promise<{ company: Company; rate_sheets: RateSheet[] }> => {
    const [company, rate_sheets] = await Promise.all([
      companiesApi.get(id),
      rateSheetsApi.list(id, true),
    ]);
    return { company, rate_sheets };
  },

  create: async (data: CompanyCreate): Promise<Company> => {
    const response = await api.post<Company>('/companies/', data);
    return response.data;
  },

  update: async (id: string, data: CompanyUpdate): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}`, data);
    return response.data;
  },

  clone: async (id: string, cloneData: CompanyClone): Promise<Company> => {
    const response = await api.post<Company>(`/companies/${id}/clone`, cloneData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

// Rate Sheets (New Hierarchical Client Management)
export const rateSheetsApi = {
  list: async (companyId?: string, activeOnly: boolean = true): Promise<RateSheet[]> => {
    const params = new URLSearchParams();
    if (companyId) params.append('company_id', companyId);
    params.append('active_only', String(activeOnly));
    const response = await api.get<RateSheet[]>(`/rate-sheets/?${params.toString()}`);
    return response.data;
  },

  get: async (id: string): Promise<RateSheet> => {
    const response = await api.get<RateSheet>(`/rate-sheets/${id}`);
    return response.data;
  },

  getDefault: async (companyId: string): Promise<RateSheet> => {
    const response = await api.get<RateSheet>(`/rate-sheets/company/${companyId}/default`);
    return response.data;
  },

  create: async (data: RateSheetCreate): Promise<RateSheet> => {
    const response = await api.post<RateSheet>('/rate-sheets/', data);
    return response.data;
  },

  update: async (id: string, data: RateSheetUpdate): Promise<RateSheet> => {
    const response = await api.patch<RateSheet>(`/rate-sheets/${id}`, data);
    return response.data;
  },

  setDefault: async (id: string): Promise<RateSheet> => {
    const response = await api.post<RateSheet>(`/rate-sheets/${id}/set-default`);
    return response.data;
  },

  clone: async (id: string, cloneData: RateSheetClone): Promise<RateSheet> => {
    const response = await api.post<RateSheet>(`/rate-sheets/${id}/clone`, cloneData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/rate-sheets/${id}`);
  },
};

export default api;