import { useState } from "react";
import { DataTable, Field, FormGrid, Input } from "@/components/ui";
import type { CrmEmployee, CrmEmployeePayload } from "@/libs/api/types";
import { useAsyncData } from "@/libs/hooks";
import { employeeService } from "@/libs/services";
import { formatDateTime } from "@/libs/utils/format";
import { CrmPage, DeleteDialog, FormModal, PageTitle, RowButtons } from "./crmPageUtils";

const emptyEmployee: CrmEmployeePayload = { email: "", name: "", contact_number: "", whatsapp: "", address: "" };

export default function EmployeesPage() {
  const [editing, setEditing] = useState<CrmEmployee | null>(null);
  const [deleting, setDeleting] = useState<CrmEmployee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, error, isLoading, isRefreshing, reload } = useAsyncData(
    (fresh, signal) => employeeService.list({ page: 1, page_size: 100, ordering: "-created_at" }, { cache: fresh ? "no-store" : "default", signal }),
    [],
    { key: "crm-employees" },
  );

  async function removeEmployee() {
    if (!deleting) return;
    setIsDeleting(true);
    await employeeService.delete(deleting.id).finally(() => setIsDeleting(false));
    setDeleting(null);
    void reload();
  }

  return (
    <CrmPage>
      <PageTitle
        icon="solar:users-group-rounded-bold-duotone"
        title="Employees"
        description="Register team members and keep employee contact records tidy."
        onRefresh={() => void reload()}
        isRefreshing={isRefreshing}
        onCreate={() => setEditing({ id: "", name: "", contact_number: "", whatsapp: "", address: "" })}
        createLabel="New Employee"
      />
      <DataTable
        rows={data?.data ?? []}
        isLoading={isLoading}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", render: (row) => row.user?.email ?? "N/A" },
          { key: "contact_number", label: "Contact" },
          { key: "whatsapp", label: "WhatsApp", render: (row) => row.whatsapp || "N/A" },
          { key: "address", label: "Address", className: "max-w-[240px] truncate" },
          { key: "created_at", label: "Created", render: (row) => formatDateTime(row.created_at), sortable: true },
        ]}
        getRowId={(row) => row.id}
        renderActions={(row) => <RowButtons onEdit={() => setEditing(row)} onDelete={() => setDeleting(row)} />}
        searchPlaceholder="Search employees"
        searchText={(row) => `${row.name} ${row.user?.email ?? ""} ${row.contact_number} ${row.address}`}
        noun="employees"
        emptyText={error || "No employees found."}
      />
      {editing ? (
        <FormModal
          title={editing.id ? "Edit employee" : "Register employee"}
          description={editing.id ? "Update employee record information." : "Default password is 12345678 when left blank."}
          icon="solar:user-plus-bold-duotone"
          isOpen
          initial={editing.id ? { email: editing.user?.email ?? "", name: editing.name, contact_number: editing.contact_number, whatsapp: editing.whatsapp ?? "", address: editing.address } : emptyEmployee}
          onClose={() => setEditing(null)}
          onSubmit={async (payload) => {
            if (editing.id) await employeeService.update(editing.id, payload);
            else await employeeService.create(payload);
            void reload();
          }}
        >
          {(value, setValue) => (
            <FormGrid>
              <Field label="Name">
                <Input value={value.name} onChange={(event) => setValue({ name: event.target.value })} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={value.email} onChange={(event) => setValue({ email: event.target.value })} required />
              </Field>
              <Field label="Contact number">
                <Input value={value.contact_number} onChange={(event) => setValue({ contact_number: event.target.value })} required />
              </Field>
              <Field label="WhatsApp">
                <Input value={value.whatsapp} onChange={(event) => setValue({ whatsapp: event.target.value })} required />
              </Field>
              <Field label="Address" full>
                <Input value={value.address} onChange={(event) => setValue({ address: event.target.value })} required />
              </Field>
            </FormGrid>
          )}
        </FormModal>
      ) : null}
      <DeleteDialog label={deleting?.name ?? "employee"} isOpen={!!deleting} isDeleting={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void removeEmployee()} />
    </CrmPage>
  );
}
