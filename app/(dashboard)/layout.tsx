"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, Menu, ShoppingCart } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav, sidebarNavItems } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreviewEnv =
      process.env.VERCEL_ENV === "preview" ||
      process.env.NODE_ENV === "development" ||
      window.location.hostname.includes("vercel.app")

    if (!loading && !user && !isPreviewEnv) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Show loading or nothing while checking authentication
  if (
    loading ||
    (!user &&
      !(
        process.env.VERCEL_ENV === "preview" ||
        process.env.NODE_ENV === "development" ||
        window.location.hostname.includes("vercel.app")
      ))
  ) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col space-y-6 py-4">
                <div className="px-3 py-2">
                  <h2 className="mb-2 text-lg font-semibold">Sales Tracker</h2>
                  <SidebarNav items={sidebarNavItems} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden md:inline-block">Sales Tracker</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Sign out</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col gap-6 py-6">
            <div className="px-3 py-2">
              <SidebarNav items={sidebarNavItems} className="px-1" />
            </div>
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
