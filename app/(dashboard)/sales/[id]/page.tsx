"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react"

import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function SaleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [sale, setSale] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSaleDetails() {
      setIsLoading(true)
      try {
        const data = await dataService.getSale(params.id)
        setSale(data)
      } catch (error) {
        console.error("Error fetching sale details:", error)
        toast({
          title: "Error loading sale",
          description: "There was a problem loading the sale details.",
          variant: "destructive",
        })
        router.push("/sales")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSaleDetails()
  }, [params.id, router])

  const handlePrint = () => {
    router.push(`/sales/${params.id}/receipt?print=true`)
  }

  const handleDownload = () => {
    router.push(`/sales/${params.id}/receipt?download=true`)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading sale details...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!sale) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Sale Not Found" text="The requested sale could not be found.">
          <Button variant="outline" onClick={() => router.push("/sales")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
        </DashboardHeader>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading={`Sale #${params.id.substring(0, 8)}`} text="View sale details and information.">
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/sales")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sales
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Basic details about this sale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sale ID</p>
                <p>{sale.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{format(new Date(sale.date), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge
                  variant={
                    sale.status === "completed" ? "success" : sale.status === "pending" ? "warning" : "destructive"
                  }
                  className="mt-1"
                >
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p>
                  {sale.payment_method
                    ? sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)
                    : "Not specified"}
                </p>
              </div>
            </div>

            {sale.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-1">{sale.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Details about the customer who made this purchase.</CardDescription>
          </CardHeader>
          <CardContent>
            {sale.customer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{sale.customer.name}</p>
                </div>
                {sale.customer.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{sale.customer.email}</p>
                  </div>
                )}
                {sale.customer.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{sale.customer.phone}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No customer information available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Items Purchased</CardTitle>
            <CardDescription>Products included in this sale.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-2 text-left font-medium">Product</th>
                    <th className="p-2 text-right font-medium">Price</th>
                    <th className="p-2 text-right font-medium">Quantity</th>
                    <th className="p-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items && sale.items.length > 0 ? (
                    sale.items.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">{item.product?.name || "Unknown Product"}</td>
                        <td className="p-2 text-right">
                          ₦
                          {item.price.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">
                          ₦
                          {item.total.toLocaleString("en-NG", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No items found for this sale.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="p-2 text-right font-medium">
                      Subtotal:
                    </td>
                    <td className="p-2 text-right font-medium">
                      ₦
                      {sale.total.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="p-2 text-right font-medium">
                      Tax:
                    </td>
                    <td className="p-2 text-right font-medium">
                      ₦
                      {sale.tax.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                  <tr className="bg-muted/50">
                    <td colSpan={3} className="p-2 text-right font-bold">
                      Total:
                    </td>
                    <td className="p-2 text-right font-bold">
                      ₦
                      {(sale.total + sale.tax).toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}
