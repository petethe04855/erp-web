import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

function PopoverTrigger({ className, ...props }: PopoverPrimitive.Trigger.Props) {
  return (
    <PopoverPrimitive.Trigger
      className={cn(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className
      )}
      {...props}
    />
  )
}

interface PopoverContentProps extends PopoverPrimitive.Popup.Props {
  align?: 'start' | 'center' | 'end'
}

function PopoverContent({ className, align = 'center', ...props }: PopoverContentProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner sideOffset={4} align={align} className="z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none bg-white dark:bg-zinc-950",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
