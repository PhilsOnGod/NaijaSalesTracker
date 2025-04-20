import type React from "react"
import { cva } from "class-variance-authority"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  className?: string
}

const headerVariants = cva("grid gap-1", {
  variants: {
    hasChildren: {
      true: "mb-6 justify-between items-center sm:flex",
      false: "mb-6",
    },
  },
})

export function DashboardHeader({ heading, text, children, className }: DashboardHeaderProps) {
  return (
    <div className={headerVariants({ hasChildren: !!children, className })}>
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  )
}
