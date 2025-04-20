import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface RecentSalesProps {
  className?: string
  sales?: any[]
}

export function RecentSales({ className, sales = [] }: RecentSalesProps) {
  // Function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>Your most recent sales transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
            <p>No sales recorded yet.</p>
            <p className="text-sm mt-1">Add your first sale to see it here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {sale.customer ? getInitials(sale.customer.name) : "NA"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sale.customer ? sale.customer.name : "Anonymous Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(sale.date), { addSuffix: true })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ₦
                    {sale.total.toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sale.items?.length || 0} {sale.items?.length === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
