import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
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
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { useProfile } from "@/hooks/useUser"
import { authService } from "@/services/auth"

export default function SettingsPage() {
  const { t } = useTranslation()
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
        title={t("dashboard.settings.title")}
        subtitle={t("dashboard.settings.subtitle")}
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
                <span>{t("dashboard.settings.profileErrorCard.title")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>{t("common.actions.retry")}</Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <ProfileFormCard
            profile={profile}
            onSaved={handleSaved}
            showAvatar
            showFarmSize
            locationLabel={t("dashboard.settings.farmLocationLabel")}
            description={t("dashboard.settings.profileDescription")}
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
              <span>{t("dashboard.settings.notificationsCard.title")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.settings.notificationsCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { key: "weatherAlerts", enabled: true },
                { key: "diseaseAlerts", enabled: true },
                { key: "marketPriceUpdates", enabled: true },
                { key: "plantingReminders", enabled: false },
                { key: "trainingRecommendations", enabled: false },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{t(`dashboard.settings.notificationToggles.${setting.key}.title`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`dashboard.settings.notificationToggles.${setting.key}.description`)}</p>
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
              <span>{t("dashboard.settings.languageCard.title")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.settings.languageCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("common.language")}</Label>
                <LanguageSwitcher
                  triggerClassName="w-full justify-between rounded-lg px-3 py-2"
                  contentClassName="w-full min-w-[--radix-dropdown-menu-trigger-width]"
                  align="start"
                />
                {/* Future: once backend supports it, persist via userService.updateProfile({ language: lang.code }) here */}
              </div>
              <div className="space-y-2">
                <Label>{t("dashboard.settings.unitsLabel")}</Label>
                <select className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground">
                  <option>{t("dashboard.settings.unitsMetric")}</option>
                  <option>{t("dashboard.settings.unitsImperial")}</option>
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
              <span>{t("dashboard.settings.securityCard.title")}</span>
            </CardTitle>
            <CardDescription>{t("dashboard.settings.securityCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start" onClick={() => setPwOpen(true)}>
              {t("dashboard.settings.securityCard.changePassword")}
            </Button>
            {/* Local-only until backend is implemented */}
            <Button variant="outline" className="w-full justify-start">
              {t("dashboard.settings.securityCard.enableTwoFactor")}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              {t("dashboard.settings.securityCard.deleteAccount")}
            </Button>
          </CardContent>
        </Card>

      </div>

      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
      <DeleteAccountDialog open={deleteOpen} onOpenChange={setDeleteOpen} onDeleted={handleDeleted} />
    </div>
  )
}
