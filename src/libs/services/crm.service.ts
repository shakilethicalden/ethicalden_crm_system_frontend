import { apiRequest, type ApiRequestOptions } from "@/libs/api/client";
import type {
  CrmEmployee,
  CrmEmployeePayload,
  CrmFollowUp,
  CrmFollowUpPayload,
  CrmLead,
  CrmLeadPayload,
  DetailResponse,
  PaginatedResponse,
} from "@/libs/api/types";

type ListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | undefined;
};

function cleanParams(params?: ListParams) {
  return Object.fromEntries(Object.entries(params ?? {}).filter(([, value]) => value !== "" && value !== undefined));
}

export const employeeService = {
  list(params?: ListParams, options?: ApiRequestOptions) {
    return apiRequest<PaginatedResponse<CrmEmployee>>("/employees/", { ...options, params: cleanParams(params) });
  },
  create(payload: CrmEmployeePayload) {
    return apiRequest<DetailResponse<CrmEmployee>>("/employees/", { method: "POST", data: payload });
  },
  update(id: string, payload: Partial<CrmEmployeePayload>) {
    return apiRequest<DetailResponse<CrmEmployee>>(`/employees/${id}/`, { method: "PATCH", data: payload });
  },
  delete(id: string) {
    return apiRequest<void>(`/employees/${id}/`, { method: "DELETE" });
  },
};

export const leadService = {
  list(params?: ListParams, options?: ApiRequestOptions) {
    return apiRequest<PaginatedResponse<CrmLead>>("/leads/", { ...options, params: cleanParams(params) });
  },
  create(payload: CrmLeadPayload) {
    return apiRequest<DetailResponse<CrmLead>>("/leads/", { method: "POST", data: payload });
  },
  update(id: string, payload: Partial<CrmLeadPayload>) {
    return apiRequest<DetailResponse<CrmLead>>(`/leads/${id}/`, { method: "PATCH", data: payload });
  },
  delete(id: string) {
    return apiRequest<void>(`/leads/${id}/`, { method: "DELETE" });
  },
};

export const followUpService = {
  list(params?: ListParams, options?: ApiRequestOptions) {
    return apiRequest<PaginatedResponse<CrmFollowUp>>("/follow-ups/", { ...options, params: cleanParams(params) });
  },
  create(payload: CrmFollowUpPayload) {
    return apiRequest<DetailResponse<CrmFollowUp>>("/follow-ups/", { method: "POST", data: payload });
  },
  update(id: string, payload: Partial<CrmFollowUpPayload>) {
    return apiRequest<DetailResponse<CrmFollowUp>>(`/follow-ups/${id}/`, { method: "PATCH", data: payload });
  },
  delete(id: string) {
    return apiRequest<void>(`/follow-ups/${id}/`, { method: "DELETE" });
  },
};
