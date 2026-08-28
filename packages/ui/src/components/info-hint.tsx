"use client"

import * as React from "react"
import { Info } from "lucide-react"

import { cn } from "@repo/ui/lib/utils"
import { Button } from "@repo/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@repo/ui/components/popover"

function InfoHint({
  label,
  title,
  children,
  align = "start",
  side = "top",
  className,
}: {
  /** Accessible name for the trigger button. */
  label: string
  title?: string
  children: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn("text-muted-foreground", className)}
          aria-label={label}
        >
          <Info />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className="w-72">
        <PopoverHeader>
          {title ? <PopoverTitle>{title}</PopoverTitle> : null}
          <div className="text-muted-foreground">{children}</div>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export { InfoHint }
