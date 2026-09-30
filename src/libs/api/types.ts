export type LoginUser = {
  id: number;
  email: string;
  username: string;
  user_type?: string;
  role?: string;
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    access: string;
    refresh: string;
    user: LoginUser;
  };
};

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

export type CrmEmployee = {
  id: string;
  user?: LoginUser;
  name: string;
  contact_number: string;
  address: string;
  created_at?: string;
  updated_at?: string;
};

export type CrmEmployeePayload = {
  email: string;
  name: string;
  contact_number: string;
  address: string;
  password?: string;
};

export type LeadSource = "Website" | "Facebook" | "Referral" | "Phone" | "Email" | "Other";
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
export type LeadPriority = "Low" | "Medium" | "High";

export type CrmLead = {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string | null;
  state: string | null;
  address: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  estimated_value: string;
  description: string;
  assigned_to: string | null;
  assigned_to_details?: CrmEmployee | null;
  assigned_employee?: CrmEmployee | null;
  created_at?: string;
  updated_at?: string;
};

export type CrmLeadPayload = {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  country: string | null;
  state: string | null;
  address: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  estimated_value: string;
  description: string;
  assigned_to: string | null;
};

export type FollowUpType = "Call" | "Email" | "Meeting" | "Message" | "Other";
export type FollowUpStatus = "Pending" | "Completed" | "Missed" | "Cancelled";

export type CrmFollowUp = {
  id: string;
  lead: string;
  lead_details?: CrmLead;
  employee: string;
  employee_details?: CrmEmployee;
  follow_up_type: FollowUpType;
  status: FollowUpStatus;
  scheduled_at: string;
  completed_at: string | null;
  note: string;
  next_follow_up_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CrmFollowUpPayload = {
  lead: string;
  employee: string;
  follow_up_type: FollowUpType;
  status: FollowUpStatus;
  scheduled_at: string;
  completed_at: string | null;
  note: string;
  next_follow_up_at: string | null;
};
