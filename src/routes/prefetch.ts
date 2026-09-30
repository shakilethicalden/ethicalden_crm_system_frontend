import { employeeService, followUpService, leadService } from "@/libs/services";

const PREFETCHERS: Record<string, () => Promise<unknown>> = {
  "/employees": () => employeeService.list({ page: 1, page_size: 100, ordering: "name" }),
  "/leads": () => leadService.list({ page: 1, page_size: 100, ordering: "-created_at" }),
  "/follow-ups": () => followUpService.list({ page: 1, page_size: 100, ordering: "-scheduled_at" }),
};

export function prefetchRoute(href: string) {
  PREFETCHERS[href]?.().catch(() => {
    // The page will load normally if prefetching fails.
  });
}
