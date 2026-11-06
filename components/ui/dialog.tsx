"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  zIndex?: number;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, zIndex }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  // Keep a stable ref to onOpenChange so the main effect doesn't re-fire
  // when the parent passes a new closure (e.g. FormDialog's inline wrapper).
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChangeRef.current(false);
      }
    };
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);

      // Initial focus: first focusable element, else the wrapper itself.
      const focusInitial = () => {
        const wrapper = contentRef.current;
        if (!wrapper) return;
        const first = wrapper.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        (first ?? wrapper).focus({ preventScroll: true });
      };
      // Wait a frame so mounted children (forms, inputs) are present.
      const raf = requestAnimationFrame(focusInitial);

      return () => {
        cancelAnimationFrame(raf);
      };
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Restore focus to the trigger when the dialog closes/unmounts.
  React.useEffect(() => {
    if (open) return;
    const prev = previouslyFocusedRef.current;
    if (prev && document.contains(prev)) {
      prev.focus({ preventScroll: true });
    }
    previouslyFocusedRef.current = null;
  }, [open]);

  // Tab cycle trap
  const handleTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const wrapper = contentRef.current;
    if (!wrapper) return;
    const focusables = Array.from(
      wrapper.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
      e.preventDefault();
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (active === first || !wrapper.contains(active)) {
        e.preventDefault();
        last.focus({ preventScroll: true });
      }
    } else if (active === last || !wrapper.contains(active)) {
      e.preventDefault();
      first.focus({ preventScroll: true });
    }
  };

  if (!open) return null;

  return (
    <div
      className={cn("fixed inset-0 flex items-center justify-center", !zIndex && "z-50")}
      style={zIndex ? { zIndex } : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />
      {/* Content wrapper */}
      <div
        ref={contentRef}
        role="presentation"
        tabIndex={-1}
        onKeyDown={handleTabKey}
        className="relative z-10 w-full max-w-3xl p-4 flex justify-center outline-none"
      >
        {children}
      </div>
    </div>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }
>(({ className, children, onClose, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative w-full rounded-xl border bg-background p-6 shadow-2xl transition-all duration-200",
      className,
    )}
    {...props}
  >
    {children}
    {onClose && (
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    )}
  </div>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
      className,
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className,
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
