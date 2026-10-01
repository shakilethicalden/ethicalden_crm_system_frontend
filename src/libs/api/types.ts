export type UserType = "super_admin" | "team_leader" | "lead_generator" | "calling_agent";

export type LoginUser = {
  id: number;
  username: string;
  email: string;
  role: UserType | string;
  user_type?: UserType | string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export type LoginResponse = DetailResponse<{
  access: string;
  refresh: string;
  user: LoginUser;
}>;

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  count: number;
  total_pages: number;
  current_page: number;
  next: string | null;
  previous: string | null;
  data: T[];
};

export type DetailResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type DeleteResponse = DetailResponse<[]>;

export type Member = {
  id: string;
  user?: LoginUser;
  user_detail?: LoginUser;
  name: string;
  contact_number: string;
  whatsapp_number: string;
  address: string;
  created_at?: string;
  updated_at?: string;
};

export type MemberPayload = {
  user?: {
    email: string;
    role: UserType;
  };
  email?: string;
  name: string;
  contact_number: string;
  whatsapp_number: string;
  address: string;
};

export type Team = {
  id: string;
  name: string;
  leader: string;
  leader_detail?: Member;
  members: string[];
  member_details?: Member[];
  created_at?: string;
  updated_at?: string;
};

export type TeamPayload = {
  name: string;
  leader: string;
  members: string[];
};

export type Country = {
  id: string;
  name: string;
  regions?: Array<{ id: string; name: string }>;
};

export type CountryPayload = {
  name: string;
};

export type Region = {
  id: string;
  country: string;
  country_detail?: Country;
  name: string;
};

export type RegionPayload = {
  country: string;
  name: string;
};

export type CountryBulkPayload = {
  countries: Array<{
    name: string;
    regions: string[];
  }>;
};

export type Service = {
  id: string;
  name: string;
  active: boolean;
};

export type ServicePayload = {
  name: string;
  active: boolean;
};

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

export type Campaign = {
  id: string;
  name: string;
  service: string;
  service_detail?: Service;
  description: string;
  country: string;
  country_name?: string;
  region: string;
  region_name?: string;
  industry: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus | string;
  assigned_team: string;
  assigned_team_detail?: Team;
  target_leads: number;
  daily_calling_target: number;
  created_at?: string;
  updated_at?: string;
};

export type CampaignPayload = {
  name: string;
  service: string;
  description: string;
  country: string;
  region: string;
  industry: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus | string;
  assigned_team: string;
  target_leads: number;
  daily_calling_target: number;
};

export type LeadSource = "website" | "facebook" | "google" | "linkedin" | "referral" | "cold_call" | "other" | string;
export type LeadStatus = "new" | "assigned" | "in_progress" | "contacted" | "qualified" | "converted" | "lost" | string;
export type LeadPriority = "low" | "medium" | "high" | string;

export type CrmLead = {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  alternative_phone?: string;
  email?: string;
  website?: string;
  country: string;
  country_detail?: Country;
  country_name?: string;
  region: string;
  region_detail?: Region;
  region_name?: string;
  address: string;
  source: LeadSource;
  priority: LeadPriority;
  notes: string;
  generator: string;
  generator_detail?: Member;
  campaign: string;
  campaign_detail?: Campaign;
  assigned_agent: string | null;
  assigned_agent_detail?: Member | null;
  status: LeadStatus;
  in_progress_by?: string | null;
  in_progress_by_detail?: Member | null;
  in_progress_at?: string | null;
  is_archived: boolean;
  updated_by?: LoginUser;
  generated_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type CrmLeadPayload = {
  business_name: string;
  contact_name: string;
  phone: string;
  alternative_phone?: string;
  email?: string;
  website?: string;
  country: string;
  region: string;
  address: string;
  source: LeadSource;
  priority: LeadPriority;
  notes: string;
  generator?: string;
  campaign: string;
  assigned_agent?: string | null;
  status?: LeadStatus;
  is_archived?: boolean;
};

export type LeadAssignment = {
  id: string;
  lead: string;
  lead_detail?: CrmLead;
  assigned_by?: string;
  assigned_by_detail?: Member;
  assigned_to: string;
  assigned_to_detail?: Member;
  active: boolean;
  assigned_at: string;
  remarks?: string;
};

export type LeadAssignmentPayload = {
  lead: string;
  assigned_to: string;
  active: boolean;
  remarks?: string;
};

export type FollowUpStatus = "upcoming" | "completed" | "missed" | "cancelled" | string;

export type CrmFollowUp = {
  id: string;
  lead: string;
  lead_detail?: CrmLead;
  agent: string;
  agent_detail?: Member;
  due_at: string;
  reason: string;
  notes: string;
  status: FollowUpStatus;
  created_at?: string;
  updated_at?: string;
};

export type CrmFollowUpPayload = {
  lead: string;
  due_at: string;
  reason: string;
  notes: string;
  status: FollowUpStatus;
};

export type AuditLog = {
  id: string;
  user: number;
  user_detail?: LoginUser;
  action: string;
  object_type: string;
  object_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
};

export type AuditLogPayload = {
  user: number;
  action: string;
  object_type: string;
  object_id: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
};
