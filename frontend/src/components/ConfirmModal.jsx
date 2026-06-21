import { Trash2, X } from "lucide-react";
import { useEffect } from "react";

export default function ConfirmModal({ isOpen, groupName, onConfirm, onCancel }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel} aria-label="Cancel">
          <X size={18} />
        </button>

        <div className="confirm-modal-icon">
          <Trash2 size={28} />
        </div>

        <h2 id="confirm-title" className="confirm-modal-title">Delete group?</h2>
        <p className="confirm-modal-body">
          <strong>&ldquo;{groupName}&rdquo;</strong> and all of its expenses and settlements will be permanently deleted. This cannot be undone.
        </p>

        <div className="confirm-modal-actions">
          <button className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>
            <Trash2 size={16} />
            Delete group
          </button>
        </div>
      </div>
    </div>
  );
}
