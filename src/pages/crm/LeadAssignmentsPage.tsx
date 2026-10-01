import { useState } from "react";
import { Badge, DataTable, Field, FormGrid, Icon, IconButton, Select, Textarea } from "@/components/ui";
import type { LeadAssignment, LeadAssignmentPayload } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { leadAssignmentService, leadService, memberService } from "@/libs/services";
import { formatDateTime } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, DetailGrid, DetailItem, DetailModal, FormModal, PageTitle, RowButtons } from "./crmPageUtils";

const emptyAssignment: LeadAssignmentPayload = { lead: "", assigned_to: "", active: true, remarks: "" };

function memberLabel(user?: LeadAssignment["assigned_to_detail"]) {
  return user?.name ?? user?.user_detail?.email ?? "N/A";
}

function initial(row: LeadAssignment | null): LeadAssignmentPayload {
  if (!row?.id) return emptyAssignment;
  return {
    lead: row.lead,
    assigned_to: row.assigned_to,
    active: row.active,
    remarks: row.remarks ?? "",
  };
}

export default function LeadAssignmentsPage() {
  const [viewing, setViewing] = useState<LeadAssignment | null>(null);
  const [editing, setEditing] = useState<LeadAssignment | null>(null);
  const [deleting, setDeleting] = useState<LeadAssignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => leadAssignmentService.list({ page: 1, page_size: 100, ordering: "-assigned_at" }, { cache: fresh ? "no-store" : "default", signal }),
    [],
    { key: "crm-lead-assignments" },
  );
  const { data: leads } = useAsyncData((_fresh, signal) => leadService.list({ page: 1, page_size: 100, ordering: "business_name" }, { signal }), [], { key: "assignment-leads" });
  const { data: members } = useAsyncData((_fresh, signal) => memberService.list({ page: 1, page_size: 100, ordering: "name" }, { signal }), [], { key: "assignment-members" });

  async function removeAssignment() {
    if (!deleting) return;
    setIsDeleting(true);
    await leadAssignmentService.delete(deleting.id).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:clipboard-list-bold-duotone"
        title="Lead Assignments"
        description="Assign leads to calling agents and track active assignment history."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() => setEditing({ id: "", ...emptyAssignment } as LeadAssignment)}
        createLabel="New Assignment"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        columns={[
          { key: "lead", label: "Lead", render: (row) => row.lead_detail?.business_name ?? row.lead },
          {
            key: "assigned_to",
            label: "Assigned to",
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{memberLabel(row.assigned_to_detail)}</p>
                <p className="text-xs text-muted">{row.assigned_to_detail?.user_detail?.email ?? row.assigned_to}</p>
              </div>
            ),
          },
          {
            key: "assigned_by",
            label: "Assigned by",
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{memberLabel(row.assigned_by_detail)}</p>
                <p className="text-xs text-muted">{row.assigned_by_detail?.user_detail?.email ?? row.assigned_by ?? ""}</p>
              </div>
            ),
          },
          { key: "assigned_at", label: "Assigned at", render: (row) => formatDateTime(row.assigned_at), sortable: true },
          { key: "active", label: "Active", render: (row) => <Badge tone={row.active ? "success" : "muted"}>{row.active ? "Active" : "Inactive"}</Badge> },
          { key: "remarks", label: "Remarks", className: "max-w-[320px] truncate" },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => (
          <div className="flex items-center gap-1.5">
            <IconButton label="View assignment" onClick={() => setViewing(row)}>
              <Icon icon="solar:eye-linear" className="size-4" />
            </IconButton>
            <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />
          </div>
        )}
        searchPlaceholder="Search assignments"
        searchText={(row) =>
          `${row.lead_detail?.business_name ?? row.lead} ${row.assigned_to} ${memberLabel(row.assigned_to_detail)} ${row.assigned_to_detail?.user_detail?.email ?? ""} ${row.assigned_by_detail?.user_detail?.email ?? ""} ${row.remarks ?? ""}`
        }
        noun="assignments"
        minWidth={980}
        emptyText={error || "No assignment history found."}
      />
      {viewing ? (
        <DetailModal
          title="Assignment Details"
          description={viewing.lead}
          icon="solar:clipboard-list-bold-duotone"
          isOpen
          onClose={() => setViewing(null)}
        >
          <DetailGrid>
            <DetailItem label="Lead" value={viewing.lead_detail?.business_name ?? viewing.lead} />
            <DetailItem label="Assigned to" value={memberLabel(viewing.assigned_to_detail)} />
            <DetailItem label="Assigned email" value={viewing.assigned_to_detail?.user_detail?.email} />
            <DetailItem label="Assigned by" value={memberLabel(viewing.assigned_by_detail)} />
            <DetailItem label="Assigned at" value={formatDateTime(viewing.assigned_at)} />
            <DetailItem label="Active" value={viewing.active ? "Yes" : "No"} />
            <DetailItem label="Remarks" value={viewing.remarks} full />
          </DetailGrid>
        </DetailModal>
      ) : null}
      {editing ? (
        <FormModal
          key={editing.id || "new"}
          title={editing.id ? "Edit assignment" : "Create assignment"}
          description="Assign a lead to a member and mark whether the assignment is active."
          icon="solar:clipboard-list-bold-duotone"
          isOpen
          initial={initial(editing)}
          onClose={() => setEditing(null)}
          onSubmit={async (value) => {
            const payload = { ...value, remarks: value.remarks?.trim() };
            if (editing.id) await leadAssignmentService.patch(editing.id, payload);
            else await leadAssignmentService.create(payload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Lead">
                <Select value={value.lead} onChange={(event) => setValue({ lead: event.target.value })} required>
                  <option value="">Select lead</option>
                  {(leads?.data ?? []).map((lead) => <option key={lead.id} value={lead.id}>{lead.business_name}</option>)}
                </Select>
              </Field>
              <Field label="Assigned to">
                <Select value={value.assigned_to} onChange={(event) => setValue({ assigned_to: event.target.value })} required>
                  <option value="">Select member</option>
                  {(members?.data ?? []).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </Select>
              </Field>
              <Field label="Active">
                <Select value={String(value.active)} onChange={(event) => setValue({ active: event.target.value === "true" })}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </Field>
              <Field label="Remarks" full>
                <Textarea value={value.remarks ?? ""} onChange={(event) => setValue({ remarks: event.target.value })} />
              </Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      <DeleteDialog
        label={deleting?.lead_detail?.business_name ?? "assignment"}
        isOpen={!!deleting}
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void removeAssignment()}
      />
    </CrmPage>
  );
}
