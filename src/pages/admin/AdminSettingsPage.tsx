import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings, Globe, Bell, Shield, Save, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

export default function AdminSettingsPage() {
  const { t } = useTranslation()
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
    toast.success(t('admin.settings.savedMockToast'))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.settings.title')} subtitle={t('admin.settings.subtitle')} />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* General */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="green" size="sm"><Globe className="w-4 h-4" /></Icon3D>
              {t('admin.settings.generalCard.title')}
            </CardTitle>
            <CardDescription>{t('admin.settings.generalCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>{t('admin.settings.platformNameLabel')}</Label>
              <Input value={platformName} onChange={e => setPlatformName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('admin.settings.supportEmailLabel')}</Label>
              <Input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* AI & Model */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="leaf" size="sm"><Shield className="w-4 h-4" /></Icon3D>
              {t('admin.settings.aiPolicyCard.title')}
            </CardTitle>
            <CardDescription>{t('admin.settings.aiPolicyCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t('admin.settings.aiPolicyCard.requireReviewTitle')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('admin.settings.aiPolicyCard.requireReviewDescription')}</p>
              </div>
              <Switch checked={aiReviewRequired} onCheckedChange={setAiReviewRequired} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t('admin.settings.aiPolicyCard.maintenanceModeTitle')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('admin.settings.aiPolicyCard.maintenanceModeDescription')}</p>
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
              {t('admin.settings.notificationsCard.title')}
            </CardTitle>
            <CardDescription>{t('admin.settings.notificationsCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{t('admin.settings.notificationsCard.notifyNewUsersTitle')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t('admin.settings.notificationsCard.notifyNewUsersDescription')}</p>
              </div>
              <Switch checked={notifyNewUsers} onCheckedChange={setNotifyNewUsers} />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region — reuses the same LanguageSwitcher + i18n.changeLanguage architecture as the Farmer Dashboard's Settings page */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-3 text-base">
              <Icon3D gradient="sky" size="sm"><Globe className="w-4 h-4" /></Icon3D>
              {t('admin.settings.languageCard.title')}
            </CardTitle>
            <CardDescription>{t('admin.settings.languageCard.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5 max-w-xs">
              <Label>{t('common.language')}</Label>
              <LanguageSwitcher
                triggerClassName="w-full justify-between rounded-lg px-3 py-2"
                contentClassName="w-full min-w-[--radix-dropdown-menu-trigger-width]"
                align="start"
              />
            </div>
            {/* Future: once backend supports it, persist via an admin profile update call here */}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <><Settings className="w-4 h-4 animate-spin" /> {t('admin.settings.saving')}</> : <><Save className="w-4 h-4" /> {t('admin.settings.saveSettings')}</>}
          </Button>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            {t('admin.settings.mockStoreNotice')}
          </p>
        </div>
      </div>
    </div>
  )
}
