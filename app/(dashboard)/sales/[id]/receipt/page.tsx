"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ArrowLeft, Download, Loader2, Printer } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { toast } from "@/components/ui/use-toast"

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sale, setSale] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [businessSettings, setBusinessSettings] = useState<any | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const [saleData, settingsData] = await Promise.all([
          dataService.getSale(params.id),
          dataService.getBusinessSettings(),
        ])
        setSale(saleData)
        setBusinessSettings(settingsData)

        // Check if we should automatically print or download
        const shouldPrint = searchParams.get("print") === "true"
        const shouldDownload = searchParams.get("download") === "true"

        if (shouldPrint || shouldDownload) {
          // Wait for the receipt to render
          setTimeout(() => {
            if (shouldPrint) {
              handlePrint()
            } else if (shouldDownload) {
              handleDownloadPDF()
            }
          }, 1000)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error loading receipt",
          description: "There was a problem loading the receipt data.",
          variant: "destructive",
        })
        router.push(`/sales/${params.id}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router, searchParams])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`receipt-${params.id.substring(0, 8)}.pdf`)

      toast({
        title: "Receipt downloaded",
        description: "Your receipt has been downloaded as a PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error downloading receipt",
        description: "There was a problem generating the PDF.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading receipt...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!sale) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Receipt Not Found" text="The requested receipt could not be found.">
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
      <div className="print:hidden">
        <DashboardHeader heading="Receipt" text="View and print the receipt for this sale.">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push(`/sales/${params.id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sale
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </DashboardHeader>
      </div>

      <div className="mx-auto max-w-2xl bg-white p-8 shadow-sm print:shadow-none" ref={receiptRef}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">{businessSettings?.business_name || "Nigerian Sales Tracker"}</h1>
          {businessSettings?.address && <p className="text-muted-foreground">{businessSettings.address}</p>}
          {businessSettings?.phone && <p className="text-muted-foreground">Phone: {businessSettings.phone}</p>}
          {businessSettings?.email && <p className="text-muted-foreground">Email: {businessSettings.email}</p>}
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">RECEIPT</h2>
          <p className="text-muted-foreground">Receipt No: {params.id.substring(0, 8)}</p>
          <p className="text-muted-foreground">Date: {format(new Date(sale.date), "PPP")}</p>
        </div>

        {sale.customer && (
          <div className="mb-6">
            <h3 className="font-semibold mb-1">Customer:</h3>
            <p>{sale.customer.name}</p>
            {sale.customer.email && <p>{sale.customer.email}</p>}
            {sale.customer.phone && <p>{sale.customer.phone}</p>}
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Items:</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items && sale.items.length > 0 ? (
                sale.items.map((item: any) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.product?.name || "Unknown Product"}</td>
                    <td className="py-2 text-right">
                      ₦
                      {item.price.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">
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
                  <td colSpan={4} className="py-4 text-center text-muted-foreground">
                    No items found for this sale.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-2 text-right font-medium">
                  Subtotal:
                </td>
                <td className="py-2 text-right font-medium">
                  ₦
                  {sale.total.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 text-right font-medium">
                  Tax:
                </td>
                <td className="py-2 text-right font-medium">
                  ₦
                  {sale.tax.toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
              <tr className="border-t">
                <td colSpan={3} className="py-2 text-right font-bold">
                  Total:
                </td>
                <td className="py-2 text-right font-bold">
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

        {sale.payment_method && (
          <div className="mb-6">
            <p>
              <span className="font-semibold">Payment Method:</span>{" "}
              {sale.payment_method.charAt(0).toUpperCase() + sale.payment_method.slice(1)}
            </p>
          </div>
        )}

        {sale.notes && (
          <div className="mb-6">
            <p className="font-semibold">Notes:</p>
            <p>{sale.notes}</p>
          </div>
        )}

        <div className="text-center mt-8 pt-8 border-t">
          <p className="font-semibold">Thank you for your business!</p>
          {businessSettings?.tax_id && (
            <p className="text-sm text-muted-foreground">Tax ID: {businessSettings.tax_id}</p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            This receipt was generated on {format(new Date(), "PPP 'at' p")}
          </p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root > div > div > main {
            padding: 0 !important;
          }
          [data-ref="receipt"],
          [data-ref="receipt"] * {
            visibility: visible;
          }
          [data-ref="receipt"] {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </DashboardShell>
  )
}
