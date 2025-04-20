"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, subDays, startOfMonth, eachDayOfInterval } from "date-fns"
import { Loader2 } from "lucide-react"

import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30days")
  const [salesData, setSalesData] = useState<any[]>([])
  const [productData, setProductData] = useState<any[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([])
  const [customerData, setCustomerData] = useState<any[]>([])
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    salesCount: 0,
    averageSale: 0,
    growthRate: 0,
  })

  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch all sales data
      const sales = await dataService.getSales()

      // Filter sales based on selected time range
      const filteredSales = filterSalesByTimeRange(sales, timeRange)

      // Process sales data for different charts
      const processedSalesData = processSalesData(filteredSales)
      setSalesData(processedSalesData)

      // Process product data
      const processedProductData = processProductData(filteredSales)
      setProductData(processedProductData)

      // Process payment method data
      const processedPaymentData = processPaymentMethodData(filteredSales)
      setPaymentMethodData(processedPaymentData)

      // Process customer data
      const processedCustomerData = processCustomerData(filteredSales)
      setCustomerData(processedCustomerData)

      // Calculate key metrics
      const calculatedMetrics = calculateMetrics(filteredSales, timeRange, sales)
      setMetrics(calculatedMetrics)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      setError(error instanceof Error ? error : new Error("Failed to fetch analytics data"))
    } finally {
      setIsLoading(false)
    }
  }

  // Filter sales based on time range
  const filterSalesByTimeRange = (sales: any[], range: string) => {
    const now = new Date()
    let startDate: Date

    switch (range) {
      case "7days":
        startDate = subDays(now, 7)
        break
      case "30days":
        startDate = subDays(now, 30)
        break
      case "90days":
        startDate = subDays(now, 90)
        break
      case "thisMonth":
        startDate = startOfMonth(now)
        break
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(now), 1)
        startDate = startOfMonth(lastMonth)
        break
      default:
        startDate = subDays(now, 30)
    }

    return sales.filter((sale) => new Date(sale.date) >= startDate)
  }

  // Process sales data for time series chart
  const processSalesData = (sales: any[]) => {
    // For demo purposes, we'll create a daily sales chart for the last 30 days
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)

    // Create an array of all days in the range
    const dateRange = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: now,
    })

    // Initialize data with 0 sales for each day
    const dailySales = dateRange.map((date) => ({
      date: format(date, "MMM dd"),
      revenue: 0,
      orders: 0,
    }))

    // Aggregate sales by day
    sales.forEach((sale) => {
      const saleDate = format(new Date(sale.date), "MMM dd")
      const dayData = dailySales.find((day) => day.date === saleDate)

      if (dayData) {
        dayData.revenue += sale.total
        dayData.orders += 1
      }
    })

    return dailySales
  }

  // Process product data for product performance chart
  const processProductData = (sales: any[]) => {
    const productMap = new Map()

    // Aggregate sales by product
    sales.forEach((sale) => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item: any) => {
          if (item.product) {
            const productName = item.product.name
            if (productMap.has(productName)) {
              const product = productMap.get(productName)
              product.quantity += item.quantity
              product.revenue += item.total
            } else {
              productMap.set(productName, {
                name: productName,
                quantity: item.quantity,
                revenue: item.total,
              })
            }
          }
        })
      }
    })

    // Convert map to array and sort by revenue
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5) // Top 5 products
  }

  // Process payment method data for pie chart
  const processPaymentMethodData = (sales: any[]) => {
    const paymentMap = new Map()

    // Aggregate sales by payment method
    sales.forEach((sale) => {
      const method = sale.payment_method || "Unknown"
      if (paymentMap.has(method)) {
        const data = paymentMap.get(method)
        data.value += sale.total
        data.count += 1
      } else {
        paymentMap.set(method, {
          name: method.charAt(0).toUpperCase() + method.slice(1),
          value: sale.total,
          count: 1,
        })
      }
    })

    // Convert map to array
    return Array.from(paymentMap.values())
  }

  // Process customer data for customer insights
  const processCustomerData = (sales: any[]) => {
    const customerMap = new Map()

    // Aggregate sales by customer
    sales.forEach((sale) => {
      if (sale.customer) {
        const customerId = sale.customer.id
        const customerName = sale.customer.name

        if (customerMap.has(customerId)) {
          const customer = customerMap.get(customerId)
          customer.purchases += 1
          customer.spent += sale.total
        } else {
          customerMap.set(customerId, {
            name: customerName,
            purchases: 1,
            spent: sale.total,
          })
        }
      }
    })

    // Convert map to array and sort by amount spent
    return Array.from(customerMap.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5) // Top 5 customers
  }

  // Calculate key metrics
  const calculateMetrics = (filteredSales: any[], timeRange: string, allSales: any[]) => {
    // Calculate total revenue
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)

    // Calculate sales count
    const salesCount = filteredSales.length

    // Calculate average sale
    const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0

    // Calculate growth rate (comparing with previous period)
    let growthRate = 0
    if (timeRange === "30days") {
      const currentPeriodRevenue = totalRevenue

      // Get previous 30 days
      const now = new Date()
      const thirtyDaysAgo = subDays(now, 30)
      const sixtyDaysAgo = subDays(now, 60)

      const previousPeriodSales = allSales.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= sixtyDaysAgo && saleDate < thirtyDaysAgo
      })

      const previousPeriodRevenue = previousPeriodSales.reduce((sum, sale) => sum + sale.total, 0)

      if (previousPeriodRevenue > 0) {
        growthRate = ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      }
    }

    return {
      totalRevenue,
      salesCount,
      averageSale,
      growthRate,
    }
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p>Error loading analytics: {error.message}</p>
          <p className="text-sm mt-2">Try refreshing the page or check your connection.</p>
        </div>

        {/* Fallback metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦0.00</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Count</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦0.00</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">No data available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="thisMonth">This month</SelectItem>
            <SelectItem value="lastMonth">Last month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.growthRate > 0 ? "+" : ""}
              {metrics.growthRate.toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.salesCount}</div>
            <p className="text-xs text-muted-foreground">Total transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.averageSale)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.3%</div>
            <p className="text-xs text-muted-foreground">+2.1% from previous period</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trend Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Daily revenue and order count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
                orders: {
                  label: "Orders",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" stroke="var(--color-revenue)" />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--color-orders)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    activeDot={{ r: 8 }}
                    name="Revenue (₦)"
                  />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="var(--color-orders)" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Product Performance and Payment Methods */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of sales by payment method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Customers with highest spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Customer</th>
                  <th className="py-2 text-right font-medium">Purchases</th>
                  <th className="py-2 text-right font-medium">Total Spent</th>
                  <th className="py-2 text-right font-medium">Average Order</th>
                </tr>
              </thead>
              <tbody>
                {customerData.map((customer, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{customer.name}</td>
                    <td className="py-2 text-right">{customer.purchases}</td>
                    <td className="py-2 text-right">{formatCurrency(customer.spent)}</td>
                    <td className="py-2 text-right">{formatCurrency(customer.spent / customer.purchases)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
