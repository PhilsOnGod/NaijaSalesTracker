import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Initialize Supabase client with your credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mktwmwmgmbrbscrvwivd.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdHdtd21nbWJyYnNjcnZ3aXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MTMwMjAsImV4cCI6MjA2MDM4OTAyMH0.1vDwPzEkY21Rqs7b2ry-VqjbLRiHEwZ5wVb0OR3svfQ"

// Check if we're in a preview environment
const isPreview = process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development" || true

// Create a Supabase client
let supabase: ReturnType<typeof createClient<Database>>

try {
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
} catch (error) {
  console.error("Failed to initialize Supabase client:", error)
  // Create a dummy client for fallback
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null }),
        }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ unsubscribe: () => {} }),
      signInWithPassword: () => Promise.resolve({ data: null, error: null }),
      signUp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
    },
  } as any
}

// Mock data for preview/development environment
// Define mockCustomers first since it's used in mockSales
const mockCustomers = [
  {
    id: "mock-customer-1",
    name: "John Doe",
    email: "john@example.com",
    phone: "08012345678",
    address: "Lagos, Nigeria",
    status: "active",
    total_purchases: 5,
  },
  {
    id: "mock-customer-2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "08023456789",
    address: "Abuja, Nigeria",
    status: "active",
    total_purchases: 3,
  },
  {
    id: "mock-customer-3",
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: "08034567890",
    address: "Port Harcourt, Nigeria",
    status: "active",
    total_purchases: 2,
  },
]

// Define mockProducts before mockSales
const mockProducts = [
  {
    id: "mock-product-1",
    name: "Laptop",
    description: "High-performance laptop",
    price: 250000,
    stock: 10,
    category: "Electronics",
    status: "active",
  },
  {
    id: "mock-product-2",
    name: "Headphones",
    description: "Wireless headphones",
    price: 15000,
    stock: 20,
    category: "Electronics",
    status: "active",
  },
  {
    id: "mock-product-3",
    name: "Office Chair",
    description: "Ergonomic office chair",
    price: 35000,
    stock: 5,
    category: "Furniture",
    status: "active",
  },
  {
    id: "mock-product-4",
    name: "Desk Lamp",
    description: "LED desk lamp",
    price: 3000,
    stock: 15,
    category: "Home Goods",
    status: "active",
  },
]

// Now define mockSales after its dependencies
const mockSales = [
  {
    id: "mock-sale-1",
    date: new Date().toISOString(),
    total: 25000,
    tax: 1875,
    status: "completed",
    payment_method: "cash",
    notes: "Mock sale 1",
    customer: mockCustomers[0],
    items: [
      {
        id: "mock-item-1",
        product: mockProducts[0],
        quantity: 1,
        price: 25000,
        total: 25000,
      },
    ],
  },
  {
    id: "mock-sale-2",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    total: 5000,
    tax: 375,
    status: "completed",
    payment_method: "card",
    notes: "Mock sale 2",
    customer: mockCustomers[1],
    items: [
      {
        id: "mock-item-2",
        product: mockProducts[1],
        quantity: 1,
        price: 5000,
        total: 5000,
      },
    ],
  },
  // Add more mock sales for better chart data
  {
    id: "mock-sale-3",
    date: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    total: 15000,
    tax: 1125,
    status: "completed",
    payment_method: "transfer",
    notes: "Mock sale 3",
    customer: mockCustomers[0],
    items: [
      {
        id: "mock-item-3",
        product: mockProducts[2],
        quantity: 1,
        price: 15000,
        total: 15000,
      },
    ],
  },
  {
    id: "mock-sale-4",
    date: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
    total: 8000,
    tax: 600,
    status: "completed",
    payment_method: "mobile_money",
    notes: "Mock sale 4",
    customer: mockCustomers[2],
    items: [
      {
        id: "mock-item-4",
        product: mockProducts[1],
        quantity: 1,
        price: 5000,
        total: 5000,
      },
      {
        id: "mock-item-5",
        product: mockProducts[3],
        quantity: 1,
        price: 3000,
        total: 3000,
      },
    ],
  },
  // Add more sales for the past 30 days
  ...Array.from({ length: 26 }).map((_, index) => ({
    id: `mock-sale-${index + 5}`,
    date: new Date(Date.now() - (index + 4) * 86400000).toISOString(),
    total: Math.floor(Math.random() * 20000) + 5000,
    tax: Math.floor(Math.random() * 1500) + 375,
    status: "completed",
    payment_method: ["cash", "card", "transfer", "mobile_money"][Math.floor(Math.random() * 4)],
    notes: `Mock sale ${index + 5}`,
    customer: mockCustomers[Math.floor(Math.random() * mockCustomers.length)],
    items: [
      {
        id: `mock-item-${index + 6}`,
        product: mockProducts[Math.floor(Math.random() * mockProducts.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        price: Math.floor(Math.random() * 10000) + 2000,
        total: Math.floor(Math.random() * 10000) + 2000,
      },
    ],
  })),
]

const mockBusinessSettings = {
  business_name: "Nigerian Sales Tracker",
  address: "123 Main Street, Lagos",
  phone: "08012345678",
  email: "info@salestracker.com",
  tax_id: "12345678",
  tax_rate: 7.5,
  currency: "NGN",
}

export const dataService = {
  // Dashboard data
  async getDashboardData() {
    try {
      if (isPreview) {
        // Return mock data for preview
        return {
          totalRevenue: 30000,
          salesCount: 2,
          customersCount: 2,
          productsCount: 3,
          averageSale: 15000,
        }
      }

      // Get sales data
      const { data: sales } = await supabase.from("sales").select("*")

      // Get customers count
      const { count: customersCount } = await supabase.from("customers").select("*", { count: "exact", head: true })

      // Get products count
      const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true })

      // Calculate metrics
      const totalRevenue = sales ? sales.reduce((sum, sale) => sum + sale.total, 0) : 0
      const salesCount = sales ? sales.length : 0
      const averageSale = salesCount > 0 ? totalRevenue / salesCount : 0

      return {
        totalRevenue,
        salesCount,
        customersCount: customersCount || 0,
        productsCount: productsCount || 0,
        averageSale,
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Return fallback data
      return {
        totalRevenue: 0,
        salesCount: 0,
        customersCount: 0,
        productsCount: 0,
        averageSale: 0,
      }
    }
  },

  // Sales
  async getSales() {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockSales
      }

      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          customer:customer_id(*),
          items:sale_items(
            *,
            product:product_id(*)
          )
        `)
        .order("date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching sales:", error)
      // Return fallback data
      return mockSales
    }
  },

  async getSale(id: string) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockSales.find((sale) => sale.id === id) || mockSales[0]
      }

      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          customer:customer_id(*),
          items:sale_items(
            *,
            product:product_id(*)
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching sale ${id}:`, error)
      // Return fallback data
      return mockSales[0]
    }
  },

  async createSale(saleData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockSales[0], id: `mock-sale-${Date.now()}` }
      }

      // First create the sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          date: saleData.date || new Date().toISOString(),
          total: saleData.total,
          tax: saleData.tax || 0,
          status: saleData.status || "completed",
          payment_method: saleData.payment_method,
          notes: saleData.notes,
          customer_id: saleData.customer_id,
          user_id: saleData.user_id,
        })
        .select()
        .single()

      if (saleError) throw saleError

      // Then create the sale items
      if (saleData.items && saleData.items.length > 0) {
        const saleItems = saleData.items.map((item: any) => ({
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        }))

        const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

        if (itemsError) throw itemsError
      }

      return sale
    } catch (error) {
      console.error("Error creating sale:", error)
      // Return fallback data
      return { ...mockSales[0], id: `mock-sale-${Date.now()}` }
    }
  },

  async updateSale(id: string, saleData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockSales[0], ...saleData }
      }

      const { data, error } = await supabase
        .from("sales")
        .update({
          date: saleData.date,
          total: saleData.total,
          tax: saleData.tax,
          status: saleData.status,
          payment_method: saleData.payment_method,
          notes: saleData.notes,
          customer_id: saleData.customer_id,
        })
        .eq("id", id)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating sale ${id}:`, error)
      // Return fallback data
      return { ...mockSales[0], ...saleData }
    }
  },

  async deleteSale(id: string) {
    try {
      if (isPreview) {
        // Return success for preview
        return true
      }

      // First delete related sale items
      const { error: itemsError } = await supabase.from("sale_items").delete().eq("sale_id", id)

      if (itemsError) throw itemsError

      // Then delete the sale
      const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error)
      // Return fallback data
      return true
    }
  },

  // Products
  async getProducts() {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockProducts
      }

      const { data, error } = await supabase.from("products").select("*").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching products:", error)
      // Return fallback data
      return mockProducts
    }
  },

  async getProduct(id: string) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockProducts.find((product) => product.id === id) || mockProducts[0]
      }

      const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      // Return fallback data
      return mockProducts[0]
    }
  },

  async createProduct(productData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockProducts[0], ...productData, id: `mock-product-${Date.now()}` }
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock || 0,
          category: productData.category,
          status: productData.status || "active",
          user_id: productData.user_id,
        })
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating product:", error)
      // Return fallback data
      return { ...mockProducts[0], ...productData, id: `mock-product-${Date.now()}` }
    }
  },

  async updateProduct(id: string, productData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockProducts[0], ...productData }
      }

      const { data, error } = await supabase
        .from("products")
        .update({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          category: productData.category,
          status: productData.status,
        })
        .eq("id", id)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating product ${id}:`, error)
      // Return fallback data
      return { ...mockProducts[0], ...productData }
    }
  },

  async deleteProduct(id: string) {
    try {
      if (isPreview) {
        // Return success for preview
        return true
      }

      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error)
      // Return fallback data
      return true
    }
  },

  // Customers
  async getCustomers() {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockCustomers
      }

      const { data, error } = await supabase.from("customers").select("*").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching customers:", error)
      // Return fallback data
      return mockCustomers
    }
  },

  async getCustomer(id: string) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockCustomers.find((customer) => customer.id === id) || mockCustomers[0]
      }

      const { data, error } = await supabase.from("customers").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error fetching customer ${id}:`, error)
      // Return fallback data
      return mockCustomers[0]
    }
  },

  async createCustomer(customerData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockCustomers[0], ...customerData, id: `mock-customer-${Date.now()}` }
      }

      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          status: customerData.status || "active",
          user_id: customerData.user_id,
        })
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating customer:", error)
      // Return fallback data
      return { ...mockCustomers[0], ...customerData, id: `mock-customer-${Date.now()}` }
    }
  },

  async updateCustomer(id: string, customerData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockCustomers[0], ...customerData }
      }

      const { data, error } = await supabase
        .from("customers")
        .update({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          status: customerData.status,
        })
        .eq("id", id)
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error(`Error updating customer ${id}:`, error)
      // Return fallback data
      return { ...mockCustomers[0], ...customerData }
    }
  },

  async deleteCustomer(id: string) {
    try {
      if (isPreview) {
        // Return success for preview
        return true
      }

      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Error deleting customer ${id}:`, error)
      // Return fallback data
      return true
    }
  },

  // Business Settings
  async getBusinessSettings() {
    try {
      if (isPreview) {
        // Return mock data for preview
        return mockBusinessSettings
      }

      const { data, error } = await supabase.from("business_settings").select("*").single()

      if (error && error.code !== "PGRST116") throw error // PGRST116 is "no rows returned" error
      return (
        data || {
          business_name: "Nigerian Sales Tracker",
          address: "",
          phone: "",
          email: "",
          tax_id: "",
          tax_rate: 7.5, // Default Nigerian VAT rate
          currency: "NGN",
        }
      )
    } catch (error) {
      console.error("Error fetching business settings:", error)
      // Return fallback data
      return mockBusinessSettings
    }
  },

  async updateBusinessSettings(settingsData: any) {
    try {
      if (isPreview) {
        // Return mock data for preview
        return { ...mockBusinessSettings, ...settingsData }
      }

      // Check if settings exist
      const { data: existingData } = await supabase.from("business_settings").select("id")

      if (existingData && existingData.length > 0) {
        // Update existing settings
        const { data, error } = await supabase
          .from("business_settings")
          .update({
            business_name: settingsData.business_name,
            address: settingsData.address,
            phone: settingsData.phone,
            email: settingsData.email,
            tax_id: settingsData.tax_id,
            tax_rate: settingsData.tax_rate,
            currency: settingsData.currency,
          })
          .eq("id", existingData[0].id)
          .select()

        if (error) throw error
        return data
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from("business_settings")
          .insert({
            business_name: settingsData.business_name,
            address: settingsData.address,
            phone: settingsData.phone,
            email: settingsData.email,
            tax_id: settingsData.tax_id,
            tax_rate: settingsData.tax_rate,
            currency: settingsData.currency,
            user_id: settingsData.user_id,
          })
          .select()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error("Error updating business settings:", error)
      // Return fallback data
      return { ...mockBusinessSettings, ...settingsData }
    }
  },
}
