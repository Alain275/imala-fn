import { useEffect, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Wheat, Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight,
  Leaf, Clock,
} from "lucide-react"
import { toast } from "sonner"
import { adminService, type Crop, type CropInput, type CropCategory } from "@/services/adminMock"

const CATEGORIES: CropCategory[] = ['cereal', 'legume', 'vegetable', 'tuber', 'fruit', 'cash crop']

const CATEGORY_BADGE: Record<CropCategory, string> = {
  cereal: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  legume: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  vegetable: 'bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-200 dark:border-lime-800/40',
  tuber: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40',
  fruit: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
  'cash crop': 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/40',
}

// CropCategory 'cash crop' contains a space and isn't a valid template-literal-safe
// object key segment, so we map each category to a camelCase i18n key segment.
const CATEGORY_KEY_MAP: Record<CropCategory, string> = {
  cereal: 'cereal',
  legume: 'legume',
  vegetable: 'vegetable',
  tuber: 'tuber',
  fruit: 'fruit',
  'cash crop': 'cashCrop',
}

const EMPTY_FORM: CropInput = {
  name: '',
  scientificName: '',
  category: 'cereal',
  growingSeason: '',
  growthDurationDays: 90,
  description: '',
  status: 'active',
}

const PAGE_SIZE = 10

export default function AdminCropsPage() {
  const { t } = useTranslation()
  const [crops, setCrops] = useState<Crop[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CropCategory | 'all'>('all')
  const [page, setPage] = useState(1)

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Crop | null>(null)
  const [form, setForm] = useState<CropInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Crop | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    adminService.getCrops({ page, pageSize: PAGE_SIZE, search, category: categoryFilter })
      .then(({ data, total }) => { setCrops(data); setTotal(total) })
      .catch(() => toast.error(t('admin.crops.toast.loadFailed')))
      .finally(() => setLoading(false))
  }, [page, search, categoryFilter, t])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search, categoryFilter])

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (crop: Crop) => {
    setEditTarget(crop)
    setForm({
      name: crop.name,
      scientificName: crop.scientificName ?? '',
      category: crop.category,
      growingSeason: crop.growingSeason,
      growthDurationDays: crop.growthDurationDays,
      description: crop.description ?? '',
      status: crop.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.growingSeason.trim() || !form.growthDurationDays) {
      toast.warning(t('admin.crops.toast.validationRequired'))
      return
    }
    setSaving(true)
    try {
      if (editTarget) {
        await adminService.updateCrop(editTarget.id, form)
        toast.success(t('admin.crops.toast.updated', { name: form.name }))
      } else {
        await adminService.createCrop(form)
        toast.success(t('admin.crops.toast.added', { name: form.name }))
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error(t('admin.crops.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminService.deleteCrop(deleteTarget.id)
      toast.success(t('admin.crops.toast.deleted', { name: deleteTarget.name }))
      setDeleteTarget(null)
      load()
    } catch {
      toast.error(t('admin.crops.toast.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background">
      <Header title={t('admin.crops.title')} subtitle={t('admin.crops.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder={t('admin.crops.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...CATEGORIES] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors capitalize ${
                  categoryFilter === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {cat === 'all' ? t('common.activeStatus.all') : t(`admin.crops.category.${CATEGORY_KEY_MAP[cat]}`)}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={openCreate} className="gap-2 sm:ml-auto">
            <Plus className="w-4 h-4" />
            {t('admin.crops.addCropButton')}
          </Button>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-md">
          <CardHeader className="border-b border-border py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wheat className="w-4 h-4 text-emerald-500" />
              {t('admin.crops.tableTitle')}
            </CardTitle>
            <CardDescription>
              {categoryFilter !== 'all' && search
                ? t('admin.crops.summary.totalInCategoryMatching', { count: total, category: t(`admin.crops.category.${CATEGORY_KEY_MAP[categoryFilter]}`), search })
                : categoryFilter !== 'all'
                  ? t('admin.crops.summary.totalInCategory', { count: total, category: t(`admin.crops.category.${CATEGORY_KEY_MAP[categoryFilter]}`) })
                  : search
                    ? t('admin.crops.summary.totalMatching', { count: total, search })
                    : t('admin.crops.summary.total', { count: total })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
              </div>
            ) : crops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Leaf className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="font-semibold text-foreground">{t('admin.crops.empty.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('admin.crops.empty.description')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/20">
                        <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.crops.columns.crop')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.crops.columns.category')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">{t('admin.crops.columns.growingSeason')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">{t('admin.crops.columns.duration')}</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('admin.crops.columns.status')}</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {crops.map(crop => (
                        <tr key={crop.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-semibold text-foreground">{crop.name}</p>
                              {crop.scientificName && (
                                <p className="text-xs text-muted-foreground italic mt-0.5">{crop.scientificName}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[11px] px-2 py-0.5 rounded border font-medium capitalize ${CATEGORY_BADGE[crop.category]}`}>
                              {t(`admin.crops.category.${CATEGORY_KEY_MAP[crop.category]}`)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground hidden md:table-cell">{crop.growingSeason}</td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              {t('admin.crops.durationDays', { count: crop.growthDurationDays })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              crop.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                              {t(`common.activeStatus.${crop.status}`)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(crop)}>{t('common.actions.edit')}</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(crop)}
                                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600"
                                >
                                  {t('common.actions.delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {t('admin.crops.pagination.showing', { from: (page - 1) * PAGE_SIZE + 1, to: Math.min(page * PAGE_SIZE, total), total })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-xs font-medium">{page} / {totalPages}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { if (!open) setDialogOpen(false) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? t('admin.crops.dialog.editTitle') : t('admin.crops.dialog.createTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.commonNameLabel')}</Label>
                <Input
                  placeholder={t('admin.crops.dialog.commonNamePlaceholder')}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.scientificNameLabel')}</Label>
                <Input
                  placeholder={t('admin.crops.dialog.scientificNamePlaceholder')}
                  value={form.scientificName ?? ''}
                  onChange={e => setForm(f => ({ ...f, scientificName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.categoryLabel')}</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as CropCategory }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat} className="capitalize">{t(`admin.crops.category.${CATEGORY_KEY_MAP[cat]}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.statusLabel')}</Label>
                <div className="flex items-center gap-2 h-10">
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
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.growingSeasonLabel')}</Label>
                <Input
                  placeholder={t('admin.crops.dialog.growingSeasonPlaceholder')}
                  value={form.growingSeason}
                  onChange={e => setForm(f => ({ ...f, growingSeason: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('admin.crops.dialog.growthDurationLabel')}</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.growthDurationDays}
                  onChange={e => setForm(f => ({ ...f, growthDurationDays: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t('admin.crops.dialog.descriptionLabel')}</Label>
                <Input
                  placeholder={t('admin.crops.dialog.descriptionPlaceholder')}
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.actions.cancel')}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('common.actions.saving') : editTarget ? t('common.actions.save') : t('admin.crops.dialog.addSubmit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.crops.deleteDialog.title', { name: deleteTarget?.name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.crops.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deleting ? t('admin.crops.deleteDialog.deleting') : t('admin.crops.deleteDialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
