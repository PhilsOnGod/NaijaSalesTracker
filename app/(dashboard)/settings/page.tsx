"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("business")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [businessSettings, setBusinessSettings] = useState({
    business_name: "",
    address: "",
    phone: "",
    email: "",
    tax_id: "",
    tax_rate: "7.5",
    currency: "NGN",
  })

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true)
      try {
        const data = await dataService.getBusinessSettings()
        setBusinessSettings({
          business_name: data.business_name || "",
          address: data.address || "",
          phone: data.phone || "",
          email: data.email || "",
          tax_id: data.tax_id || "",
          tax_rate: data.tax_rate.toString() || "7.5",
          currency: data.currency || "NGN",
        })
      } catch (error) {
        console.error("Error fetching settings:", error)
        toast({
          title: "Error loading settings",
          description: "There was a problem loading your settings.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBusinessSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update settings.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await dataService.updateBusinessSettings({
        ...businessSettings,
        tax_rate: Number.parseFloat(businessSettings.tax_rate),
        user_id: user.id,
      })

      toast({
        title: "Settings updated",
        description: "Your business settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error updating settings",
        description: "There was a problem updating your settings.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" text="Manage your account and business settings." />

      <Tabs defaultValue="business" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Loading settings...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveBusinessSettings}>
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details and preferences. This information will appear on receipts and invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      value={businessSettings.business_name}
                      onChange={handleChange}
                      placeholder="Your Business Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={businessSettings.address}
                      onChange={handleChange}
                      placeholder="Your business address"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={businessSettings.email}
                        onChange={handleChange}
                        placeholder="business@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Business Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={businessSettings.phone}
                        onChange={handleChange}
                        placeholder="e.g. 08012345678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                      <Input
                        id="tax_id"
                        name="tax_id"
                        value={businessSettings.tax_id}
                        onChange={handleChange}
                        placeholder="Your tax ID or VAT number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        name="tax_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={businessSettings.tax_rate}
                        onChange={handleChange}
                        placeholder="7.5"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          )}
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Update your account preferences and security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Email</Label>
                <Input id="current-email" value={user?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Update Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications and alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Notification settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
