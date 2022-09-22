import classNames from "classnames";
import create from "zustand";

type ToastType = "success" | "error" | "info";

function generateId() {
  return Math.floor((Math.random() * 1_000) % 1_000);
}

interface ToastStore {
  toasts: { type?: ToastType; message: string; id: number }[];
  add: (toast: string, type?: ToastType) => void;
}

const TOAST_MAX_DISPLAY_TIME_IN_MS = 10_000;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  add(toast, type) {
    const id = generateId();
    set((state) => ({
      ...state,
      toasts: [...state.toasts, { type, message: toast, id }],
    }));

    setTimeout(() => {
      set((state) => ({
        ...state,
        toasts: state.toasts.filter((s) => s.id !== id),
      }));
    }, TOAST_MAX_DISPLAY_TIME_IN_MS);
  },
}));

export function useToast() {
  const add = useToastStore((s) => s.add);
  return { add };
}

export default function Toast() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="toast toast-center toast-bottom z-[999]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={classNames(
            "text-xs alert animate-pulse md:text-sm w-[min(100vw,400px)]",
            {
              "alert-success": toast.type === "success",
              "alert-error": toast.type === "error",
              "alert-info": toast.type === "info",
            }
          )}
        >
          <div>
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}