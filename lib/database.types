export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          category: string | null
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock?: number
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          status: string
          total_purchases: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          status?: string
          total_purchases?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          status?: string
          total_purchases?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      sales: {
        Row: {
          id: string
          date: string
          total: number
          tax: number
          status: string
          payment_method: string | null
          notes: string | null
          customer_id: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          date?: string
          total: number
          tax?: number
          status?: string
          payment_method?: string | null
          notes?: string | null
          customer_id?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          date?: string
          total?: number
          tax?: number
          status?: string
          payment_method?: string | null
          notes?: string | null
          customer_id?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string | null
          quantity: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id?: string | null
          quantity: number
          price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string | null
          quantity?: number
          price?: number
          total?: number
          created_at?: string
        }
      }
      business_settings: {
        Row: {
          id: string
          business_name: string
          address: string | null
          phone: string | null
          email: string | null
          tax_id: string | null
          tax_rate: number
          currency: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          business_name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          tax_id?: string | null
          tax_rate?: number
          currency?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          business_name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          tax_id?: string | null
          tax_rate?: number
          currency?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
