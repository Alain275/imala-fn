import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Shield,
  Globe,
  AlertCircle,
} from "lucide-react"
import { ProfileFormCard, ProfileSkeleton } from "@/components/account/ProfileFormCard"
import { ChangePasswordDialog } from "@/components/account/ChangePasswordDialog"
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog"
import { useProfile } from "@/hooks/useUser"
import { authService } from "@/services/auth"

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data: profile, loading, error, refetch } = useProfile()

  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const handleSaved = () => {
    authService.refreshUser()
    refetch()
  }

  const handleDeleted = () => {
    authService.logout()
    navigate('/sign-in')
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Settings"
        subtitle="Manage your account preferences and notification settings"
      />

      <div className="p-6 space-y-6 max-w-4xl">

        {/* Profile Settings */}
        {loading ? (
          <ProfileSkeleton />
        ) : error ? (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <AlertCircle className="w-4 h-4" />
                </Icon3D>
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <ProfileFormCard
            profile={profile}
            onSaved={handleSaved}
            showAvatar
            showFarmSize
            locationLabel="Farm Location"
            description="Update your personal information and farm details"
            avatarGradient="from-emerald-400 to-green-500"
          />
        ) : null}

        {/* Notification Settings — Local-only until backend is implemented */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="gold" size="sm">
                <Bell className="w-4 h-4" />
              </Icon3D>
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Configure how you receive alerts and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { title: "Weather Alerts", description: "Get notified about severe weather conditions", enabled: true },
                { title: "Disease Alerts", description: "Receive alerts about disease outbreaks in your area", enabled: true },
                { title: "Market Price Updates", description: "Daily updates on crop prices", enabled: true },
                { title: "Planting Reminders", description: "Reminders for optimal planting times", enabled: false },
                { title: "Training Recommendations", description: "Suggestions for new courses", enabled: false },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language & Region — Local-only until backend is implemented */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="sky" size="sm">
                <Globe className="w-4 h-4" />
              </Icon3D>
              <span>Language & Region</span>
            </CardTitle>
            <CardDescription>Set your preferred language and regional settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                  <option>English</option>
                  <option>Kinyarwanda</option>
                  <option>French</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Units</Label>
                <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                  <option>Metric (kg, hectares)</option>
                  <option>Imperial (lbs, acres)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Shield className="w-4 h-4" />
              </Icon3D>
              <span>Security</span>
            </CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>
              Change Password
            </Button>
            {/* Local-only until backend is implemented */}
            <Button variant="outline" className="w-full justify-start">
              Enable Two-Factor Authentication
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>

      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={handleDeleted} />
    </div>
  )
}
