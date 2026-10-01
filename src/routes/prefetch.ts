import {
  auditLogService,
  campaignService,
  countryService,
  followUpService,
  leadAssignmentService,
  leadService,
  memberService,
  regionService,
  serviceService,
  teamService,
} from "@/libs/services";

const PREFETCHERS: Record<string, () => Promise<unknown>> = {
  "/members": () => memberService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/teams": () => teamService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/countries": () => countryService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/regions": () => regionService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/services": () => serviceService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/campaigns": () => campaignService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/employees": () => memberService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/leads": () => leadService.list({ page: 1, page_size: 100, ordering: "-generated_at" }),
  "/follow-ups": () => followUpService.list({ page: 1, page_size: 100, ordering: "due_at" }),
  "/lead-assignments": () => leadAssignmentService.list({ page: 1, page_size: 100 }),
  "/activity-logs": () => auditLogService.list({ page: 1, page_size: 100, ordering: "-created_at" }),
};

export function prefetchRoute(href: string) {
  PREFETCHERS[href]?.().catch(() => {
    // The page will load normally if prefetching fails.
  });
}
