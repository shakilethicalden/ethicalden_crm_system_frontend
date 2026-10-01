import { useState } from "react";
import { DataTable, Icon, IconButton } from "@/components/ui";
import type { AuditLog } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { auditLogService } from "@/libs/services";
import { formatDateTime, formatStatus } from "@/libs/utils/format";
import { CrmPage, DetailGrid, DetailItem, DetailModal, PageTitle } from "./crmPageUtils";

function userLabel(row: AuditLog) {
  return row.user_detail?.username ?? row.user_detail?.email ?? String(row.user ?? "System");
}

function changesPreview(value: unknown) {
  const text = JSON.stringify(value ?? {});
  return text.length > 120 ? `${text.slice(0, 120)}...` : text;
}

export default function ActivityLogsPage() {
  const [viewing, setViewing] = useState<AuditLog | null>(null);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => auditLogService.list({ page: 1, page_size: 100, ordering: "-created_at" }, { cache: fresh ? "no-store" : "default", signal }),
    [],
    { key: "crm-activity-logs" },
  );

  return (
    <CrmPage>
      <PageTitle
        icon="solar:shield-check-bold-duotone"
        title="Activity Logs"
        description="Audit CRM actions, object changes, previous values, and new values."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        columns={[
          {
            key: "user",
            label: "User",
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{userLabel(row)}</p>
                <p className="text-xs text-muted">{row.user_detail?.email ?? ""}</p>
              </div>
            ),
          },
          { key: "action", label: "Action", render: (row) => formatStatus(row.action), sortable: true },
          { key: "object_type", label: "Object type", render: (row) => formatStatus(row.object_type), sortable: true },
          {
            key: "object",
            label: "Object",
            render: (row) => (
              <div>
                <p className="font-mono text-xs text-muted">{row.object_id}</p>
              </div>
            ),
          },
          { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
          { key: "new_value", label: "New value", render: (row) => changesPreview(row.new_value), className: "max-w-[340px] truncate" },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => (
          <IconButton label="View activity" onClick={() => setViewing(row)}>
            <Icon icon="solar:eye-linear" className="size-4" />
          </IconButton>
        )}
        searchPlaceholder="Search logs"
        searchText={(row) =>
          `${userLabel(row)} ${row.user_detail?.email ?? ""} ${row.action} ${row.object_type} ${row.object_id} ${changesPreview(row.previous_value)} ${changesPreview(row.new_value)}`
        }
        noun="logs"
        minWidth={1120}
        emptyText={error || "No activity logs found."}
      />
      {viewing ? (
        <DetailModal
          title={formatStatus(viewing.action)}
          description={viewing.object_id}
          icon="solar:shield-check-bold-duotone"
          isOpen
          onClose={() => setViewing(null)}
        >
          <DetailGrid>
            <DetailItem label="User" value={userLabel(viewing)} />
            <DetailItem label="User email" value={viewing.user_detail?.email} />
            <DetailItem label="Action" value={formatStatus(viewing.action)} />
            <DetailItem label="Object type" value={formatStatus(viewing.object_type)} />
            <DetailItem label="Object ID" value={viewing.object_id} />
            <DetailItem label="Created" value={formatDateTime(viewing.created_at)} />
            <DetailItem label="Previous value" value={<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(viewing.previous_value ?? {}, null, 2)}</pre>} full />
            <DetailItem label="New value" value={<pre className="whitespace-pre-wrap text-xs">{JSON.stringify(viewing.new_value ?? {}, null, 2)}</pre>} full />
          </DetailGrid>
        </DetailModal>
      ) : null}
    </CrmPage>
  );
}
