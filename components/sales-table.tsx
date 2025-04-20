"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ArrowUpDown, Eye, Loader2, MoreHorizontal, Trash } from "lucide-react"

import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export function SalesTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sales, setSales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchSales()
  }, [])

  async function fetchSales() {
    setIsLoading(true)
    try {
      const data = await dataService.getSales()
      setSales(data)
    } catch (error) {
      console.error("Error fetching sales:", error)
      toast({
        title: "Error loading sales",
        description: "There was a problem loading your sales data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleDelete = async () => {
    if (!saleToDelete) return

    setIsDeleting(true)
    try {
      await dataService.deleteSale(saleToDelete)
      setSales(sales.filter((sale) => sale.id !== saleToDelete))
      toast({
        title: "Sale deleted",
        description: "The sale has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast({
        title: "Error deleting sale",
        description: "There was a problem deleting the sale.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setSaleToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setSaleToDelete(id)
    setDeleteDialogOpen(true)
  }

  // Filter and sort sales
  const filteredSales = sales
    .filter((sale) => {
      const matchesSearch =
        searchTerm === "" ||
        (sale.customer?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.items?.some((item: any) => item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || sale.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let valueA, valueB

      if (sortColumn === "date") {
        valueA = new Date(a.date).getTime()
        valueB = new Date(b.date).getTime()
      } else if (sortColumn === "total") {
        valueA = a.total
        valueB = b.total
      } else {
        valueA = a[sortColumn]
        valueB = b[sortColumn]
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Records</CardTitle>
        <CardDescription>Manage your sales history and track customer purchases.</CardDescription>
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex w-full items-center space-x-2 md:w-2/3">
            <Input
              placeholder="Search by customer, product, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading sales data...</p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Date
                    <Button variant="ghost" size="sm" className="ml-1 h-8 p-0" onClick={() => handleSort("date")}>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Amount
                    <Button variant="ghost" size="sm" className="ml-1 h-8 p-0" onClick={() => handleSort("total")}>
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p>No sales records found.</p>
                      <p className="text-sm mt-1">Add your first sale to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id.substring(0, 8)}</TableCell>
                    <TableCell>{sale.customer ? sale.customer.name : "Anonymous Customer"}</TableCell>
                    <TableCell>
                      {sale.items && sale.items.length > 0
                        ? sale.items.map((item: any) => item.product?.name || "Unknown Product").join(", ")
                        : "No products"}
                    </TableCell>
                    <TableCell>{format(new Date(sale.date), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      ₦
                      {sale.total.toLocaleString("en-NG", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sale.status === "completed"
                            ? "success"
                            : sale.status === "pending"
                              ? "warning"
                              : "destructive"
                        }
                      >
                        {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/sales/${sale.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/sales/${sale.id}/receipt`)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-2 h-4 w-4"
                            >
                              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                              <path d="M16.5 9.4 7.55 4.24" />
                              <polyline points="3.29 7 12 12 20.71 7" />
                              <line x1="12" y1="22" x2="12" y2="12" />
                              <circle cx="18.5" cy="15.5" r="2.5" />
                              <path d="M20.27 17.27 22 19" />
                            </svg>
                            Generate Receipt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => confirmDelete(sale.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Sale
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this sale? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
