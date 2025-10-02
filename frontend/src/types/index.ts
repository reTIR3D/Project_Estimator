// API Types matching backend schemas

export type ProjectSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'PHASE_GATE';
export type ProjectType = 'STANDARD';
export type ProjectPhase = 'FRAME' | 'SCREEN' | 'REFINE' | 'IMPLEMENT';
export type ClientProfile = 'TYPE_A' | 'TYPE_B' | 'TYPE_C' | 'NEW_CLIENT';
export type ProjectStatus = 'DRAFT' | 'ESTIMATION' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export interface ComplexityFactors {
  multidiscipline?: boolean;
  fasttrack?: boolean;
  brownfield?: boolean;
  regulatory?: boolean;
  international?: boolean;
  incomplete_requirements?: boolean;
}

export interface ResourceAvailability {
  [key: string]: number;
}

export interface Project {
  id: string;
  name: string;
  project_code?: string;
  description?: string;
  size: ProjectSize;
  discipline: string;
  project_type: ProjectType;
  parent_project_id?: string;
  company_id?: string;
  rate_sheet_id?: string;
  client_profile: ClientProfile;
  client_name?: string;
  status: ProjectStatus;
  complexity_factors: ComplexityFactors;
  resource_availability: ResourceAvailability;
  contingency_percent: number;
  confidence_level?: ConfidenceLevel;
  base_hours?: number;
  complexity_multiplier?: number;
  adjusted_hours?: number;
  total_hours?: number;
  duration_weeks?: number;
  total_cost?: number;
  current_phase?: ProjectPhase;
  phase_completion?: { [key: string]: number };
  gate_approvals?: { [key: string]: any };
  selected_disciplines?: string[];
  created_at: string;
  updated_at?: string;
  overhead_percent?: number;
}

export interface EstimationRequest {
  project_size: ProjectSize;
  complexity_factors: ComplexityFactors;
  client_profile: ClientProfile;
  resource_availability: ResourceAvailability;
  contingency_percent: number;
  overhead_percent: number;
  base_hours_override?: number;
  client_complexity?: number; // Client complexity rating 1-10, defaults to 5
}

export interface EstimationResponse {
  base_hours: number;
  complexity_multiplier: number;
  client_multiplier: number;
  adjusted_hours: number;
  contingency_hours: number;
  overhead_hours: number;
  total_hours: number;
  duration_weeks: number;
  confidence_level: string;
  confidence_score: number;
}

export interface ComplexityFactorInfo {
  value: number;
  description: string;
  impact_percent: number;
}

export interface ComplexityFactorsResponse {
  factors: {
    [key: string]: ComplexityFactorInfo;
  };
}

export interface ProjectCreate {
  name: string;
  project_code?: string;
  description?: string;
  size: ProjectSize;
  discipline: string;
  project_type?: ProjectType;
  parent_project_id?: string;
  company_id?: string;
  rate_sheet_id?: string;
  client_profile: ClientProfile;
  client_name?: string;
  complexity_factors?: ComplexityFactors;
  resource_availability?: ResourceAvailability;
  contingency_percent?: number;
  overhead_percent?: number;
  current_phase?: ProjectPhase;
  selected_disciplines?: string[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// Cost Calculation Types
export interface RACIBreakdown {
  responsible: number;  // hours for developer/owner
  accountable: number;  // hours for review/QC/approval
  consulted: number;    // hours for input/coordination
  informed: number;     // hours for admin/documentation
}

export interface DeliverableInput {
  name: string;
  hours: number;
  raci_breakdown?: RACIBreakdown;
}

export interface CostCalculationRequest {
  deliverables: DeliverableInput[];
  custom_rates?: { [key: string]: number };
}

export interface RoleBreakdown {
  role: string;
  hours: number;
  cost: number;
}

export interface DeliverableCostBreakdown {
  deliverable_name: string;
  total_hours: number;
  total_cost: number;
  role_breakdown: RoleBreakdown[];
}

export interface RoleSummary {
  role: string;
  hours: number;
  cost: number;
  percentage: number;
}

export interface CostSummary {
  total_hours: number;
  total_cost: number;
  deliverable_count: number;
  average_cost_per_hour: number;
}

export interface CostCalculationResponse {
  summary: CostSummary;
  by_role: RoleSummary[];
  by_deliverable: DeliverableCostBreakdown[];
}

// Client Configuration Types (Legacy)
export interface Client {
  id: string;
  name: string;
  code?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  client_type: string;
  industry?: string;
  custom_rates: { [role: string]: number };
  settings?: { [key: string]: any };
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ClientCreate {
  name: string;
  code?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  client_type?: string;
  industry?: string;
  custom_rates?: { [role: string]: number };
  settings?: { [key: string]: any };
  is_active?: boolean;
}

// New Hierarchical Client Management Types
export interface Industry {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_archived: boolean;
  created_at: string;
  updated_at?: string;
  company_count?: number;
}

export interface IndustryCreate {
  name: string;
  description?: string;
  display_order?: number;
}

export interface IndustryUpdate {
  name?: string;
  description?: string;
  display_order?: number;
  is_archived?: boolean;
}

export interface Company {
  id: string;
  industry_id: string;
  name: string;
  code?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  client_type: 'STANDARD' | 'PREFERRED' | 'STRATEGIC';
  client_complexity: number; // 1-10 scale
  base_contingency: number; // percentage
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  rate_sheet_count?: number;
}

export interface CompanyCreate {
  industry_id: string;
  name: string;
  code?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  client_type?: 'STANDARD' | 'PREFERRED' | 'STRATEGIC';
  client_complexity?: number;
  base_contingency?: number;
}

export interface CompanyUpdate {
  industry_id?: string;
  name?: string;
  code?: string;
  description?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  client_type?: 'STANDARD' | 'PREFERRED' | 'STRATEGIC';
  client_complexity?: number;
  base_contingency?: number;
  is_active?: boolean;
}

export interface CompanyClone {
  new_name: string;
  new_code?: string;
  target_industry_id?: string;
  clone_rate_sheets?: boolean;
}

export interface RateEntry {
  role: string;
  discipline: string;
  rate: number;
  unit?: string; // Optional for backwards compatibility, defaults to "hourly"
}

export interface RateSheet {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  rates: { [role: string]: number };
  rate_entries: RateEntry[];
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RateSheetCreate {
  company_id: string;
  name: string;
  description?: string;
  rates?: { [role: string]: number };
  is_default?: boolean;
}

export interface RateSheetUpdate {
  name?: string;
  description?: string;
  rates?: { [role: string]: number };
  rate_entries?: RateEntry[];
  is_default?: boolean;
  is_active?: boolean;
}

export interface RateSheetClone {
  new_name: string;
  target_company_id?: string;
  new_description?: string;
}