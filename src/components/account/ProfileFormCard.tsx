import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Phone, MapPin, Save, CheckCircle, AlertCircle } from "lucide-react"
import { useUpdateProfile } from "@/hooks/useUser"
import type { UserProfile } from "@/services/users"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

export function ProfileSkeleton() {
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

interface ProfileFormCardProps {
  profile: UserProfile
  onSaved: () => void
  showAvatar?: boolean
  showFarmSize?: boolean
  locationLabel?: string
  description?: string
  avatarGradient?: string
}

export function ProfileFormCard({
  profile,
  onSaved,
  showAvatar = true,
  showFarmSize = false,
  locationLabel = "Location",
  description = "Update your personal information",
  avatarGradient = "from-emerald-400 to-green-500",
}: ProfileFormCardProps) {
  const { mutate: saveProfile, loading: saving } = useUpdateProfile()

  const [name, setName] = useState(profile.name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [location, setLocation] = useState(profile.location ?? '')
  const [farmSize, setFarmSize] = useState(
    profile.farmSize != null ? String(profile.farmSize) : ''
  )

  useEffect(() => {
    setName(profile.name ?? '')
    setPhone(profile.phone ?? '')
    setLocation(profile.location ?? '')
    setFarmSize(profile.farmSize != null ? String(profile.farmSize) : '')
  }, [profile])

  const handleSave = () => {
    saveProfile(
      {
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        ...(showFarmSize && farmSize !== '' ? { farmSize: Number(farmSize) } : {}),
      },
      onSaved,
    )
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon3D gradient="green" size="sm">
            <User className="w-4 h-4" />
          </Icon3D>
          <span>Profile Information</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {showAvatar && (
          <div className="flex flex-wrap items-start gap-6">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-2xl font-bold flex-shrink-0`}>
              {getInitials(profile.name)}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">Change Photo</Button>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
                {profile.isEmailVerified ? (
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pfcard-name">Full Name</Label>
            <Input
              id="pfcard-name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Email read-only — enable when backend adds email-change with verification */}
          <div className="space-y-2">
            <Label htmlFor="pfcard-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pfcard-email"
                value={profile.email ?? ''}
                disabled
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pfcard-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pfcard-phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="pfcard-location">{locationLabel}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="pfcard-location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {showFarmSize && (
            <div className="space-y-2">
              <Label htmlFor="pfcard-farmsize">Farm Size (hectares)</Label>
              <Input
                id="pfcard-farmsize"
                type="number"
                min="0"
                step="0.1"
                value={farmSize}
                onChange={e => setFarmSize(e.target.value)}
              />
            </div>
          )}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </CardContent>
    </Card>
  )
}
