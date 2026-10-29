import * as React from "react"
import { cn } from "cn"
import { isRequiredPersistenceLabel } from "@/lib/persistenceFieldLabels"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  const isRequired = isRequiredPersistenceLabel(props.htmlFor);

  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        isRequired && "gap-1",
        className
      )}
      {...props}
    >
      {props.children}
      {isRequired && (
        <span aria-hidden="true" className="text-destructive">
          *
        </span>
      )}
    </label>
  )
}

export { Label }
