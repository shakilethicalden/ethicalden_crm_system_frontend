import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  /** `danger` (default) for deletes, `primary` for positive actions like "Complete". */
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

/** Small confirmation modal (delete, approve, complete...). */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loadingLabel = "Deleting...",
  isLoading = false,
  tone = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      isBusy={isLoading}
      size="sm"
      icon={tone === "danger" ? "solar:danger-triangle-linear" : "solar:question-circle-linear"}
      iconTone={tone === "danger" ? "danger" : "brand"}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} size="sm" onClick={onConfirm} isLoading={isLoading} loadingText={loadingLabel}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-muted">
        {tone === "danger" ? "You won't be able to revert this. " : ""}
        {message}
      </p>
    </Modal>
  );
}
