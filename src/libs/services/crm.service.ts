import { apiRequest, type ApiRequestOptions } from "@/libs/api/client";
import type {
  AuditLog,
  AuditLogPayload,
  Campaign,
  CampaignPayload,
  Country,
  CountryBulkPayload,
  CountryPayload,
  CrmFollowUp,
  CrmFollowUpPayload,
  CrmLead,
  CrmLeadPayload,
  DeleteResponse,
  DetailResponse,
  LeadAssignment,
  LeadAssignmentPayload,
  LoginUser,
  Member,
  MemberPayload,
  PaginatedResponse,
  Region,
  RegionPayload,
  Service,
  ServicePayload,
  Team,
  TeamPayload,
} from "@/libs/api/types";

export type ListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | null | undefined;
};

function cleanParams(params?: ListParams) {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => value !== "" && value !== undefined && value !== null),
  );
}

function crudService<T, Payload>(path: string) {
  return {
    list(params?: ListParams, options?: ApiRequestOptions) {
      return apiRequest<PaginatedResponse<T>>(path, { ...options, params: cleanParams(params) });
    },
    retrieve(id: string, options?: ApiRequestOptions) {
      return apiRequest<DetailResponse<T>>(`${path}${id}/`, options);
    },
    create(payload: Payload) {
      return apiRequest<DetailResponse<T>>(path, { method: "POST", data: payload });
    },
    update(id: string, payload: Payload) {
      return apiRequest<DetailResponse<T>>(`${path}${id}/`, { method: "PUT", data: payload });
    },
    patch(id: string, payload: Partial<Payload>) {
      return apiRequest<DetailResponse<T>>(`${path}${id}/`, { method: "PATCH", data: payload });
    },
    delete(id: string) {
      return apiRequest<DeleteResponse>(`${path}${id}/`, { method: "DELETE" });
    },
  };
}

export const userService = {
  list(params?: ListParams, options?: ApiRequestOptions) {
    return apiRequest<PaginatedResponse<LoginUser>>("/users/", { ...options, params: cleanParams(params) });
  },
};

export const memberService = crudService<Member, MemberPayload>("/members/");
export const teamService = crudService<Team, TeamPayload>("/teams/");
export const countryService = {
  ...crudService<Country, CountryPayload>("/countries/"),
  bulkCreate(payload: CountryBulkPayload) {
    return apiRequest<DetailResponse<Country[]>>("/countires/bulk-create/", { method: "POST", data: payload });
  },
};
export const regionService = crudService<Region, RegionPayload>("/regions/");
export const serviceService = crudService<Service, ServicePayload>("/services/");
export const campaignService = crudService<Campaign, CampaignPayload>("/campaigns/");
export const leadService = crudService<CrmLead, CrmLeadPayload>("/leads/");
export const leadAssignmentService = crudService<LeadAssignment, LeadAssignmentPayload>("/lead-assignments/");
export const followUpService = crudService<CrmFollowUp, CrmFollowUpPayload>("/followups/");
export const auditLogService = crudService<AuditLog, AuditLogPayload>("/audit-logs/");

export const employeeService = memberService;
export const activityLogService = auditLogService;
