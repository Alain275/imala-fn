import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "next-themes"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ProfileFormCard, ProfileSkeleton } from "@/components/account/ProfileFormCard"
import { ChangePasswordDialog } from "@/components/account/ChangePasswordDialog"
import { DeleteAccountDialog } from "@/components/account/DeleteAccountDialog"
import {
  ShieldCheck, Shield, Bell, Sun, Moon, Monitor,
  CheckCircle, AlertCircle, Calendar, Clock, Activity,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useProfile } from "@/hooks/useUser"
import { authService } from "@/services/auth"
import {
  adminService, USE_MOCK_ADMIN, type AdminActivityItem,
} from "@/services/adminMock"

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

function safeFormat(dateStr: string, fmt: string): string {
  try { return format(new Date(dateStr), fmt) } catch { return dateStr }
}

export default function AdminProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useTheme()

  const { data: profile, loading, error, refetch } = useProfile()

  const [pwOpen, setPwOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Admin activity (MOCK — behind USE_MOCK_ADMIN)
  const [activity, setActivity] = useState<AdminActivityItem[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  useEffect(() => {
    if (!USE_MOCK_ADMIN) return
    // TODO: replace with real /api/admin/activity
    adminService.getAdminActivity()
      .then(setActivity)
      .finally(() => setActivityLoading(false))
  }, [])

  const handleSaved = () => {
    authService.refreshUser()
    refetch()
  }

  const handleDeleted = () => {
    authService.logout()
    navigate('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.profile.title')} subtitle={t('admin.profile.subtitle')} />

      <div className="p-6 space-y-6 max-w-4xl">

        {/* ── Section 1: Profile header card ─────────────────────────────── */}
        {loading ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="flex gap-6 pt-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-10 flex flex-col items-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>{t('common.actions.retry')}</Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <Card className="border-0 shadow-md bg-gradient-to-br from-violet-500/5 to-purple-600/5 border border-violet-200/30 dark:border-violet-900/30">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-lg">
                  {getInitials(profile.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      {t('common.role.admin')}
                    </Badge>
                    {profile.isEmailVerified ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t('admin.profile.emailVerified')}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {t('admin.profile.emailNotVerified')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {t('admin.profile.memberSince', { date: safeFormat(profile.createdAt, 'MMM d, yyyy') })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {t('admin.profile.lastLogin', { time: formatDistanceToNow(new Date(profile.lastLogin), { addSuffix: true }) })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* ── Section 2: Personal information (real, editable) ───────────── */}
        {loading ? (
          <ProfileSkeleton />
        ) : profile ? (
          <ProfileFormCard
            profile={profile}
            onSaved={handleSaved}
            showAvatar={false}
            showFarmSize={false}
            locationLabel={t('admin.profile.locationLabel')}
            description={t('admin.profile.formDescription')}
            avatarGradient="from-violet-400 to-purple-600"
          />
        ) : null}

        {/* ── Section 3: Security ────────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="earth" size="sm">
                <Shield className="w-4 h-4" />
              </Icon3D>
              <span>{t('admin.profile.security.title')}</span>
            </CardTitle>
            <CardDescription>{t('admin.profile.security.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setPwOpen(true)}
            >
              {t('admin.profile.security.changePassword')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              {t('admin.profile.security.deleteAccount')}
            </Button>
            <p className="text-xs text-muted-foreground">
              {t('admin.profile.security.deleteWarning')}
            </p>
          </CardContent>
        </Card>

        {/* ── Section 4: Admin activity (MOCK — TODO: replace with real /api/admin/activity) */}
        {USE_MOCK_ADMIN && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="sky" size="sm">
                  <Activity className="w-4 h-4" />
                </Icon3D>
                <span>{t('admin.profile.activity.title')}</span>
              </CardTitle>
              <CardDescription>{t('admin.profile.activity.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-56" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Activity className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">{t('admin.profile.activity.empty')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activity.map(item => (
                    <div key={item.id} className="flex items-start gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.detail}</p>
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Section 5: Preferences ─────────────────────────────────────── */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Icon3D gradient="gold" size="sm">
                <Bell className="w-4 h-4" />
              </Icon3D>
              <span>{t('admin.profile.preferences.title')}</span>
            </CardTitle>
            <CardDescription>{t('admin.profile.preferences.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">{t('admin.profile.preferences.appearance')}</p>
              <div className="flex gap-2">
                {[
                  { value: 'light', label: t('admin.profile.preferences.themeLight'), Icon: Sun },
                  { value: 'dark', label: t('admin.profile.preferences.themeDark'), Icon: Moon },
                  { value: 'system', label: t('admin.profile.preferences.themeSystem'), Icon: Monitor },
                ].map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      resolvedTheme === value || (value === 'system' && !resolvedTheme)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:text-foreground bg-muted/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification preferences — Local-only until backend is implemented */}
            <div>
              <p className="text-sm font-medium text-foreground mb-3">{t('admin.profile.preferences.notificationsHeading')}</p>
              <div className="space-y-3">
                {[
                  { title: t('admin.profile.preferences.notifications.platformAlerts.title'), description: t('admin.profile.preferences.notifications.platformAlerts.description'), enabled: true },
                  { title: t('admin.profile.preferences.notifications.aiModelUpdates.title'), description: t('admin.profile.preferences.notifications.aiModelUpdates.description'), enabled: true },
                  { title: t('admin.profile.preferences.notifications.newUserRegistrations.title'), description: t('admin.profile.preferences.notifications.newUserRegistrations.description'), enabled: false },
                  { title: t('admin.profile.preferences.notifications.cooperativeActivity.title'), description: t('admin.profile.preferences.notifications.cooperativeActivity.description'), enabled: false },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{pref.title}</p>
                      <p className="text-xs text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch defaultChecked={pref.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={handleDeleted} />
    </div>
  )
}
