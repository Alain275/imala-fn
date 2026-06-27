import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Search, UserPlus, MoreHorizontal, PhoneCall, MapPin,
  Trash2, Users, ShieldCheck, Landmark, User,
} from "lucide-react"
import { toast } from "sonner"
import {
  cooperativeService, type CooperativeMember, type MemberRole, type NewMemberData,
} from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<MemberRole, { badge: string; icon: React.ElementType; color: string }> = {
  leader:    { badge: 'bg-green-500/15 text-green-500 border-green-500/30',   icon: ShieldCheck, color: 'text-green-500'  },
  treasurer: { badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',      icon: Landmark,    color: 'text-blue-500'   },
  secretary: { badge: 'bg-purple-500/15 text-purple-500 border-purple-500/30',icon: User,        color: 'text-purple-500' },
  member:    { badge: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',      icon: Users,       color: 'text-muted-foreground' },
}

const ROLES: MemberRole[] = ['leader', 'treasurer', 'secretary', 'member']

const EMPTY_FORM: NewMemberData = { name: '', phone: '', email: '', location: '', role: 'member' }

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-border">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-32" /><Skeleton className="h-3 w-48" /></div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeMembersPage() {
  const { t } = useTranslation()
  const [members, setMembers]         = useState<CooperativeMember[]>([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [addOpen, setAddOpen]         = useState(false)
  const [form, setForm]               = useState<NewMemberData>(EMPTY_FORM)
  const [saving, setSaving]           = useState(false)
  const [removeTarget, setRemoveTarget] = useState<CooperativeMember | null>(null)
  const [removing, setRemoving]       = useState(false)
  const [contactTarget, setContactTarget] = useState<CooperativeMember | null>(null)

  useEffect(() => {
    cooperativeService.getMembers()
      .then(setMembers)
      .finally(() => setLoading(false))
  }, [])

  const visible = members.filter(m => {
    const q = search.toLowerCase()
    return !q || m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q) || m.role.includes(q)
  })

  const stats = {
    total:    members.length,
    active:   members.filter(m => m.status === 'active').length,
    farms:    members.reduce((sum, m) => sum + m.farmsCount, 0),
  }

  function handleFormChange(key: keyof NewMemberData, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleAddMember() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error(t('cooperative.members.addDialog.validation'))
      return
    }
    setSaving(true)
    try {
      // TODO: POST /api/cooperative/members
      const newM = await cooperativeService.addMember(form)
      setMembers(prev => [...prev, newM])
      setForm(EMPTY_FORM)
      setAddOpen(false)
      toast.success(t('cooperative.members.addSuccess'))
    } catch {
      toast.error(t('cooperative.members.addError'))
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveMember() {
    if (!removeTarget) return
    setRemoving(true)
    try {
      // TODO: DELETE /api/cooperative/members/:id
      await cooperativeService.removeMember(removeTarget.id)
      setMembers(prev => prev.filter(m => m.id !== removeTarget.id))
      setRemoveTarget(null)
      toast.success(t('cooperative.members.removeSuccess'))
    } catch {
      toast.error(t('cooperative.members.removeError'))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.members.title')} subtitle={t('cooperative.members.subtitle')} />

      <div className="p-6 space-y-5">

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t('cooperative.members.statTotal'),  value: stats.total,  className: 'text-foreground' },
            { label: t('cooperative.members.statActive'), value: stats.active, className: 'text-green-500'  },
            { label: t('cooperative.members.statFarms'),  value: stats.farms,  className: 'text-sky-500'    },
          ].map(s => (
            <Card key={s.label} className="border border-border bg-card shadow-none">
              <CardContent className="p-4 text-center">
                <p className={cn("text-[28px] font-bold", s.className)}>{s.value}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Search + Add ───────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('cooperative.members.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-green-500"
            />
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-black font-semibold gap-2 flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            {t('cooperative.members.addBtn')}
          </Button>
        </div>

        {/* ── Members list ───────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader className="pb-0">
            <CardTitle className="text-[16px] text-foreground font-semibold">
              {t('cooperative.members.listTitle')} <span className="text-muted-foreground font-normal ml-1">({visible.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <MemberSkeleton key={i} />)
            ) : visible.length === 0 ? (
              <div className="py-16 flex flex-col items-center gap-3 text-center">
                <Users className="w-10 h-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">{t('cooperative.members.noResults')}</p>
              </div>
            ) : (
              visible.map(member => {
                const rs = ROLE_STYLES[member.role]
                const RoleIcon = rs.icon
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {getInitials(member.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-foreground truncate">{member.name}</p>
                      <div className="flex items-center gap-2 text-[12px] text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{member.location}</span>
                        <span className="text-border">·</span>
                        <span>{member.farmsCount} {t('cooperative.members.farmsLabel')}</span>
                      </div>
                    </div>

                    {/* Role badge */}
                    <Badge className={cn("text-[11px] border gap-1 hidden sm:flex", rs.badge)}>
                      <RoleIcon className="w-3 h-3" />
                      {t(`cooperative.members.role.${member.role}`)}
                    </Badge>

                    {/* Status */}
                    <Badge className={cn(
                      "text-[11px] border hidden sm:flex",
                      member.status === 'active'
                        ? 'bg-green-500/15 text-green-500 border-green-500/30'
                        : 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30'
                    )}>
                      {member.status === 'active' ? t('common.activeStatus.active') : t('common.activeStatus.inactive')}
                    </Badge>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                        <DropdownMenuItem className="gap-2 hover:bg-muted cursor-pointer" onClick={() => setContactTarget(member)}>
                          <PhoneCall className="w-4 h-4 text-amber-500" />
                          {t('cooperative.members.actionContact')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="gap-2 hover:bg-muted cursor-pointer"
                          onClick={() => toast.info(`${t('cooperative.members.actionViewFarms')}: ${member.farmsCount} ${t('cooperative.members.farmsLabel')}`)}
                        >
                          <MapPin className="w-4 h-4 text-blue-500" />
                          {t('cooperative.members.actionViewFarms')}
                        </DropdownMenuItem>
                        {member.role !== 'leader' && (
                          <>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="gap-2 hover:bg-muted cursor-pointer text-red-500 focus:text-red-500"
                              onClick={() => setRemoveTarget(member)}
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('cooperative.members.actionRemove')}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Add Member Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={open => { if (!open) { setAddOpen(false); setForm(EMPTY_FORM) } }}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('cooperative.members.addDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.members.addDialog.name')} *</label>
              <Input placeholder="Alexis Uwimana" value={form.name} onChange={e => handleFormChange('name', e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.members.addDialog.phone')} *</label>
              <Input placeholder="+250788000000" value={form.phone} onChange={e => handleFormChange('phone', e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.members.addDialog.email')}</label>
              <Input placeholder="member@coop.rw" value={form.email} onChange={e => handleFormChange('email', e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.members.addDialog.location')}</label>
              <Input placeholder="Musanze, Cyuve" value={form.location} onChange={e => handleFormChange('location', e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.members.addDialog.role')}</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => {
                  const I = ROLE_STYLES[r].icon
                  return (
                    <button
                      key={r}
                      onClick={() => handleFormChange('role', r)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-[13px] transition-all",
                        form.role === r
                          ? "border-green-500 bg-green-500/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-muted-foreground/40"
                      )}
                    >
                      <I className={cn("w-4 h-4 flex-shrink-0", ROLE_STYLES[r].color)} />
                      {t(`cooperative.members.role.${r}`)}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM) }}>
              {t('common.actions.cancel')}
            </Button>
            <Button disabled={saving} onClick={handleAddMember} className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              {saving ? t('common.actions.saving') : t('cooperative.members.addDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Contact Dialog ────────────────────────────────────────────────────── */}
      <AlertDialog open={!!contactTarget} onOpenChange={open => !open && setContactTarget(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cooperative.members.contactDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-1 pt-1">
              <span className="block text-foreground font-semibold">{contactTarget?.name}</span>
              <span className="block">{contactTarget?.location}</span>
              <span className="block text-lg font-semibold text-green-500">{contactTarget?.phone}</span>
              <span className="block text-xs">{contactTarget?.email}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              onClick={() => { window.open(`tel:${contactTarget?.phone}`); setContactTarget(null) }}
            >
              <PhoneCall className="w-4 h-4 mr-2" /> {t('cooperative.farms.contactDialog.call')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Remove Confirmation ───────────────────────────────────────────────── */}
      <AlertDialog open={!!removeTarget} onOpenChange={open => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cooperative.members.removeDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {t('cooperative.members.removeDialog.description', { name: removeTarget?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRemoveMember}
            >
              <Trash2 className="w-4 h-4 mr-2" /> {t('cooperative.members.removeDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
