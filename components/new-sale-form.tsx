"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"

export function NewSaleForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [businessSettings, setBusinessSettings] = useState<any>({
    tax_rate: 7.5, // Default Nigerian VAT rate
  })
  const [date, setDate] = useState<Date>(new Date())
  const [formData, setFormData] = useState({
    customer_id: "anonymous",
    payment_method: "cash",
    notes: "",
    items: [{ product_id: "default", quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    total: 0,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, productsData, settingsData] = await Promise.all([
          dataService.getCustomers(),
          dataService.getProducts(),
          dataService.getBusinessSettings(),
        ])
        setCustomers(customersData)
        setProducts(productsData)
        setBusinessSettings(settingsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error loading data",
          description: "There was a problem loading the necessary data.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [])

  // Calculate totals whenever items change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const tax = (subtotal * businessSettings.tax_rate) / 100
    const total = subtotal + tax

    setFormData((prev) => ({
      ...prev,
      subtotal,
      tax,
      total,
    }))
  }, [formData.items, businessSettings.tax_rate])

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items]

    if (field === "product_id") {
      const selectedProduct = products.find((p) => p.id === value)
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          product_id: value,
          price: selectedProduct.price,
          total: selectedProduct.price * updatedItems[index].quantity,
        }
      }
    } else if (field === "quantity") {
      const quantity = Number.parseInt(value) || 0
      updatedItems[index] = {
        ...updatedItems[index],
        quantity,
        total: updatedItems[index].price * quantity,
      }
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: "default", quantity: 1, price: 0, total: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      // Don't remove the last item, just reset it
      setFormData((prev) => ({
        ...prev,
        items: [{ product_id: "default", quantity: 1, price: 0, total: 0 }],
      }))
      return
    }

    const updatedItems = formData.items.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a sale.",
        variant: "destructive",
      })
      return
    }

    // Validate form
    if (formData.items.some((item) => !item.product_id || item.quantity <= 0)) {
      toast({
        title: "Invalid items",
        description: "Please select a product and enter a valid quantity for all items.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the sale
      await dataService.createSale({
        date: date.toISOString(),
        total: formData.subtotal,
        tax: formData.tax,
        status: "completed",
        payment_method: formData.payment_method,
        notes: formData.notes,
        customer_id: formData.customer_id || null,
        user_id: user.id,
        items: formData.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      })

      toast({
        title: "Sale created",
        description: "Your sale has been recorded successfully.",
      })

      router.push("/sales")
    } catch (error) {
      console.error("Error creating sale:", error)
      toast({
        title: "Error creating sale",
        description: "There was a problem recording your sale.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sale Information</CardTitle>
            <CardDescription>Enter the details of the sale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={formData.customer_id} onValueChange={(value) => handleChange("customer_id", value)}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Anonymous Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => handleChange("payment_method", value)}>
                <SelectTrigger id="payment_method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>Add products to this sale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label htmlFor={`product-${index}`}>Product</Label>
                  <Select
                    value={item.product_id}
                    onValueChange={(value) => handleItemChange(index, "product_id", value)}
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₦{product.price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`price-${index}`}>Price</Label>
                  <Input id={`price-${index}`} value={`₦${item.price.toFixed(2)}`} disabled />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`total-${index}`}>Total</Label>
                  <Input id={`total-${index}`} value={`₦${item.total.toFixed(2)}`} disabled />
                </div>
                <div className="col-span-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Remove item</span>
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>

            <div className="rounded-md border p-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₦{formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT ({businessSettings.tax_rate}%):</span>
                  <span>₦{formData.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>₦{formData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Add any notes or additional details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Add any additional notes here..."
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/sales")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Sale...
                </>
              ) : (
                "Create Sale"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
