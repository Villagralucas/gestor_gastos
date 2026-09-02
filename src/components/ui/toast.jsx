"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastContext = React.createContext(null);

const variants = {
  default: { icon: Info, tone: "text-muted-foreground" },
  success: { icon: CircleCheck, tone: "text-income" },
  error: { icon: CircleAlert, tone: "text-expense" },
};

/**
 * Avisos cortos que aparecen abajo a la derecha y se van solos.
 *
 * Va una sola vez, envolviendo la app. Para tirar un aviso desde cualquier
 * componente cliente:
 *
 *   const { toast } = useToast();
 *   toast({ variant: "error", title: "No se pudo guardar" });
 */
export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = React.useState([]);

  const dismiss = React.useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = React.useCallback((options) => {
    const entry = typeof options === "string" ? { title: options } : options;
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, variant: "default", ...entry }]);

    return id;
  }, []);

  const value = React.useMemo(() => ({ dismiss, toast }), [dismiss, toast]);

  return (
    <ToastContext.Provider value={value}>
      <ToastPrimitive.Provider duration={duration} swipeDirection="right">
        {children}

        {toasts.map(({ id, ...item }) => (
          <ToastItem key={id} {...item} onDismiss={() => dismiss(id)} />
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-100 m-0 flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast tiene que usarse adentro de <ToastProvider>.");
  }

  return context;
}

function ToastItem({ description, duration, onDismiss, title, variant }) {
  const [open, setOpen] = React.useState(true);
  const { icon: Icon, tone } = variants[variant] ?? variants.default;

  return (
    <ToastPrimitive.Root
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 rounded-lg border bg-popover p-4 pr-10 text-popover-foreground shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
        "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0",
      )}
      duration={duration}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
          // Lo sacamos de la lista recien cuando termino de salir.
          window.setTimeout(onDismiss, 200);
        }
      }}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", tone)} aria-hidden="true" />

      <div className="grid gap-1">
        {title ? (
          <ToastPrimitive.Title className="text-sm font-medium">
            {title}
          </ToastPrimitive.Title>
        ) : null}
        {description ? (
          <ToastPrimitive.Description className="text-sm text-muted-foreground">
            {description}
          </ToastPrimitive.Description>
        ) : null}
      </div>

      <ToastPrimitive.Close
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Cerrar aviso"
      >
        <X className="size-4" aria-hidden="true" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}
