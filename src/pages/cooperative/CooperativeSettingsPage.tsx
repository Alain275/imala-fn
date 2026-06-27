import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Edit3, Save, X, Bell, Lock, Building2 } from "lucide-react"
import { toast } from "sonner"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { cooperativeService, type CooperativeSettings } from "@/services/cooperativeMock"

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-all",
        checked ? "bg-green-500 border-green-500" : "bg-muted border-border"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-1"
      )} />
    </button>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeSettingsPage() {
  const { t } = useTranslation()
  const [settings, setSettings]   = useState<CooperativeSettings | null>(null)
  const [loading, setLoading]     = useState(true)
  const [editProfile, setEditProfile] = useState(false)
  const [profileDraft, setProfileDraft] = useState<CooperativeSettings['profile'] | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingNotifs, setSavingNotifs]   = useState(false)
  const [savingAccess, setSavingAccess]   = useState(false)

  useEffect(() => {
    // TODO: GET /api/cooperative/settings
    cooperativeService.getSettings()
      .then(s => { setSettings(s); setProfileDraft({ ...s.profile }) })
      .finally(() => setLoading(false))
  }, [])

  function handleProfileField(key: keyof CooperativeSettings['profile'], val: string) {
    setProfileDraft(prev => prev ? { ...prev, [key]: val } : null)
  }

  async function handleSaveProfile() {
    if (!profileDraft || !settings) return
    setSavingProfile(true)
    try {
      // TODO: PATCH /api/cooperative/settings/profile
      await cooperativeService.saveProfile(profileDraft)
      setSettings(prev => prev ? { ...prev, profile: { ...profileDraft } } : null)
      setEditProfile(false)
      toast.success(t('cooperative.settings.profileSaved'))
    } catch {
      toast.error(t('cooperative.settings.profileError'))
    } finally {
      setSavingProfile(false)
    }
  }

  async function toggleNotif(key: keyof CooperativeSettings['notifications'], val: boolean) {
    if (!settings) return
    const updated = { ...settings.notifications, [key]: val }
    setSettings(prev => prev ? { ...prev, notifications: updated } : null)
    setSavingNotifs(true)
    try {
      // TODO: PATCH /api/cooperative/settings/notifications
      await cooperativeService.saveNotifications(updated)
      toast.success(t('cooperative.settings.notifSaved'))
    } catch {
      toast.error(t('cooperative.settings.notifError'))
    } finally {
      setSavingNotifs(false)
    }
  }

  async function toggleAccess(key: keyof CooperativeSettings['access'], val: boolean) {
    if (!settings) return
    const updated = { ...settings.access, [key]: val }
    setSettings(prev => prev ? { ...prev, access: updated } : null)
    setSavingAccess(true)
    try {
      // TODO: PATCH /api/cooperative/settings/access
      await cooperativeService.saveAccess(updated)
      toast.success(t('cooperative.settings.accessSaved'))
    } catch {
      toast.error(t('cooperative.settings.accessError'))
    } finally {
      setSavingAccess(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title={t('cooperative.settings.title')} />
        <div className="p-6 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!settings || !profileDraft) return null

  const profileFields: { key: keyof CooperativeSettings['profile']; label: string; placeholder: string }[] = [
    { key: 'name',               label: t('cooperative.settings.profileFields.name'),       placeholder: 'Musanze North Cooperative' },
    { key: 'location',           label: t('cooperative.settings.profileFields.location'),   placeholder: 'Musanze, Northern Province' },
    { key: 'district',           label: t('cooperative.settings.profileFields.district'),   placeholder: 'Musanze' },
    { key: 'registrationNumber', label: t('cooperative.settings.profileFields.regNumber'),  placeholder: 'COOP/2023/MN/047' },
    { key: 'contactEmail',       label: t('cooperative.settings.profileFields.email'),      placeholder: 'coop@example.com' },
    { key: 'contactPhone',       label: t('cooperative.settings.profileFields.phone'),      placeholder: '+250788000000' },
    { key: 'foundedYear',        label: t('cooperative.settings.profileFields.foundedYear'),placeholder: '2023' },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.settings.title')} subtitle={t('cooperative.settings.subtitle')} />

      <div className="p-6 space-y-6 max-w-3xl">

        {/* ── Cooperative Profile ────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
                  <Building2 className="w-5 h-5 text-green-500" />
                  {t('cooperative.settings.profileSection')}
                </CardTitle>
                <CardDescription className="text-[13px] text-muted-foreground mt-0.5">
                  {t('cooperative.settings.profileDesc')}
                </CardDescription>
              </div>
              {!editProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditProfile(true)}
                  className="gap-2 border-border text-muted-foreground hover:text-foreground hover:border-green-500/40"
                >
                  <Edit3 className="w-4 h-4" /> {t('common.actions.edit')}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground"
                    onClick={() => { setEditProfile(false); setProfileDraft({ ...settings.profile }) }}>
                    <X className="w-4 h-4 mr-1" /> {t('common.actions.cancel')}
                  </Button>
                  <Button size="sm" disabled={savingProfile} onClick={handleSaveProfile}
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold gap-1">
                    <Save className="w-4 h-4" /> {savingProfile ? t('common.actions.saving') : t('common.actions.save')}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editProfile ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profileFields.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-[12px] text-muted-foreground">{f.label}</label>
                      <Input
                        placeholder={f.placeholder}
                        value={profileDraft[f.key]}
                        onChange={e => handleProfileField(f.key, e.target.value)}
                        className="bg-background border-border text-foreground focus-visible:ring-green-500"
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] text-muted-foreground">{t('cooperative.settings.profileFields.description')}</label>
                  <textarea
                    rows={3}
                    value={profileDraft.description}
                    onChange={e => handleProfileField('description', e.target.value)}
                    className="w-full rounded-xl bg-background border border-border text-foreground p-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-green-500/40 resize-none"
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profileFields.map(f => (
                  <div key={f.key} className="space-y-1">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    <p className="text-[14px] text-foreground">{settings.profile[f.key] || '—'}</p>
                  </div>
                ))}
                <div className="sm:col-span-2 space-y-1">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{t('cooperative.settings.profileFields.description')}</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{settings.profile.description}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Language ────────────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-[16px] text-foreground flex items-center gap-2">
              🌍 {t('cooperative.settings.languageSection')}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">{t('cooperative.settings.languageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* ── Notifications ──────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
              <Bell className="w-5 h-5 text-amber-500" />
              {t('cooperative.settings.notifsSection')}
              {savingNotifs && <span className="text-[12px] text-green-500 font-normal ml-2">{t('common.actions.saving')}</span>}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">{t('cooperative.settings.notifsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.entries(settings.notifications) as [keyof CooperativeSettings['notifications'], boolean][]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[14px] text-foreground">{t(`cooperative.settings.notif.${key}.label`)}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{t(`cooperative.settings.notif.${key}.desc`)}</p>
                </div>
                <Toggle checked={val} onChange={v => toggleNotif(key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── Access Control ──────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
              <Lock className="w-5 h-5 text-violet-500" />
              {t('cooperative.settings.accessSection')}
              {savingAccess && <span className="text-[12px] text-green-500 font-normal ml-2">{t('common.actions.saving')}</span>}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">{t('cooperative.settings.accessDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.entries(settings.access) as [keyof CooperativeSettings['access'], boolean][]).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-[14px] text-foreground">{t(`cooperative.settings.access.${key}.label`)}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{t(`cooperative.settings.access.${key}.desc`)}</p>
                </div>
                <Toggle checked={val} onChange={v => toggleAccess(key, v)} />
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
