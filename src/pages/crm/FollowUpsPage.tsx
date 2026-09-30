import { useMemo, useState } from "react";
import { Badge, DataTable, Field, FormGrid, Icon, IconButton, Select, Textarea, Input } from "@/components/ui";
import type { BadgeTone } from "@/components/ui";
import type { CrmFollowUp, CrmFollowUpPayload, FollowUpStatus, FollowUpType } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { followUpService, leadService } from "@/libs/services";
import { formatDateTime } from "@/libs/utils/format";
import {
  CrmPage,
  DeleteDialog,
  DetailGrid,
  DetailItem,
  DetailModal,
  FormModal,
  fromInputDateTime,
  PageTitle,
  RowButtons,
  toInputDateTime,
} from "./crmPageUtils";

const typeOptions: FollowUpType[] = ["Call", "Email", "Meeting", "Message", "Other"];
const statusOptions: FollowUpStatus[] = ["Pending", "Completed", "Missed", "Cancelled"];

const emptyFollowUp: CrmFollowUpPayload = {
  lead: "",
  follow_up_type: "Call",
  status: "Pending",
  scheduled_at: "",
  completed_at: null,
  note: "",
  next_follow_up_at: null,
};

const statusTone: Record<FollowUpStatus, BadgeTone> = {
  Pending: "brand",
  Completed: "success",
  Missed: "danger",
  Cancelled: "muted",
};

export default function FollowUpsPage() {
  const [viewing, setViewing] = useState<CrmFollowUp | null>(null);
  const [editing, setEditing] = useState<CrmFollowUp | null>(null);
  const [deleting, setDeleting] = useState<CrmFollowUp | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const query = useMemo(() => ({ page: 1, page_size: 100, ordering: "-scheduled_at", status, follow_up_type: type }), [status, type]);

  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => followUpService.list(query, { cache: fresh ? "no-store" : "default", signal }),
    [query],
    { key: `crm-follow-ups:${status}:${type}` },
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

  function initial(followUp: CrmFollowUp | null): CrmFollowUpPayload {
    if (!followUp?.id) return emptyFollowUp;
    return {
      lead: followUp.lead,
      follow_up_type: followUp.follow_up_type,
      status: followUp.status,
      scheduled_at: toInputDateTime(followUp.scheduled_at),
      completed_at: toInputDateTime(followUp.completed_at),
      note: followUp.note,
      next_follow_up_at: toInputDateTime(followUp.next_follow_up_at),
    };
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:calendar-mark-bold-duotone"
        title="Follow Ups"
        description="Schedule client calls, emails, meetings, and next actions."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() => setEditing({ id: "", ...emptyFollowUp })}
        createLabel="New Follow Up"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        filters={
          <>
            <Select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 text-xs">
              <option value="">All statuses</option>
              {statusOptions.map((item) => <option key={item}>{item}</option>)}
            </Select>
            <Select value={type} onChange={(event) => setType(event.target.value)} className="h-8 text-xs">
              <option value="">All types</option>
              {typeOptions.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </>
        }
        columns={[
          { key: "lead", label: "Lead", render: (row) => <div><p className="font-bold text-ink">{row.lead_details?.name ?? row.lead}</p><p className="text-xs text-muted">{row.lead_details?.phone ?? row.lead_details?.email ?? ""}</p></div> },
          { key: "employee", label: "Employee", render: (row) => row.employee_details?.name ?? row.employee ?? "Auto assigned" },
          { key: "follow_up_type", label: "Type", sortable: true },
          { key: "status", label: "Status", render: (row) => <Badge tone={statusTone[row.status]}>{row.status}</Badge> },
          { key: "scheduled_at", label: "Scheduled", render: (row) => formatDateTime(row.scheduled_at), sortable: true },
          { key: "completed_at", label: "Completed", render: (row) => formatDateTime(row.completed_at) },
          { key: "next_follow_up_at", label: "Next", render: (row) => formatDateTime(row.next_follow_up_at) },
          { key: "note", label: "Note", className: "max-w-[260px] truncate" },
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
        searchText={(row) => `${row.lead_details?.name ?? ""} ${row.employee_details?.name ?? ""} ${row.note} ${row.status} ${row.follow_up_type}`}
        noun="follow ups"
        minWidth={1060}
        emptyText={error || "No follow ups found."}
      />
      {viewing ? (
        <DetailModal
          title={viewing.lead_details?.name ?? "Follow up details"}
          description={`${viewing.follow_up_type} follow up`}
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          onClose={() => setViewing(null)}
        >
          <DetailGrid>
            <DetailItem label="Lead" value={viewing.lead_details?.name ?? viewing.lead} />
            <DetailItem label="Lead phone" value={viewing.lead_details?.phone} />
            <DetailItem label="Employee" value={viewing.employee_details?.name ?? viewing.employee ?? "Auto assigned"} />
            <DetailItem label="Type" value={viewing.follow_up_type} />
            <DetailItem label="Status" value={<Badge tone={statusTone[viewing.status]}>{viewing.status}</Badge>} />
            <DetailItem label="Scheduled" value={formatDateTime(viewing.scheduled_at)} />
            <DetailItem label="Completed" value={formatDateTime(viewing.completed_at)} />
            <DetailItem label="Next follow up" value={formatDateTime(viewing.next_follow_up_at)} />
            <DetailItem label="Created" value={formatDateTime(viewing.created_at)} />
            <DetailItem label="Updated" value={formatDateTime(viewing.updated_at)} />
            <DetailItem label="Note" value={viewing.note} full />
          </DetailGrid>
        </DetailModal>
      ) : null}
      {editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? "Edit follow up" : "Create follow up"}
          description="Set schedule, owner, completion status, and next action."
          icon="solar:calendar-mark-bold-duotone"
          isOpen
          initial={initial(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (value) => {
            const payload: CrmFollowUpPayload = {
              ...value,
              scheduled_at: fromInputDateTime(value.scheduled_at) ?? "",
              completed_at: fromInputDateTime(value.completed_at ?? ""),
              next_follow_up_at: fromInputDateTime(value.next_follow_up_at ?? ""),
            };
            if (editing.id) await followUpService.update(editing.id, payload);
            else await followUpService.create(payload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Lead">
                <Select value={value.lead} onChange={(event) => setValue({ lead: event.target.value })} required>
                  <option value="">Select lead</option>
                  {(leads?.data ?? []).map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
                </Select>
              </Field>
              <Field label="Type">
                <Select value={value.follow_up_type} onChange={(event) => setValue({ follow_up_type: event.target.value as FollowUpType })}>
                  {typeOptions.map((item) => <option key={item}>{item}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={value.status} onChange={(event) => setValue({ status: event.target.value as FollowUpStatus })}>
                  {statusOptions.map((item) => <option key={item}>{item}</option>)}
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
      <DeleteDialog label={deleting?.lead_details?.name ?? "follow up"} isOpen={!!deleting} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void removeFollowUp()} />
    </CrmPage>
  );
}
