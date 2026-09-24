"use client";

import { useToastStore, ToastItemData, ConfirmDialogData, toast } from "@/store/toastStore";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Trash2 } from "lucide-react";

export { toast };
export const useToast = () => toast;

const toastToneConfig = {
  success: {
    icon: CheckCircle2,
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    borderClass: "border-emerald-500/20",
  },
  error: {
    icon: AlertCircle,
    badgeClass: "border-red-500/20 bg-red-500/10 text-red-400",
    borderClass: "border-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    borderClass: "border-amber-500/20",
  },
  info: {
    icon: Info,
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    borderClass: "border-blue-500/20",
  },
};

const alertToneConfig = {
  danger: {
    icon: Trash2,
    badgeClass: "border-red-500/20 bg-red-500/10 text-red-400",
    btnClass: "bg-red-600 hover:bg-red-500 text-white",
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    btnClass: "bg-amber-600 hover:bg-amber-500 text-white",
  },
  info: {
    icon: Info,
    badgeClass: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    btnClass: "bg-blue-600 hover:bg-blue-500 text-white",
  },
  success: {
    icon: CheckCircle2,
    badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
  },
};

const ToastItem = ({
  item,
  onClose,
}: {
  item: ToastItemData;
  onClose: (id: string) => void;
}) => {
  const tone = toastToneConfig[item.type] || toastToneConfig.info;
  const Icon = tone.icon;

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-neutral-950/95 p-3.5 shadow-2xl backdrop-blur-sm ${
        tone.borderClass
      } ${
        item.isExiting
          ? "translate-y-4 scale-95 opacity-0 transition-all duration-200"
          : "animate-toast-slide-up"
      }`}
      role="status"
    >
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border ${tone.badgeClass}`}
      >
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-white">{item.title}</p>
        {item.message && (
          <p className="mt-0.5 text-xs text-neutral-400 leading-relaxed">
            {item.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onClose(item.id)}
        className="rounded-sm p-1 text-neutral-500 transition hover:bg-neutral-900 hover:text-white"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const AlertDialogItem = ({
  dialog,
  onResolve,
}: {
  dialog: ConfirmDialogData;
  onResolve: (id: string, result: boolean) => void;
}) => {
  const tone = alertToneConfig[dialog.type] || alertToneConfig.info;
  const Icon = tone.icon;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => !dialog.isAlertOnly && onResolve(dialog.id, false)}
        className={`fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200 ${
          dialog.isExiting ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Dialog Card */}
      <div
        className={`relative z-10 w-full max-w-md rounded-md border border-neutral-800 bg-neutral-950 p-6 shadow-2xl transition-all duration-200 ${
          dialog.isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${tone.badgeClass}`}
          >
            <Icon size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white">{dialog.title}</h3>
            {dialog.message && (
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-400">
                {dialog.message}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          {!dialog.isAlertOnly && (
            <button
              type="button"
              onClick={() => onResolve(dialog.id, false)}
              className="rounded-sm border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white"
            >
              {dialog.cancelText || "ยกเลิก"}
            </button>
          )}

          <button
            type="button"
            onClick={() => onResolve(dialog.id, true)}
            className={`rounded-sm px-5 py-2 text-xs font-semibold transition ${tone.btnClass}`}
            autoFocus
          >
            {dialog.confirmText || "ยืนยัน"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts, dialogs, removeToast, resolveDialog } = useToastStore();

  return (
    <>
      {/* Normal Toasts (Bottom-Center) */}
      <div
        className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col-reverse items-center gap-2.5"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onClose={removeToast} />
        ))}
      </div>

      {/* Alert Shown / Confirm Modals (Centered) */}
      {dialogs.map((dialog) => (
        <AlertDialogItem
          key={dialog.id}
          dialog={dialog}
          onResolve={resolveDialog}
        />
      ))}
    </>
  );
}
