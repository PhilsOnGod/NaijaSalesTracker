import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SalesSummaryProps {
  title: string
  value: string
  description?: string
  trend?: "up" | "down" | "neutral"
  className?: string
}

export function SalesSummary({ title, value, description, trend = "neutral", className }: SalesSummaryProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {trend === "up" && <ArrowUp className="h-4 w-4 text-emerald-500" />}
        {trend === "down" && <ArrowDown className="h-4 w-4 text-rose-500" />}
        {trend === "neutral" && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}
