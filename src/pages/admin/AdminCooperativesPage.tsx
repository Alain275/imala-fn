import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Building2, Users, MapPin, Mail, MoreHorizontal,
  CheckCircle, XCircle, Plus, Phone, UserCheck,
} from "lucide-react"
import { toast } from "sonner"
import { adminService, type Cooperative, type CooperativeInput } from "@/services/adminMock"

const EMPTY_FORM: CooperativeInput = {
  name: '',
  location: '',
  memberCapacity: 100,
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  status: 'active',
  notes: '',
}

export default function AdminCooperativesPage() {
  const { t } = useTranslation()
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Cooperative | null>(null)
  const [form, setForm] = useState<CooperativeInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Cooperative | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    adminService.getCooperatives()
      .then(setCooperatives)
      .catch(() => toast.error(t('admin.cooperatives.toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => { load() }, [load])

  const active = cooperatives.filter(c => c.status === 'active').length
  const totalMembers = cooperatives.reduce((s, c) => s + c.memberCount, 0)

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (coop: Cooperative) => {
    setEditTarget(coop)
    setForm({
      name: coop.name,
      location: coop.location,
      memberCapacity: coop.memberCapacity,
      contactPerson: coop.contactPerson,
      contactPhone: coop.contactPhone,
      contactEmail: coop.contactEmail,
      status: coop.status,
      notes: coop.notes ?? '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.location.trim() || !form.contactPerson.trim() || !form.contactEmail.trim()) {
      toast.warning(t('admin.cooperatives.toast.validationRequired'))
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await adminService.updateCooperative(editTarget.id, form)
        toast.success(t('admin.cooperatives.toast.updated', { name: form.name }))
      } else {
        await adminService.createCooperative(form)
        toast.success(t('admin.cooperatives.toast.registered', { name: form.name }))
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error(t('admin.cooperatives.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (coop: Cooperative) => {
    try {
      const next = coop.status === 'active' ? 'inactive' : 'active'
      await adminService.updateCooperative(coop.id, { status: next })
      toast.success(
        next === 'active'
          ? t('admin.cooperatives.toast.activated', { name: coop.name })
          : t('admin.cooperatives.toast.deactivated', { name: coop.name })
      )
      load()
    } catch {
      toast.error(t('admin.cooperatives.toast.statusUpdateFailed'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteCooperative(deleteTarget.id)
      toast.success(t('admin.cooperatives.toast.deleted', { name: deleteTarget.name }))
      setDeleteTarget(null)
      load()
    } catch {
      toast.error(t('admin.cooperatives.toast.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.cooperatives.title')} subtitle={t('admin.cooperatives.subtitle')} />

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('admin.cooperatives.kpis.total'), value: loading ? '—' : cooperatives.length, gradient: "gold" as const, icon: Building2 },
            { label: t('admin.cooperatives.kpis.active'), value: loading ? '—' : active, gradient: "green" as const, icon: CheckCircle },
            { label: t('admin.cooperatives.kpis.totalMembers'), value: loading ? '—' : totalMembers.toLocaleString(), gradient: "sky" as const, icon: Users },
          ].map(k => (
            <Card key={k.label} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-4">
                <Icon3D gradient={k.gradient} size="md">
                  <k.icon className="w-5 h-5" />
                </Icon3D>
                <div>
                  <p className="text-2xl font-black text-foreground">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cooperative list */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4" />
                  {t('admin.cooperatives.listTitle')}
                </CardTitle>
                <CardDescription>{t('admin.cooperatives.listDescription')}</CardDescription>
              </div>
              <Button size="sm" onClick={openCreate} className="gap-2">
                <Plus className="w-4 h-4" />
                {t('admin.cooperatives.registerButton')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : cooperatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Building2 className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-foreground font-semibold">{t('admin.cooperatives.empty.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('admin.cooperatives.empty.description')}</p>
                <Button className="mt-4" size="sm" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" /> {t('admin.cooperatives.registerButton')}
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {cooperatives.map(coop => (
                  <div key={coop.id} className="flex items-start gap-4 px-6 py-5 hover:bg-muted/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{coop.name}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                          coop.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {t(`common.activeStatus.${coop.status}`)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{coop.location}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{t('admin.cooperatives.membersCount', { count: coop.memberCount, capacity: coop.memberCapacity })}</span>
                        <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{coop.contactPerson}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{coop.contactPhone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{coop.contactEmail}</span>
                      </div>
                      {coop.notes && (
                        <p className="text-xs text-muted-foreground/70 mt-1 italic">{coop.notes}</p>
                      )}
                    </div>
                    <div className="text-right mr-2 flex-shrink-0">
                      <p className="text-xs text-muted-foreground">{t('admin.cooperatives.joinedLabel')}</p>
                      <p className="text-xs font-medium text-foreground">{coop.joinedAt}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(coop)}>
                          {t('admin.cooperatives.actions.editDetails')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(coop)}>
                          {coop.status === 'active' ? (
                            <><XCircle className="w-4 h-4 mr-2 text-rose-500" /> {t('admin.cooperatives.actions.deactivate')}</>
                          ) : (
                            <><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> {t('admin.cooperatives.actions.activate')}</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(coop)}
                          className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                        >
                          {t('common.actions.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) setDialogOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t('admin.cooperatives.dialog.editTitle') : t('admin.cooperatives.dialog.createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.nameLabel')}</Label>
                <Input
                  placeholder={t('admin.cooperatives.dialog.namePlaceholder')}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.locationLabel')}</Label>
                <Input
                  placeholder={t('admin.cooperatives.dialog.locationPlaceholder')}
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.contactPersonLabel')}</Label>
                <Input
                  placeholder={t('admin.cooperatives.dialog.contactPersonPlaceholder')}
                  value={form.contactPerson}
                  onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.memberCapacityLabel')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.memberCapacity}
                  onChange={e => setForm(f => ({ ...f, memberCapacity: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.contactPhoneLabel')}</Label>
                <Input
                  placeholder={t('admin.cooperatives.dialog.contactPhonePlaceholder')}
                  value={form.contactPhone}
                  onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.contactEmailLabel')}</Label>
                <Input
                  type="email"
                  placeholder={t('admin.cooperatives.dialog.contactEmailPlaceholder')}
                  value={form.contactEmail}
                  onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.statusLabel')}</Label>
                <div className="flex items-center gap-3">
                  {(['active', 'inactive'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        form.status === s
                          ? s === 'active'
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                            : 'bg-muted border-border text-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t(`common.activeStatus.${s}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t('admin.cooperatives.dialog.notesLabel')}</Label>
                <Input
                  placeholder={t('admin.cooperatives.dialog.notesPlaceholder')}
                  value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('common.actions.saving') : editTarget ? t('common.actions.save') : t('admin.cooperatives.dialog.registerSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.cooperatives.deleteDialog.title', { name: deleteTarget?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.cooperatives.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? t('admin.cooperatives.deleteDialog.deleting') : t('admin.cooperatives.deleteDialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
