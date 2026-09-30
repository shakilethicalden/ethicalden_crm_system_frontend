import { useMemo, useState } from "react";
import { Badge, DataTable, Field, FormGrid, Input, Select, Textarea } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type { CrmLead, CrmLeadPayload, LeadPriority, LeadSource, LeadStatus } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { employeeService, leadService } from "@/libs/services";
import { formatDateTime, formatMoney } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, FormModal, PageTitle, RowButtons } from "./crmPageUtils";

const sourceOptions: LeadSource[] = ["Website", "Facebook", "Referral", "Phone", "Email", "Other"];
const statusOptions: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const priorityOptions: LeadPriority[] = ["Low", "Medium", "High"];

const emptyLead: CrmLeadPayload = {
  name: "",
  company_name: "",
  email: "",
  phone: "",
  country: "Bangladesh",
  state: "",
  address: "",
  source: "Website",
  status: "New",
  priority: "Medium",
  estimated_value: "",
  description: "",
  assigned_to: null,
};

const statusTone: Record<LeadStatus, BadgeTone> = {
  New: "brand",
  Contacted: "muted",
  Qualified: "strong",
  Proposal: "brand",
  Won: "success",
  Lost: "danger",
};

const priorityTone: Record<LeadPriority, BadgeTone> = {
  Low: "muted",
  Medium: "brand",
  High: "danger",
};

export default function LeadsPage() {
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [deleting, setDeleting] = useState<CrmLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const leadQuery = useMemo(() => ({ page: 1, page_size: 100, ordering: "-created_at", status, priority }), [status, priority]);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => leadService.list(leadQuery, { cache: fresh ? "no-store" : "default", signal }),
    [leadQuery],
    { key: `crm-leads:${status}:${priority}` },
  );
  const { data: employees } = useAsyncData(
    (_fresh, signal) => employeeService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }),
    [],
    { key: "crm-employees-options" },
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
    return {
      name: lead.name,
      company_name: lead.company_name,
      email: lead.email,
      phone: lead.phone,
      country: lead.country,
      state: lead.state,
      address: lead.address,
      source: lead.source,
      status: lead.status,
      priority: lead.priority,
      estimated_value: lead.estimated_value,
      description: lead.description,
      assigned_to: lead.assigned_to,
    };
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:case-round-minimalistic-bold-duotone"
        title="Lead Management"
        description="Track prospects, pipeline status, value, and ownership."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() => setEditing({ id: "", ...emptyLead, created_at: "" })}
        createLabel="New Lead"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        filters={
          <>
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 text-xs">
              <option value="">All statuses</option>
              {statusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
            <Select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-8 text-xs">
              <option value="">All priorities</option>
              {priorityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
          </>
        }
        columns={[
          { key: "name", label: "Lead", sortable: true, render: (row) => <div><p className="font-bold text-ink">{row.name}</p><p className="text-xs text-muted">{row.company_name || row.email}</p></div> },
          { key: "phone", label: "Phone" },
          { key: "source", label: "Source" },
          { key: "status", label: "Status", render: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge> },
          { key: "priority", label: "Priority", render: (row) => <Badge tone={priorityTone[row.priority]}>{row.priority}</Badge> },
          { key: "estimated_value", label: "Value", render: (row) => formatMoney(row.estimated_value), sortable: true },
          { key: "assigned_to", label: "Assigned", render: (row) => row.assigned_to_details?.name ?? row.assigned_employee?.name ?? "Unassigned" },
          { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />}
        searchPlaceholder="Search leads"
        searchText={(row) => `${row.name} ${row.company_name} ${row.email} ${row.phone} ${row.source} ${row.status}`}
        noun="leads"
        minWidth={1040}
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
            if (editing.id) await leadService.update(editing.id, payload);
            else await leadService.create(payload);
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
              <Field label="Status">
                <Select value={value.status} onChange={(event) => setValue({ status: event.target.value as LeadStatus })}>
                  {statusOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Priority">
                <Select value={value.priority} onChange={(event) => setValue({ priority: event.target.value as LeadPriority })}>
                  {priorityOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Estimated value">
                <Input type="number" min="0" step="0.01" value={value.estimated_value} onChange={(event) => setValue({ estimated_value: event.target.value })} />
              </Field>
              <Field label="Country">
                <Input value={value.country ?? ""} onChange={(event) => setValue({ country: event.target.value || null })} />
              </Field>
              <Field label="State">
                <Input value={value.state ?? ""} onChange={(event) => setValue({ state: event.target.value || null })} />
              </Field>
              <Field label="Assigned employee">
                <Select value={value.assigned_to ?? ""} onChange={(event) => setValue({ assigned_to: event.target.value || null })}>
                  <option value="">Unassigned</option>
                  {(employees?.data ?? []).map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                </Select>
              </Field>
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
      <DeleteDialog label={deleting?.name ?? "lead"} isOpen={!!deleting} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void removeLead()} />
    </CrmPage>
  );
}
