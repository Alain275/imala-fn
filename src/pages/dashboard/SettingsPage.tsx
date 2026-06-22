import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  User,
  Bell,
  Shield,
  Globe,
  MapPin,
  Phone,
  Mail,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useProfile, useUpdateProfile, useChangePassword, useDeleteAccount } from "@/hooks/useUser"
import { authService } from "@/services/auth"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

function ProfileSkeleton() {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-44" />
        </div>
        <Skeleton className="h-4 w-64 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={`space-y-2 ${i === 0 || i === 4 ? 'md:col-span-2' : ''}`}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 w-32" />
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { data: profile, loading, error, refetch } = useProfile()
  const { mutate: saveProfile, loading: saving } = useUpdateProfile()
  const { mutate: doChangePassword, loading: changingPw } = useChangePassword()
  const { mutate: doDeleteAccount, loading: deletingAccount } = useDeleteAccount()

  // Controlled form state seeded from the fetched profile
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [farmSize, setFarmSize] = useState('')

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setPhone(profile.phone ?? '')
      setLocation(profile.location ?? '')
      setFarmSize(profile.farmSize != null ? String(profile.farmSize) : '')
    }
  }, [profile])

  // Change password dialog
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwValidationError, setPwValidationError] = useState<string | null>(null)

  // Delete account dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePw, setDeletePw] = useState('')

  const initials = profile ? getInitials(profile.name) : '?'

  const handleSave = () => {
    saveProfile(
      {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        farmSize: farmSize !== '' ? Number(farmSize) : undefined,
      },
      () => {
        // Sync the slim auth user (sidebar/header initials and name)
        authService.refreshUser()
        refetch()
      }
    )
  }

  const handleChangePassword = () => {
    setPwValidationError(null)
    if (newPw !== confirmPw) {
      setPwValidationError('Passwords do not match')
      return
    }
    if (newPw.length < 8) {
      setPwValidationError('Password must be at least 8 characters')
      return
    }
    doChangePassword({ currentPassword: currentPw, newPassword: newPw }, () => {
      setPwOpen(false)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    })
  }

  const handleDeleteAccount = () => {
    doDeleteAccount({ password: deletePw }, () => {
      // Use the same logout + redirect path as the existing auth flow
      authService.logout()
      navigate('/sign-in')
    })
  }

  const resetPwDialog = (open: boolean) => {
    if (!open) {
      setPwValidationError(null)
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
      setShowCurrentPw(false)
      setShowNewPw(false)
    }
    setPwOpen(open)
  }

  const resetDeleteDialog = (open: boolean) => {
    if (!open) setDeletePw('')
    setDeleteOpen(open)
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
                  <User className="w-4 h-4" />
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
        ) : (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <User className="w-4 h-4" />
                </Icon3D>
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Update your personal information and farm details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Avatar + meta badges */}
              <div className="flex flex-wrap items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="space-y-2">
                  {/* Change Photo left as-is — no upload endpoint yet */}
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge variant="secondary" className="capitalize">{profile?.role}</Badge>
                    {profile?.isEmailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Email Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Email Not Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* Email is read-only — enable here if the backend adds email-change with verification */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      value={profile?.email ?? ''}
                      disabled
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Farm Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="farmSize">Farm Size (hectares)</Label>
                  <Input
                    id="farmSize"
                    type="number"
                    min="0"
                    step="0.1"
                    value={farmSize}
                    onChange={e => setFarmSize(e.target.value)}
                  />
                </div>

              </div>

              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>

            </CardContent>
          </Card>
        )}

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

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={resetPwDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPw">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPw"
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCurrentPw(v => !v)}
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPw">New Password</Label>
              <div className="relative">
                <Input
                  id="newPw"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNewPw(v => !v)}
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPw">Confirm New Password</Label>
              <Input
                id="confirmPw"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
              />
            </div>
            {pwValidationError && (
              <p className="text-sm text-destructive">{pwValidationError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => resetPwDialog(false)}>Cancel</Button>
            <Button
              onClick={handleChangePassword}
              disabled={changingPw || !currentPw || !newPw || !confirmPw}
            >
              {changingPw ? 'Changing…' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={resetDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your account and all associated data will be permanently removed.
              Enter your password to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="deletePw">Password</Label>
            <Input
              id="deletePw"
              type="password"
              value={deletePw}
              onChange={e => setDeletePw(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deletingAccount || !deletePw}
            >
              {deletingAccount ? 'Deleting…' : 'Delete Account'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
