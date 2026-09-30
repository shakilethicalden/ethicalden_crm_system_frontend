import { useMemo, useState } from "react";
import { Badge, DataTable, Field, FormGrid, Icon, IconButton, Input, Select, Textarea } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type {
  CrmFollowUpPayload,
  CrmLead,
  CrmLeadPayload,
  FollowUpStatus,
  FollowUpType,
  LeadPriority,
  LeadSource,
} from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { followUpService, leadService } from "@/libs/services";
import { formatDateTime } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, FormModal, fromInputDateTime, PageTitle, RowButtons, toInputDateTime } from "./crmPageUtils";

const sourceOptions: LeadSource[] = ["Website", "Facebook", "Referral", "Phone", "Email", "Other"];
const priorityOptions: LeadPriority[] = ["Low", "Medium", "High"];
const followUpTypeOptions: FollowUpType[] = ["Call", "Email", "Meeting", "Message", "Other"];
const followUpStatusOptions: FollowUpStatus[] = ["Pending", "Completed", "Missed", "Cancelled"];
const countryOptions = ["India", "USA", "Canada"] as const;

const stateOptions: Record<(typeof countryOptions)[number], string[]> = {
  India: [],
  USA: [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ],
  Canada: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ],
};

const emptyLead: CrmLeadPayload = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  country: "India",
  address: "",
  source: "Website",
  priority: "Medium",
  description: "",
};

const priorityTone: Record<LeadPriority, BadgeTone> = {
  Low: "muted",
  Medium: "brand",
  High: "danger",
};

export default function LeadsPage() {
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [followUpLead, setFollowUpLead] = useState<CrmLead | null>(null);
  const [deleting, setDeleting] = useState<CrmLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [priority, setPriority] = useState("");

  const leadQuery = useMemo(() => ({ page: 1, page_size: 100, ordering: "-created_at", priority }), [priority]);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => leadService.list(leadQuery, { cache: fresh ? "no-store" : "default", signal }),
    [leadQuery],
    { key: `crm-leads:${priority}` },
  );
  async function removeLead() {
    if (!deleting) return;
    setIsDeleting(true);
    await leadService.delete(deleting.id).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  function leadInitial(lead: CrmLead | null): CrmLeadPayload {
    if (!lead?.id) return emptyLead;
    const country = countryOptions.includes(lead.country as (typeof countryOptions)[number])
      ? (lead.country as (typeof countryOptions)[number])
      : "India";

    return {
      name: lead.name,
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      country,
      state: stateOptions[country].includes(lead.state ?? "") ? (lead.state ?? "") : undefined,
      address: lead.address,
      source: lead.source,
      priority: lead.priority,
      description: lead.description,
    };
  }

  function cleanLeadPayload(payload: CrmLeadPayload): CrmLeadPayload {
    return {
      ...payload,
      country: payload.country || "India",
      state: payload.country === "India" ? undefined : payload.state?.trim() || undefined,
    };
  }

  function followUpInitial(lead: CrmLead): CrmFollowUpPayload {
    return {
      lead: lead.id,
      follow_up_type: "Call",
      status: "Pending",
      scheduled_at: toInputDateTime(new Date().toISOString()),
      completed_at: null,
      note: "",
      next_follow_up_at: null,
    };
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:case-round-minimalistic-bold-duotone"
        title="Lead Management"
        description="Track client prospects, source, priority, and contact details."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() => setEditing({ id: "", ...emptyLead, state: null, created_at: "" })}
        createLabel="New Lead"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        filters={
          <Select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-8 text-xs">
            <option value="">All priorities</option>
            {priorityOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        }
        columns={[
          { key: "name", label: "Lead", sortable: true, render: (row) => <div><p className="font-bold text-ink">{row.name}</p><p className="text-xs text-muted">{row.company_name || row.email}</p></div> },
          { key: "phone", label: "Phone" },
          { key: "source", label: "Source" },
          { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone[row.priority]}>{row.priority}</Badge> },
          { key: "country", label: "Country", render: (row) => row.country || "N/A" },
          { key: "state", label: "State", render: (row) => row.state || "N/A" },
          { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <IconButton label={`Create follow up for ${row.name}`} onClick={() => setFollowUpLead(row)}>
              <Icon icon="solar:calendar-add-linear" className="size-4" />
            </IconButton>
            <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
          </div>
        )}
        searchPlaceholder="Search leads"
        searchText={(row) => `${row.name} ${row.company_name} ${row.email} ${row.phone} ${row.source} ${row.priority}`}
        noun="leads"
        minWidth={860}
        emptyText={error || "No leads found."}
      />
      {editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? "Edit lead" : "Create lead"}
          description="Capture pipeline details from the CRM API documentation."
          icon="solar:case-round-minimalistic-bold-duotone"
          isOpen
          initial={leadInitial(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            const cleanPayload = cleanLeadPayload(payload);
            if (editing.id) await leadService.update(editing.id, cleanPayload);
            else await leadService.create(cleanPayload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Client name">
                <Input value={value.name} onChange={(event) => setValue({ name: event.target.value })} required />
              </Field>
              <Field label="Company">
                <Input value={value.company_name} onChange={(event) => setValue({ company_name: event.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={value.email} onChange={(event) => setValue({ email: event.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={value.phone} onChange={(event) => setValue({ phone: event.target.value })} required />
              </Field>
              <Field label="Source">
                <Select value={value.source} onChange={(event) => setValue({ source: event.target.value as LeadSource })}>
                  {sourceOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={value.priority} onChange={(event) => setValue({ priority: event.target.value as LeadPriority })}>
                  {priorityOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Country">
                <Select
                  value={value.country}
                  onChange={(event) => {
                    const country = event.target.value as (typeof countryOptions)[number];
                    setValue({ country, state: undefined });
                  }}
                  required
                >
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </Field>
              {value.country !== "India" ? (
                <Field label="State">
                  <Select value={value.state ?? ""} onChange={(event) => setValue({ state: event.target.value || undefined })} required>
                    <option value="">Select state</option>
                    {stateOptions[value.country as (typeof countryOptions)[number]].map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}
              <Field label="Address">
                <Input value={value.address} onChange={(event) => setValue({ address: event.target.value })} />
              </Field>
              <Field label="Description" full>
                <Textarea value={value.description} onChange={(event) => setValue({ description: event.target.value })} />
              </Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      {followUpLead ? (
        <FormModal
          key={followUpLead.id}
          title="Create follow up"
          description={`Schedule a follow up for ${followUpLead.name}.`}
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          initial={followUpInitial(followUpLead)}
          onClose={() => setFollowUpLead(null)}
          onSubmit={async (value) => {
            await followUpService.create({
              ...value,
              scheduled_at: fromInputDateTime(value.scheduled_at) ?? "",
              completed_at: fromInputDateTime(value.completed_at ?? ""),
              next_follow_up_at: fromInputDateTime(value.next_follow_up_at ?? ""),
            });
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Lead">
                <Input value={followUpLead.name} disabled />
              </Field>
              <Field label="Type">
                <Select value={value.follow_up_type} onChange={(event) => setValue({ follow_up_type: event.target.value as FollowUpType })}>
                  {followUpTypeOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={value.status} onChange={(event) => setValue({ status: event.target.value as FollowUpStatus })}>
                  {followUpStatusOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Scheduled at">
                <Input type="datetime-local" value={value.scheduled_at} onChange={(event) => setValue({ scheduled_at: event.target.value })} required />
              </Field>
              <Field label="Completed at">
                <Input type="datetime-local" value={value.completed_at ?? ""} onChange={(event) => setValue({ completed_at: event.target.value || null })} />
              </Field>
              <Field label="Next follow up">
                <Input type="datetime-local" value={value.next_follow_up_at ?? ""} onChange={(event) => setValue({ next_follow_up_at: event.target.value || null })} />
              </Field>
              <Field label="Note" full>
                <Textarea value={value.note} onChange={(event) => setValue({ note: event.target.value })} required />
              </Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      <DeleteDialog label={deleting?.name ?? "lead"} isOpen={!!deleting} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void removeLead()} />
    </CrmPage>
  );
}
