import { useState, type FormEvent, type ReactNode } from "react";
import { Alert, Button, CardBody, CardHeader, ConfirmDialog, Icon, IconButton, Modal, PageCard } from "@/components/ui";
import { readError } from "@/libs/utils/errors";

export function PageTitle({
  icon,
  title,
  description,
  onRefresh,
  onCreate,
  createLabel,
  isRefreshing,
}: {
  icon: Parameters<typeof CardHeader>[0]["icon"];
  title: string;
  description: string;
  onRefresh: () => void;
  onCreate: () => void;
  createLabel: string;
  isRefreshing?: boolean;
}) {
  return (
    <CardHeader icon={icon} title={title} description={description}>
      <Button variant="ghost" onClick={onRefresh} isLoading={isRefreshing} loadingText="Refreshing...">
        <Icon icon="solar:refresh-linear" className="size-4" />
        Refresh
      </Button>
      <Button onClick={onCreate}>
        <Icon icon="solar:add-circle-linear" className="size-4" />
        {createLabel}
      </Button>
    </CardHeader>
  );
}

export function RowButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Edit" onClick={onEdit}>
        <Icon icon="solar:pen-linear" className="size-4" />
      </IconButton>
      <IconButton label="Delete" variant="danger" onClick={onDelete}>
        <Icon icon="solar:trash-bin-trash-linear" className="size-4" />
      </IconButton>
    </div>
  );
}

export function DetailModal({
  title,
  description,
  icon,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  icon: Parameters<typeof Modal>[0]["icon"];
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal isOpen={isOpen} title={title} description={description} icon={icon} onClose={onClose} size="lg">
      <div className="grid gap-3">{children}</div>
    </Modal>
  );
}

export function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

export function DetailItem({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <p className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</p>
      <div className="mt-1 rounded-md border border-line bg-soft px-3 py-2 text-sm font-semibold text-ink">{value || "N/A"}</div>
    </div>
  );
}

export function FormModal<T>({
  title,
  description,
  icon,
  isOpen,
  initial,
  onClose,
  onSubmit,
  children,
}: {
  title: string;
  description: string;
  icon: Parameters<typeof Modal>[0]["icon"];
  isOpen: boolean;
  initial: T;
  onClose: () => void;
  onSubmit: (value: T) => Promise<void>;
  children: (value: T, setValue: (next: Partial<T>) => void) => ReactNode;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function patch(next: Partial<T>) {
    setValue((current) => ({ ...current, ...next }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSubmit(value);
      onClose();
    } catch (err) {
      setError(readError(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      description={description}
      icon={icon}
      size="lg"
      onClose={onClose}
      isBusy={isSaving}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="crm-form" isLoading={isSaving} loadingText="Saving...">
            Save
          </Button>
        </>
      }
    >
      <form id="crm-form" onSubmit={handleSubmit} className="grid gap-4">
        {children(value, patch)}
        <Alert>{error}</Alert>
      </form>
    </Modal>
  );
}

export function DeleteDialog({
  label,
  isOpen,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  label: string;
  isOpen: boolean;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      title={`Delete ${label}?`}
      message={`This will permanently remove ${label} from Ethical Den CRM.`}
      isLoading={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

export function CrmPage({ children }: { children: ReactNode }) {
  return (
    <PageCard>
      <CardBody className="gap-0 p-0">{children}</CardBody>
    </PageCard>
  );
}

export function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromInputDateTime(value: string) {
  return value ? new Date(value).toISOString() : null;
}
