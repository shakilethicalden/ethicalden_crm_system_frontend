import { Link } from "react-router";
import { Badge, Card, CardHeader, DashboardSkeleton, Icon, PageCard, type IconName } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import { useAsyncData } from "@/libs/hooks";
import { followUpService, leadService, memberService } from "@/libs/services";
import { formatDateTime, formatNumber } from "@/libs/utils/format";

const leadPriorityTone: Record<string, BadgeTone> = {
  low: "muted",
  medium: "brand",
  high: "danger",
};

const followUpTone: Record<string, BadgeTone> = {
  upcoming: "brand",
  completed: "success",
  missed: "danger",
  cancelled: "muted",
};

export default function DashboardPage() {
  const { data: members, isLoading: membersLoading } = useAsyncData(
    (_fresh, signal) => memberService.list({ page: 1, page_size: 100 }, { signal }),
    [],
    { key: "dashboard-members" },
  );
  const { data: leads, isLoading: leadsLoading } = useAsyncData(
    (_fresh, signal) => leadService.list({ page: 1, page_size: 100, ordering: "-created_at" }, { signal }),
    [],
    { key: "dashboard-leads" },
  );
  const { data: followUps, isLoading: followUpsLoading } = useAsyncData(
    (_fresh, signal) => followUpService.list({ page: 1, page_size: 100, ordering: "due_at" }, { signal }),
    [],
    { key: "dashboard-follow-ups" },
  );

  if (membersLoading || leadsLoading || followUpsLoading) {
    return <DashboardSkeleton />;
  }

  const leadRows = leads?.data ?? [];
  const followUpRows = followUps?.data ?? [];
  const highPriorityLeads = leadRows.filter((lead) => lead.priority === "high").length;
  const pendingFollowUps = followUpRows.filter((item) => item.status === "upcoming").length;

  return (
    <div className="grid gap-4">
      <PageCard>
        <CardHeader
          icon="solar:widget-5-bold-duotone"
          title="Ethical Den CRM"
          description="A quick read on members, lead priority, assignments, and scheduled client activity."
        >
          <Badge tone="strong">Live CRM</Badge>
        </CardHeader>
      </PageCard>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="solar:users-group-rounded-bold-duotone" label="Members" value={formatNumber(members?.count)} href="/members" />
        <MetricCard icon="solar:case-round-minimalistic-bold-duotone" label="Total Leads" value={formatNumber(leads?.count)} href="/leads" />
        <MetricCard icon="solar:danger-triangle-bold-duotone" label="High Priority Leads" value={formatNumber(highPriorityLeads)} href="/leads" />
        <MetricCard icon="solar:calendar-mark-bold-duotone" label="Pending Follow Ups" value={formatNumber(pendingFollowUps)} href="/follow-ups" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-bold text-ink">Recent leads</h2>
          <div className="grid gap-2">
            {leadRows.slice(0, 5).map((lead) => (
              <Link key={lead.id} to="/leads" className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 hover:bg-soft">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{lead.business_name}</span>
                  <span className="block truncate text-xs text-muted">{lead.contact_name || lead.phone}</span>
                </span>
                <Badge tone={leadPriorityTone[lead.priority] ?? "muted"}>{lead.priority}</Badge>
              </Link>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-bold text-ink">Upcoming follow ups</h2>
          <div className="grid gap-2">
            {followUpRows.slice(0, 5).map((item) => (
              <Link key={item.id} to="/follow-ups" className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 hover:bg-soft">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-ink">{item.lead_detail?.business_name ?? item.lead}</span>
                  <span className="block truncate text-xs text-muted">{formatDateTime(item.due_at ?? item.created_at)}</span>
                </span>
                <Badge tone={followUpTone[item.status] ?? "muted"}>{item.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, href }: { icon: IconName; label: string; value: string; href: string }) {
  return (
    <Link to={href} className="rounded-xl border border-line bg-white p-4 transition hover:border-brand-dark/40 hover:shadow-card">
      <span className="grid size-10 place-items-center rounded-lg bg-mint text-brand-dark">
        <Icon icon={icon} className="size-5" />
      </span>
      <span className="mt-4 block text-2xl font-extrabold text-ink">{value}</span>
      <span className="text-sm font-semibold text-muted">{label}</span>
    </Link>
  );
}
