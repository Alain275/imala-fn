import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Lock } from "lucide-react"
import { toast } from "sonner"
import { cooperativeApi, type CooperativeProfile } from "@/services/cooperative.service"

/**
 * The cooperative's own registration data, read from `cooperatives` — the same
 * row captured at signup and approved by an administrator.
 *
 * Name, district and registration number are shown but not editable: they are
 * what the admin approved, and letting a leader rewrite them afterwards would
 * make the approval meaningless. The server enforces the same rule.
 */
export default function CooperativeProfilePage() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<CooperativeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ contactEmail: "", contactPhone: "", description: "", location: "" })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const next = await cooperativeApi.getProfile()
      setProfile(next)
      setForm({
        contactEmail: next.contactEmail ?? "",
        contactPhone: next.contactPhone ?? "",
        description: next.description ?? "",
        location: next.location ?? "",
      })
    } catch {
      toast.error(t("cooperative.profile.loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { void load() }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const next = await cooperativeApi.updateProfile(form)
      setProfile(current => (current ? { ...current, ...next } : current))
      setEditing(false)
      toast.success(t("cooperative.profile.saved"))
    } catch (error: any) {
      toast.error(error?.message || t("cooperative.profile.loadError"))
    } finally {
      setSaving(false)
    }
  }

  const dash = (value: string | null | undefined) => value || t("cooperative.profile.notSet")

  return (
    <>
      <Header title={t("cooperative.profile.title")} subtitle={t("cooperative.profile.subtitle")} />
      <div className="space-y-6 p-4 sm:p-6">
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : !profile ? null : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: t("cooperative.profile.members"), value: profile.memberCount },
                { label: t("cooperative.profile.activeMembers"), value: profile.activeMemberCount },
                { label: t("cooperative.profile.registeredFarms"), value: profile.registeredFarmCount },
              ].map(card => (
                <Card key={card.label}>
                  <CardContent className="pt-6">
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("cooperative.profile.title")}</CardTitle>
                <CardDescription className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 shrink-0" />
                  {t("cooperative.profile.lockedHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  [t("cooperative.profile.name"), profile.name],
                  [t("cooperative.profile.district"), dash(profile.district)],
                  [t("cooperative.profile.registrationNumber"), dash(profile.registrationNumber)],
                  [t("cooperative.profile.status"), profile.status],
                  [t("cooperative.profile.registeredAt"), new Date(profile.registeredAt).toLocaleDateString()],
                  [
                    t("cooperative.profile.approvedAt"),
                    profile.approvedAt ? new Date(profile.approvedAt).toLocaleDateString() : dash(null),
                  ],
                  [t("cooperative.profile.leader"), profile.leader ? `${profile.leader.name} · ${profile.leader.email}` : dash(null)],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-sm font-medium break-words">{value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle>{t("cooperative.profile.contactEmail")}</CardTitle>
                  <CardDescription>{t("cooperative.profile.subtitle")}</CardDescription>
                </div>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    {t("cooperative.profile.edit")}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="coop-contact-email">{t("cooperative.profile.contactEmail")}</Label>
                        <Input
                          id="coop-contact-email"
                          type="email"
                          value={form.contactEmail}
                          onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="coop-contact-phone">{t("cooperative.profile.contactPhone")}</Label>
                        <Input
                          id="coop-contact-phone"
                          value={form.contactPhone}
                          onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="coop-location">{t("cooperative.profile.location")}</Label>
                        <Input
                          id="coop-location"
                          value={form.location}
                          onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="coop-description">{t("cooperative.profile.description")}</Label>
                        <textarea
                          id="coop-description"
                          rows={4}
                          maxLength={2000}
                          placeholder={t("cooperative.profile.descriptionPlaceholder")}
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={save} disabled={saving}>
                        {saving ? t("cooperative.profile.saving") : t("cooperative.profile.save")}
                      </Button>
                      <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
                        {t("cooperative.profile.cancel")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{t("cooperative.profile.contactEmail")}</p>
                      <p className="mt-0.5 text-sm font-medium break-words">{dash(profile.contactEmail)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{t("cooperative.profile.contactPhone")}</p>
                      <p className="mt-0.5 text-sm font-medium">{dash(profile.contactPhone)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{t("cooperative.profile.location")}</p>
                      <p className="mt-0.5 text-sm font-medium">{dash(profile.location)}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs font-medium text-muted-foreground">{t("cooperative.profile.description")}</p>
                      <p className="mt-0.5 text-sm leading-6">{dash(profile.description)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
