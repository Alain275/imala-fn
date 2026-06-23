import { useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Globe, Bell, Shield, Save, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('IMARA Agricultural Platform')
  const [supportEmail, setSupportEmail] = useState('support@imara.rw')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [aiReviewRequired, setAiReviewRequired] = useState(true)
  const [notifyNewUsers, setNotifyNewUsers] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // TODO: replace with PATCH /api/admin/settings
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    toast.success('Settings saved (mock)')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Platform Settings" subtitle="Configure global platform behaviour and policies" />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* General */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="green" size="sm"><Globe className="w-4 h-4" /></Icon3D>
              General
            </CardTitle>
            <CardDescription>Basic platform identity settings</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Platform Name</Label>
              <Input value={platformName} onChange={e => setPlatformName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* AI & Model */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="leaf" size="sm"><Shield className="w-4 h-4" /></Icon3D>
              AI Policy
            </CardTitle>
            <CardDescription>Control AI prediction validation requirements</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Require human review for predictions under 85%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Low-confidence predictions enter the admin review queue before being sent to farmers</p>
              </div>
              <Switch checked={aiReviewRequired} onCheckedChange={setAiReviewRequired} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Block all farmer/agronomist logins and show maintenance page</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="sky" size="sm"><Bell className="w-4 h-4" /></Icon3D>
              Notifications
            </CardTitle>
            <CardDescription>Admin notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Notify on new user registrations</p>
                <p className="text-xs text-muted-foreground mt-0.5">Receive a platform notification each time a new user signs up</p>
              </div>
              <Switch checked={notifyNewUsers} onCheckedChange={setNotifyNewUsers} />
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <><Settings className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Changes saved to mock store only — TODO: wire to real API
          </p>
        </div>
      </div>
    </div>
  )
}
