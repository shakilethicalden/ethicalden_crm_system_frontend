import { useMemo, useState } from "react";
import { Badge, Checkbox, DataTable, Field, FormGrid, Icon, IconButton, Input, Select, Textarea } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type { CrmFollowUpPayload, CrmLead, CrmLeadPayload, FollowUpStatus, LeadPriority, LeadSource, LeadStatus } from "@/libs/api/types";
import { hasRole, LEAD_CREATORS, useAuth } from "@/libs/auth";
import { useAsyncData } from "@/libs/hooks";
import { campaignService, countryService, followUpService, leadService, memberService, regionService } from "@/libs/services";
import { formatDateTime, formatStatus } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, DetailGrid, DetailItem, DetailModal, FormModal, fromInputDateTime, PageTitle, RowButtons, toInputDateTime } from "./crmPageUtils";

const sourceOptions: LeadSource[] = ["website", "facebook", "google", "linkedin", "referral", "cold_call", "other"];
const statusOptions: LeadStatus[] = ["new", "assigned", "in_progress", "contacted", "qualified", "converted", "lost"];
const priorityOptions: LeadPriority[] = ["low", "medium", "high"];
const followUpStatusOptions: FollowUpStatus[] = ["upcoming", "completed", "missed", "cancelled"];

const emptyLead: CrmLeadPayload = {
  business_name: "",
  contact_name: "",
  phone: "",
  alternative_phone: "",
  email: "",
  website: "",
  country: "",
  region: "",
  address: "",
  source: "website",
  priority: "medium",
  notes: "",
  generator: "",
  campaign: "",
  assigned_agent: null,
  status: "new",
  is_archived: false,
};

const priorityTone: Record<string, BadgeTone> = { low: "muted", medium: "brand", high: "danger" };
const statusTone: Record<string, BadgeTone> = {
  new: "brand",
  assigned: "strong",
  in_progress: "strong",
  contacted: "brand",
  qualified: "success",
  converted: "success",
  lost: "danger",
};

function memberName(member?: CrmLead["assigned_agent_detail"] | CrmLead["generator_detail"]) {
  return member?.name ?? member?.user_detail?.email ?? "N/A";
}

function leadInitial(lead: CrmLead | null): CrmLeadPayload {
  if (!lead?.id) return emptyLead;
  return {
    business_name: lead.business_name,
    contact_name: lead.contact_name,
    phone: lead.phone,
    alternative_phone: lead.alternative_phone ?? "",
    email: lead.email ?? "",
    website: lead.website ?? "",
    country: lead.country,
    region: lead.region,
    address: lead.address,
    source: lead.source,
    priority: lead.priority,
    notes: lead.notes,
    generator: lead.generator,
    campaign: lead.campaign,
    assigned_agent: lead.assigned_agent,
    status: lead.status,
    is_archived: lead.is_archived,
  };
}

function cleanLeadPayload(payload: CrmLeadPayload): CrmLeadPayload {
  return {
    business_name: payload.business_name.trim(),
    contact_name: payload.contact_name.trim(),
    phone: payload.phone.trim(),
    alternative_phone: payload.alternative_phone?.trim() || "",
    email: payload.email?.trim() || "",
    website: payload.website?.trim() || "",
    country: payload.country,
    region: payload.region,
    address: payload.address.trim(),
    source: payload.source,
    priority: payload.priority,
    notes: payload.notes.trim(),
    generator: payload.generator || undefined,
    campaign: payload.campaign,
    assigned_agent: payload.assigned_agent || null,
    status: payload.status,
    is_archived: Boolean(payload.is_archived),
  };
}

function followUpInitial(lead: CrmLead): CrmFollowUpPayload {
  return {
    lead: lead.id,
    due_at: "",
    reason: "Second call",
    notes: "",
    status: "upcoming",
  };
}

export default function LeadsPage() {
  const { role } = useAuth();
  const canCreateLead = hasRole(role, LEAD_CREATORS);
  const [viewing, setViewing] = useState<CrmLead | null>(null);
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<CrmLead | null>(null);
  const [deleting, setDeleting] = useState<CrmLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [archived, setArchived] = useState("false");

  const leadQuery = useMemo(() => ({ page: 1, page_size: 100, ordering: "-generated_at", priority, status, is_archived: archived }), [priority, status, archived]);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => leadService.list(leadQuery, { cache: fresh ? "no-store" : "default", signal }),
    [leadQuery],
    { key: `crm-leads:${priority}:${status}:${archived}` },
  );
  const { data: members } = useAsyncData((_fresh, signal) => memberService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }), [], { key: "lead-members" });
  const { data: countries } = useAsyncData((_fresh, signal) => countryService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }), [], { key: "lead-countries" });
  const { data: regions } = useAsyncData((_fresh, signal) => regionService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }), [], { key: "lead-regions" });
  const { data: campaigns } = useAsyncData((_fresh, signal) => campaignService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }), [], { key: "lead-campaigns" });

  async function removeLead() {
    if (!deleting) return;
    setIsDeleting(true);
    await leadService.delete(deleting.id).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:case-round-minimalistic-bold-duotone"
        title="Lead Management"
        description="Create, assign, prioritize, archive, and follow up leads from campaigns."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={canCreateLead ? () => setEditing({ id: "", ...emptyLead } as CrmLead) : undefined}
        createLabel={canCreateLead ? "New Lead" : undefined}
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        filters={
          <>
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 text-xs">
              <option value="">All statuses</option>
              {statusOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}
            </Select>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-8 text-xs">
              <option value="">All priorities</option>
              {priorityOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}
            </Select>
            <Select value={archived} onChange={(event) => setArchived(event.target.value)} className="h-8 text-xs">
              <option value="false">Active leads</option>
              <option value="true">Archived leads</option>
              <option value="">All archive states</option>
            </Select>
          </>
        }
        columns={[
          {
            key: "business_name",
            label: "Business",
            sortable: true,
            render: (row) => (
              <div>
                <p className="font-bold text-ink">{row.business_name}</p>
                <p className="text-xs text-muted">{row.contact_name || row.email || row.phone}</p>
              </div>
            ),
          },
          { key: "phone", label: "Phone", sortable: true },
          { key: "campaign", label: "Campaign", render: (row) => row.campaign_detail?.name ?? row.campaign },
          { key: "status", label: "Status", render: (row) => <Badge tone={statusTone[row.status] ?? "muted"}>{formatStatus(row.status)}</Badge> },
          { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone[row.priority] ?? "muted"}>{formatStatus(row.priority)}</Badge> },
          { key: "assigned_agent", label: "Agent", render: (row) => memberName(row.assigned_agent_detail) },
          { key: "country", label: "Region", render: (row) => `${row.country_name ?? row.country} / ${row.region_name ?? row.region}` },
          { key: "generated_at", label: "Generated", render: (row) => formatDateTime(row.generated_at ?? row.created_at), sortable: true },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <IconButton label="View lead" onClick={() => setViewing(row)}><Icon icon="solar:eye-linear" className="size-4" /></IconButton>
            <IconButton label="Create followup" onClick={() => setFollowUpLead(row)}><Icon icon="solar:calendar-add-linear" className="size-4" /></IconButton>
            <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
          </div>
        )}
        searchPlaceholder="Search leads"
        searchText={(row) => `${row.business_name} ${row.contact_name} ${row.email ?? ""} ${row.phone} ${row.source} ${row.status} ${row.priority} ${memberName(row.assigned_agent_detail)}`}
        noun="leads"
        minWidth={1240}
        emptyText={error || "No leads found."}
      />
      {viewing ? (
        <DetailModal title={viewing.business_name} description={viewing.contact_name || viewing.phone} icon="solar:case-round-minimalistic-bold-duotone" isOpen onClose={() => setViewing(null)}>
          <DetailGrid>
            <DetailItem label="Contact" value={viewing.contact_name} />
            <DetailItem label="Phone" value={viewing.phone} />
            <DetailItem label="Alternative phone" value={viewing.alternative_phone} />
            <DetailItem label="Email" value={viewing.email} />
            <DetailItem label="Website" value={viewing.website} />
            <DetailItem label="Source" value={formatStatus(viewing.source)} />
            <DetailItem label="Status" value={<Badge tone={statusTone[viewing.status] ?? "muted"}>{formatStatus(viewing.status)}</Badge>} />
            <DetailItem label="Priority" value={<Badge tone={priorityTone[viewing.priority] ?? "muted"}>{formatStatus(viewing.priority)}</Badge>} />
            <DetailItem label="Campaign" value={viewing.campaign_detail?.name ?? viewing.campaign} />
            <DetailItem label="Generator" value={memberName(viewing.generator_detail)} />
            <DetailItem label="Assigned agent" value={memberName(viewing.assigned_agent_detail)} />
            <DetailItem label="Country / Region" value={`${viewing.country_name ?? viewing.country} / ${viewing.region_name ?? viewing.region}`} />
            <DetailItem label="Archived" value={viewing.is_archived ? "Yes" : "No"} />
            <DetailItem label="In progress by" value={memberName(viewing.in_progress_by_detail)} />
            <DetailItem label="In progress at" value={formatDateTime(viewing.in_progress_at)} />
            <DetailItem label="Address" value={viewing.address} full />
            <DetailItem label="Notes" value={viewing.notes} full />
          </DetailGrid>
        </DetailModal>
      ) : null}
      {editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? "Edit lead" : "Create lead"}
          description="Lead fields match the current CRM API contract."
          icon="solar:case-round-minimalistic-bold-duotone"
          isOpen
          initial={leadInitial(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            const cleanPayload = cleanLeadPayload(payload);
            if (editing.id) await leadService.patch(editing.id, cleanPayload);
            else await leadService.create(cleanPayload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Business name"><Input value={value.business_name} onChange={(event) => setValue({ business_name: event.target.value })} required /></Field>
              <Field label="Contact name"><Input value={value.contact_name} onChange={(event) => setValue({ contact_name: event.target.value })} required /></Field>
              <Field label="Phone"><Input value={value.phone} onChange={(event) => setValue({ phone: event.target.value })} required /></Field>
              <Field label="Alternative phone"><Input value={value.alternative_phone ?? ""} onChange={(event) => setValue({ alternative_phone: event.target.value })} /></Field>
              <Field label="Email"><Input type="email" value={value.email ?? ""} onChange={(event) => setValue({ email: event.target.value })} /></Field>
              <Field label="Website"><Input value={value.website ?? ""} onChange={(event) => setValue({ website: event.target.value })} /></Field>
              <Field label="Country">
                <Select value={value.country} onChange={(event) => setValue({ country: event.target.value, region: "" })} required>
                  <option value="">Select country</option>
                  {(countries?.data ?? []).map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
                </Select>
              </Field>
              <Field label="Region">
                <Select value={value.region} onChange={(event) => setValue({ region: event.target.value })} required>
                  <option value="">Select region</option>
                  {(regions?.data ?? []).filter((region) => !value.country || region.country === value.country).map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}
                </Select>
              </Field>
              <Field label="Campaign">
                <Select value={value.campaign} onChange={(event) => setValue({ campaign: event.target.value })} required>
                  <option value="">Select campaign</option>
                  {(campaigns?.data ?? []).map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}
                </Select>
              </Field>
              <Field label="Generator">
                <Select value={value.generator ?? ""} onChange={(event) => setValue({ generator: event.target.value || undefined })}>
                  <option value="">Backend default</option>
                  {(members?.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </Select>
              </Field>
              <Field label="Assigned agent">
                <Select value={value.assigned_agent ?? ""} onChange={(event) => setValue({ assigned_agent: event.target.value || null })}>
                  <option value="">Unassigned</option>
                  {(members?.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </Select>
              </Field>
              <Field label="Source"><Select value={value.source} onChange={(event) => setValue({ source: event.target.value })}>{sourceOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</Select></Field>
              <Field label="Priority"><Select value={value.priority} onChange={(event) => setValue({ priority: event.target.value })}>{priorityOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</Select></Field>
              <Field label="Status"><Select value={value.status ?? "new"} onChange={(event) => setValue({ status: event.target.value })}>{statusOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</Select></Field>
              <Field label="Archived"><Checkbox label="Archived" checked={Boolean(value.is_archived)} onChange={(event) => setValue({ is_archived: event.target.checked })} /></Field>
              <Field label="Address" full><Input value={value.address} onChange={(event) => setValue({ address: event.target.value })} required /></Field>
              <Field label="Notes" full><Textarea value={value.notes} onChange={(event) => setValue({ notes: event.target.value })} /></Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      {followUpLead ? (
        <FormModal
          key={followUpLead.id}
          title="Create followup"
          description={`Schedule the next action for ${followUpLead.business_name}.`}
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          initial={followUpInitial(followUpLead)}
          onClose={() => setFollowUpLead(null)}
          onSubmit={async (value) => {
            await followUpService.create({ ...value, due_at: fromInputDateTime(value.due_at) ?? value.due_at });
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Lead"><Input value={followUpLead.business_name} disabled /></Field>
              <Field label="Due at"><Input type="datetime-local" value={toInputDateTime(value.due_at)} onChange={(event) => setValue({ due_at: event.target.value })} required /></Field>
              <Field label="Status"><Select value={value.status} onChange={(event) => setValue({ status: event.target.value })}>{followUpStatusOptions.map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</Select></Field>
              <Field label="Reason"><Input value={value.reason} onChange={(event) => setValue({ reason: event.target.value })} required /></Field>
              <Field label="Notes" full><Textarea value={value.notes} onChange={(event) => setValue({ notes: event.target.value })} /></Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      <DeleteDialog label={deleting?.business_name ?? "lead"} isOpen={!!deleting} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void removeLead()} />
    </CrmPage>
  );
}
