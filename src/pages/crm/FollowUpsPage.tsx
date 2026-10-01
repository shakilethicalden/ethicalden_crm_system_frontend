import { useMemo, useState } from "react";
import { Badge, DataTable, Field, FormGrid, Icon, IconButton, Input, Select, Textarea } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type { CrmFollowUp, CrmFollowUpPayload, FollowUpStatus } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { followUpService, leadService } from "@/libs/services";
import { formatDateTime, formatStatus } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, DetailGrid, DetailItem, DetailModal, FormModal, fromInputDateTime, PageTitle, RowButtons, toInputDateTime } from "./crmPageUtils";

const statusOptions: FollowUpStatus[] = ["upcoming", "completed", "missed", "cancelled"];

const emptyFollowUp: CrmFollowUpPayload = {
  lead: "",
  due_at: "",
  reason: "",
  notes: "",
  status: "upcoming",
};

const statusTone: Record<FollowUpStatus, BadgeTone> = {
  upcoming: "brand",
  completed: "success",
  missed: "danger",
  cancelled: "muted",
};

function leadName(row: CrmFollowUp) {
  return row.lead_detail?.business_name ?? row.lead;
}

function agentName(row: CrmFollowUp) {
  return row.agent_detail?.name ?? row.agent_detail?.user_detail?.email ?? "N/A";
}

function initial(followUp: CrmFollowUp | null): CrmFollowUpPayload {
  if (!followUp?.id) return emptyFollowUp;
  return {
    lead: followUp.lead,
    due_at: toInputDateTime(followUp.due_at),
    reason: followUp.reason,
    notes: followUp.notes,
    status: followUp.status,
  };
}

function cleanPayload(payload: CrmFollowUpPayload): CrmFollowUpPayload {
  return {
    lead: payload.lead,
    due_at: fromInputDateTime(payload.due_at) ?? payload.due_at,
    reason: payload.reason.trim(),
    notes: payload.notes.trim(),
    status: payload.status,
  };
}

export default function FollowUpsPage() {
  const [viewing, setViewing] = useState<CrmFollowUp | null>(null);
  const [editing, setEditing] = useState<CrmFollowUp | null>(null);
  const [deleting, setDeleting] = useState<CrmFollowUp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const query = useMemo(() => ({ page: 1, page_size: 100, ordering: "due_at", status }), [status]);

  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => followUpService.list(query, { cache: fresh ? "no-store" : "default", signal }),
    [query],
    { key: `crm-followups:${status}` },
  );
  const { data: leads } = useAsyncData(
    (_fresh, signal) => leadService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }),
    [],
    { key: "crm-leads-options" },
  );

  async function removeFollowUp() {
    if (!deleting) return;
    setIsDeleting(true);
    await followUpService.delete(deleting.id).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:calendar-mark-bold-duotone"
        title="Follow Ups"
        description="Track followup due dates, reasons, notes, assigned agent, and completion status."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() =>
          setEditing({
            id: "",
            lead: "",
            agent: "",
            due_at: "",
            reason: "",
            notes: "",
            status: "upcoming",
          } as CrmFollowUp)
        }
        createLabel="New Followup"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        filters={
          <>
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 text-xs">
              <option value="">All statuses</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {formatStatus(item)}
                </option>
              ))}
            </Select>
          </>
        }
        columns={[
          {
            key: "lead",
            label: "Lead",
            render: (row) => (
              <div>
                <p className="font-bold text-ink">{leadName(row)}</p>
                <p className="text-xs text-muted">{row.lead}</p>
              </div>
            ),
          },
          {
            key: "agent",
            label: "Agent",
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{agentName(row)}</p>
                <p className="text-xs text-muted">{row.agent_detail?.user_detail?.email ?? ""}</p>
              </div>
            ),
          },
          { key: "due_at", label: "Due at", render: (row) => formatDateTime(row.due_at), sortable: true },
          { key: "reason", label: "Reason", sortable: true },
          { key: "status", label: "Status", render: (row) => <Badge tone={statusTone[row.status] ?? "muted"}>{formatStatus(row.status)}</Badge> },
          { key: "notes", label: "Notes", className: "max-w-[320px] truncate" },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <IconButton label="View follow up" onClick={() => setViewing(row)}>
              <Icon icon="solar:eye-linear" className="size-4" />
            </IconButton>
            <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
          </div>
        )}
        searchPlaceholder="Search follow ups"
        searchText={(row) => `${leadName(row)} ${agentName(row)} ${row.agent_detail?.user_detail?.email ?? ""} ${row.reason} ${row.notes} ${row.status}`}
        noun="follow ups"
        minWidth={1080}
        emptyText={error || "No follow ups found."}
      />
      {viewing ? (
        <DetailModal
          title={leadName(viewing)}
          description={viewing.reason}
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          onClose={() => setViewing(null)}
        >
          <DetailGrid>
            <DetailItem label="Lead" value={leadName(viewing)} />
            <DetailItem label="Lead ID" value={viewing.lead} />
            <DetailItem label="Agent" value={agentName(viewing)} />
            <DetailItem label="Agent email" value={viewing.agent_detail?.user_detail?.email} />
            <DetailItem label="Due at" value={formatDateTime(viewing.due_at)} />
            <DetailItem label="Reason" value={viewing.reason} />
            <DetailItem label="Status" value={<Badge tone={statusTone[viewing.status] ?? "muted"}>{formatStatus(viewing.status)}</Badge>} />
            <DetailItem label="Created" value={formatDateTime(viewing.created_at)} />
            <DetailItem label="Updated" value={formatDateTime(viewing.updated_at)} />
            <DetailItem label="Notes" value={viewing.notes} full />
          </DetailGrid>
        </DetailModal>
      ) : null}
      {editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? "Edit followup" : "Create followup"}
          description="The backend sets the agent from the active user or assignment context."
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          initial={initial(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (value) => {
            const payload = cleanPayload(value);
            if (editing.id) await followUpService.update(editing.id, payload);
            else await followUpService.create(payload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Lead">
                <Select value={value.lead} onChange={(event) => setValue({ lead: event.target.value })} required disabled={Boolean(editing.id)}>
                  <option value="">Select lead</option>
                  {(leads?.data ?? []).map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.business_name} {lead.contact_name ? `- ${lead.contact_name}` : ""}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Due at">
                <Input type="datetime-local" value={value.due_at ?? ""} onChange={(event) => setValue({ due_at: event.target.value })} required />
              </Field>
              <Field label="Status">
                <Select value={value.status} onChange={(event) => setValue({ status: event.target.value as FollowUpStatus })}>
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Reason">
                <Input value={value.reason} onChange={(event) => setValue({ reason: event.target.value })} required />
              </Field>
              <Field label="Notes" full>
                <Textarea value={value.notes ?? ""} onChange={(event) => setValue({ notes: event.target.value })} />
              </Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      <DeleteDialog
        label={deleting ? leadName(deleting) : "follow up"}
        isOpen={!!deleting}
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void removeFollowUp()}
      />
    </CrmPage>
  );
}
