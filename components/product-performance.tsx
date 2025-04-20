"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProductPerformance() {
  const [isLoading, setIsLoading] = useState(true)
  const [productData, setProductData] = useState<any[]>([])
  const [viewMode, setViewMode] = useState("revenue")

  useEffect(() => {
    fetchProductData()
  }, [])

  const fetchProductData = async () => {
    setIsLoading(true)
    try {
      // Fetch sales data
      const sales = await dataService.getSales()

      // Process product data
      const processedData = processProductData(sales)
      setProductData(processedData)
    } catch (error) {
      console.error("Error fetching product data:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      .slice(0, 10) // Top 10 products
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
      <div className="flex h-[300px] items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading product data...</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Performance</CardTitle>
        <CardDescription>Analysis of your top-selling products</CardDescription>
        <Tabs defaultValue="revenue" value={viewMode} onValueChange={setViewMode} className="mt-2">
          <TabsList>
            <TabsTrigger value="revenue">By Revenue</TabsTrigger>
            <TabsTrigger value="quantity">By Quantity</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => (viewMode === "revenue" ? formatCurrency(Number(value)) : `${value} units`)}
              />
              <Legend />
              <Bar dataKey={viewMode} fill="#8884d8" name={viewMode === "revenue" ? "Revenue" : "Quantity Sold"} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
