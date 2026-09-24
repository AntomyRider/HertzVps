import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";
export type AlertType = "danger" | "warning" | "info" | "success";

export interface ToastItemData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isExiting?: boolean;
}

export interface ConfirmDialogData {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isAlertOnly?: boolean;
  isExiting?: boolean;
  onResolve: (result: boolean) => void;
}

interface ToastState {
  toasts: ToastItemData[];
  dialogs: ConfirmDialogData[];

  // Actions for normal toasts
  addToast: (options: {
    type?: ToastType;
    title: string;
    message?: string;
    duration?: number;
  }) => string;
  removeToast: (id: string) => void;

  // Actions for alert shown / confirm
  addConfirm: (options: {
    title: string;
    message?: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
  }) => Promise<boolean>;
  addAlert: (options: {
    title: string;
    message?: string;
    type?: AlertType;
    buttonText?: string;
  }) => Promise<void>;
  resolveDialog: (id: string, result: boolean) => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  dialogs: [],

  addToast: ({ type = "info", title, message, duration = 3500 }) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    const newToast: ToastItemData = {
      id,
      type,
      title,
      message,
      duration,
      isExiting: false,
    };

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 5),
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 200);
  },

  addConfirm: ({
    title,
    message,
    type = "danger",
    confirmText = "ยืนยัน",
    cancelText = "ยกเลิก",
  }) => {
    return new Promise<boolean>((resolve) => {
      const id = `confirm-${++toastIdCounter}-${Date.now()}`;
      const dialog: ConfirmDialogData = {
        id,
        type,
        title,
        message,
        confirmText,
        cancelText,
        isAlertOnly: false,
        isExiting: false,
        onResolve: (result: boolean) => {
          resolve(result);
        },
      };

      set((state) => ({
        dialogs: [...state.dialogs, dialog],
      }));
    });
  },

  addAlert: ({
    title,
    message,
    type = "info",
    buttonText = "เข้าใจแล้ว",
  }) => {
    return new Promise<void>((resolve) => {
      const id = `alert-${++toastIdCounter}-${Date.now()}`;
      const dialog: ConfirmDialogData = {
        id,
        type,
        title,
        message,
        confirmText: buttonText,
        isAlertOnly: true,
        isExiting: false,
        onResolve: () => {
          resolve();
        },
      };

      set((state) => ({
        dialogs: [...state.dialogs, dialog],
      }));
    });
  },

  resolveDialog: (id: string, result: boolean) => {
    const dialog = get().dialogs.find((d) => d.id === id);
    if (!dialog) return;

    set((state) => ({
      dialogs: state.dialogs.map((d) => (d.id === id ? { ...d, isExiting: true } : d)),
    }));

    setTimeout(() => {
      dialog.onResolve(result);
      set((state) => ({
        dialogs: state.dialogs.filter((d) => d.id !== id),
      }));
    }, 180);
  },
}));

// Standalone toast helper callable from anywhere
export const toast = {
  success: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", title, message, duration }),
  error: (title: string, message?: string, duration = 4500) =>
    useToastStore.getState().addToast({ type: "error", title, message, duration }),
  warning: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", title, message, duration }),
  info: (title: string, message?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", title, message, duration }),
  confirm: (options: {
    title: string;
    message?: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
  }) => useToastStore.getState().addConfirm(options),
  alert: (options: {
    title: string;
    message?: string;
    type?: AlertType;
    buttonText?: string;
  }) => useToastStore.getState().addAlert(options),
};
