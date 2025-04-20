"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Loader2, BarChart3 } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { RecentSales } from "@/components/recent-sales"
import { SalesChart } from "@/components/sales-chart"
import { SalesSummary } from "@/components/sales-summary"
import { ProductPerformance } from "@/components/product-performance"
import { toast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    salesCount: 0,
    customersCount: 0,
    productsCount: 0,
    averageSale: 0,
  })
  const [recentSales, setRecentSales] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch dashboard summary data
        const data = await dataService.getDashboardData()
        setDashboardData(data)

        // Fetch recent sales
        const sales = await dataService.getSales()
        setRecentSales(sales.slice(0, 5)) // Get only the 5 most recent sales
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error loading dashboard",
          description: "There was a problem loading your dashboard data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Track your sales and income at a glance.">
        <div className="flex space-x-2">
          <Link href="/sales/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Sale
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SalesSummary
          title="Total Revenue"
          value={`₦${dashboardData.totalRevenue.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description={dashboardData.totalRevenue > 0 ? `From ${dashboardData.salesCount} sales` : "Start adding sales"}
          trend={dashboardData.totalRevenue > 0 ? "up" : "neutral"}
        />
        <SalesSummary
          title="Sales"
          value={dashboardData.salesCount.toString()}
          description={dashboardData.salesCount > 0 ? "Total transactions" : "Start adding sales"}
          trend={dashboardData.salesCount > 0 ? "up" : "neutral"}
        />
        <SalesSummary
          title="Average Sale"
          value={`₦${dashboardData.averageSale.toLocaleString("en-NG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          description={dashboardData.averageSale > 0 ? "Per transaction" : "Start adding sales"}
          trend={dashboardData.averageSale > 0 ? "up" : "neutral"}
        />
        <SalesSummary
          title="Active Customers"
          value={dashboardData.customersCount.toString()}
          description={dashboardData.customersCount > 0 ? "Registered customers" : "Start adding customers"}
          trend={dashboardData.customersCount > 0 ? "up" : "neutral"}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <SalesChart className="col-span-4" />
        <RecentSales className="col-span-3" sales={recentSales} />
      </div>
      <div className="mt-4">
        <ProductPerformance />
      </div>
    </DashboardShell>
  )
}
