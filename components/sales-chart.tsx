"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataService } from "@/lib/data-service"

interface SalesChartProps {
  className?: string
}

export function SalesChart({ className }: SalesChartProps) {
  const [activeTab, setActiveTab] = useState("weekly")
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSalesData() {
      setIsLoading(true)
      setError(null)
      try {
        // In a real app, you would fetch different data based on the active tab
        // For now, we'll just simulate some data
        const sales = await dataService.getSales()

        // Generate some sample data based on real sales
        const sampleData = generateSampleData(sales, activeTab)
        setChartData(sampleData)
      } catch (err) {
        console.error("Error fetching sales data for chart:", err)
        setError("Failed to load chart data. Using sample data instead.")
        // Fallback to sample data
        setChartData(getFallbackData(activeTab))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSalesData()
  }, [activeTab])

  // Generate sample data based on real sales
  const generateSampleData = (sales: any[], period: string) => {
    if (!sales || sales.length === 0) {
      return getFallbackData(period)
    }

    // In a real app, you would aggregate the sales data by date
    // For now, we'll just return fallback data
    return getFallbackData(period)
  }

  // Fallback data if no sales data is available
  const getFallbackData = (period: string) => {
    if (period === "weekly") {
      return [
        { name: "Mon", total: 4000 },
        { name: "Tue", total: 3000 },
        { name: "Wed", total: 2000 },
        { name: "Thu", total: 2780 },
        { name: "Fri", total: 1890 },
        { name: "Sat", total: 2390 },
        { name: "Sun", total: 3490 },
      ]
    } else if (period === "monthly") {
      return [
        { name: "Jan", total: 10400 },
        { name: "Feb", total: 14500 },
        { name: "Mar", total: 12000 },
        { name: "Apr", total: 10780 },
        { name: "May", total: 9890 },
        { name: "Jun", total: 11390 },
        { name: "Jul", total: 14490 },
        { name: "Aug", total: 15000 },
        { name: "Sep", total: 12500 },
        { name: "Oct", total: 11000 },
        { name: "Nov", total: 13230 },
        { name: "Dec", total: 16000 },
      ]
    } else {
      return [
        { name: "2020", total: 120000 },
        { name: "2021", total: 150000 },
        { name: "2022", total: 170000 },
        { name: "2023", total: 180000 },
        { name: "2024", total: 110000 },
      ]
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
        <CardDescription>View your sales performance over time.</CardDescription>
        <Tabs defaultValue="weekly" value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          ) : (
            <>
              {error && <div className="mb-4 text-sm text-amber-600 dark:text-amber-400">{error}</div>}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `₦${value.toLocaleString()}`} width={80} />
                  <Tooltip
                    formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
