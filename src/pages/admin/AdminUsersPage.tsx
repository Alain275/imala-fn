import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search, MoreHorizontal, UserCheck, UserX, Trash2, Edit3,
  ChevronLeft, ChevronRight, Users,
} from "lucide-react"
import { toast } from "sonner"
import { adminService, type AdminUser } from "@/services/adminMock"

type RoleFilter = 'all' | AdminUser['role']
type StatusFilter = 'all' | 'active' | 'inactive'

const ROLE_BADGE: Record<AdminUser['role'], string> = {
  farmer: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  agronomist: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/40",
  admin: "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/40",
  cooperative: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

const ROLES: RoleFilter[] = ['all', 'farmer', 'agronomist', 'admin', 'cooperative']

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editRole, setEditRole] = useState<AdminUser['role']>('farmer')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    adminService.getUsers({ page, pageSize, search, role, status })
      .then(({ data, total }) => { setUsers(data); setTotal(total) })
      .catch(() => toast.error(t('admin.users.toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [page, pageSize, search, role, status, t])

  useEffect(() => { load() }, [load])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, role, status])

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminService.setUserActive(user.id, user.status === 'inactive')
      toast.success(
        user.status === 'inactive'
          ? t('admin.users.toast.activated', { name: user.name })
          : t('admin.users.toast.deactivated', { name: user.name })
      )
      load()
    } catch {
      toast.error(t('admin.users.toast.actionFailed'))
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await adminService.deleteUser(deleteTarget.id)
      toast.success(t('admin.users.toast.deleted', { name: deleteTarget.name }))
      setDeleteTarget(null)
      load()
    } catch {
      toast.error(t('admin.users.toast.deleteFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditRole = async () => {
    if (!editTarget) return
    setActionLoading(true)
    try {
      await adminService.updateUserRole(editTarget.id, editRole)
      toast.success(t('admin.users.toast.roleUpdated', { name: editTarget.name, role: t(`common.role.${editRole}`) }))
      setEditTarget(null)
      load()
    } catch {
      toast.error(t('admin.users.toast.roleUpdateFailed'))
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.users.title')} subtitle={t('admin.users.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.users.searchPlaceholder')}
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    role === r
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {r === 'all' ? t('admin.users.allRoles') : t(`common.role.${r}`)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'active', 'inactive'] as StatusFilter[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    status === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                  }`}
                >
                  {t(`common.activeStatus.${s}`)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              {t('admin.users.tableTitle')}
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <div className="p-4">
              <TableSkeleton />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">{t('admin.users.empty.title')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('admin.users.empty.description')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.users.columns.user')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.users.columns.role')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.users.columns.status')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.users.columns.joined')}</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.users.columns.lastLogin')}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(user.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${ROLE_BADGE[user.role]}`}>
                          {t(`common.role.${user.role}`, { defaultValue: user.role })}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {t(`common.activeStatus.${user.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">{user.joinedAt}</td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">{user.lastLogin}</td>
                      <td className="px-4 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditTarget(user); setEditRole(user.role) }}>
                              <Edit3 className="w-4 h-4 mr-2" /> {t('admin.users.actions.editRole')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.status === 'active'
                                ? <><UserX className="w-4 h-4 mr-2" /> {t('admin.users.actions.deactivate')}</>
                                : <><UserCheck className="w-4 h-4 mr-2" /> {t('admin.users.actions.activate')}</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> {t('common.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {t('admin.users.pagination.showing', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total })}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-foreground font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.users.editRoleDialog.title', { name: editTarget?.name })}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">{t('admin.users.editRoleDialog.prompt')}</p>
            <div className="grid grid-cols-2 gap-2">
              {(['farmer', 'agronomist', 'admin', 'cooperative'] as AdminUser['role'][]).map(r => (
                <button
                  key={r}
                  onClick={() => setEditRole(r)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                    editRole === r
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`common.role.${r}`)}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleEditRole} disabled={actionLoading || editRole === editTarget?.role}>
              {actionLoading ? t('common.actions.saving') : t('admin.users.editRoleDialog.saveRole')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.users.deleteDialog.title', { name: deleteTarget?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.users.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {actionLoading ? t('admin.users.deleteDialog.deleting') : t('common.actions.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
