"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet(props: Dialog.Root.Props) {
  return <Dialog.Root {...props} />
}

function SheetContent({ className, children, ...props }: Dialog.Popup.Props) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 z-[100] bg-black/40 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <Dialog.Viewport className="fixed inset-0 z-[101] flex justify-end">
        <Dialog.Popup
          data-slot="sheet-content"
          className={cn(
            "flex h-full w-[min(520px,100vw)] flex-col border-l bg-card text-card-foreground shadow-2xl outline-none transition-transform duration-200",
            "data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
            className,
          )}
          {...props}
        >
          {children}
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex shrink-0 items-start justify-between gap-4 border-b p-6", className)} {...props} />
}

function SheetTitle({ className, ...props }: Dialog.Title.Props) {
  return <Dialog.Title className={cn("text-base font-semibold text-foreground", className)} {...props} />
}

function SheetDescription({ className, ...props }: Dialog.Description.Props) {
  return <Dialog.Description className={cn("mt-1 text-xs text-muted-foreground", className)} {...props} />
}

function SheetClose({ className, ...props }: Dialog.Close.Props) {
  return (
    <Dialog.Close
      aria-label="ปิด"
      className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40", className)}
      {...props}
    >
      <X className="size-4" />
    </Dialog.Close>
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto p-6", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shrink-0 border-t p-4 px-6", className)} {...props} />
}

export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose, SheetBody, SheetFooter }
