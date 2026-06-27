import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
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
  MapPin, Search, MoreHorizontal, Eye, PhoneCall,
  CheckCircle2, TrendingUp, TrendingDown, Minus,
  Sprout, Filter,
} from "lucide-react"
import { toast } from "sonner"
import {
  cooperativeService, type CooperativeFarm, type FarmStatus,
} from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

type StatusFilter = 'all' | FarmStatus | 'pending'

const STATUS_STYLE: Record<FarmStatus, { badge: string; dot: string }> = {
  good:     { badge: 'bg-green-500/15 text-green-500 border-green-500/30',   dot: 'bg-green-500'  },
  fair:     { badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',      dot: 'bg-blue-500'   },
  low:      { badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',   dot: 'bg-amber-500'  },
  inactive: { badge: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',      dot: 'bg-zinc-500'   },
}

const REVIEW_STATUSES: FarmStatus[] = ['good', 'fair', 'low', 'inactive']

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function FarmCardSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-none">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-1.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-3 w-20" /></div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-3 w-36" />
        <div className="flex gap-2"><Skeleton className="h-5 w-14 rounded-full" /><Skeleton className="h-5 w-14 rounded-full" /></div>
        <div className="flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-16" /></div>
      </CardContent>
    </Card>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeFarmsPage() {
  const { t } = useTranslation()
  const [farms, setFarms]           = useState<CooperativeFarm[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState<StatusFilter>('all')
  const [reviewFarm, setReviewFarm] = useState<CooperativeFarm | null>(null)
  const [reviewStatus, setReviewStatus] = useState<FarmStatus>('good')
  const [contactFarm, setContactFarm]   = useState<CooperativeFarm | null>(null)
  const [savingReview, setSavingReview] = useState(false)

  useEffect(() => {
    cooperativeService.getFarms()
      .then(setFarms)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total:    farms.length,
    good:     farms.filter(f => f.status === 'good').length,
    fair:     farms.filter(f => f.status === 'fair').length,
    low:      farms.filter(f => f.status === 'low').length,
    inactive: farms.filter(f => f.status === 'inactive').length,
    pending:  farms.filter(f => f.pendingReview).length,
  }

  const visible = farms.filter(f => {
    const q = search.toLowerCase()
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.farmerName.toLowerCase().includes(q) || f.location.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'pending' ? f.pendingReview :
      f.status === filter
    return matchSearch && matchFilter
  })

  async function handleReviewSave() {
    if (!reviewFarm) return
    setSavingReview(true)
    try {
      // TODO: PATCH /api/cooperative/farms/:id/status
      await cooperativeService.updateFarmStatus(reviewFarm.id, reviewStatus)
      setFarms(prev => prev.map(f =>
        f.id === reviewFarm.id ? { ...f, status: reviewStatus, pendingReview: false } : f
      ))
      toast.success(t('cooperative.farms.reviewSaved'))
      setReviewFarm(null)
    } catch {
      toast.error(t('cooperative.farms.reviewError'))
    } finally {
      setSavingReview(false)
    }
  }

  const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all',      label: t('cooperative.farms.filterAll'),      count: stats.total    },
    { key: 'pending',  label: t('cooperative.farms.filterPending'),  count: stats.pending  },
    { key: 'good',     label: t('cooperative.farms.filterGood'),     count: stats.good     },
    { key: 'fair',     label: t('cooperative.farms.filterFair'),     count: stats.fair     },
    { key: 'low',      label: t('cooperative.farms.filterLow'),      count: stats.low      },
    { key: 'inactive', label: t('cooperative.farms.filterInactive'), count: stats.inactive },
  ]

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.farms.title')} subtitle={t('cooperative.farms.subtitle')} />

      <div className="p-6 space-y-5">

        {/* ── Stat pills ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: t('cooperative.farms.statTotal'),    value: 47,              color: 'text-foreground'       },
            { label: t('cooperative.farms.statGood'),     value: stats.good,      color: 'text-green-500'        },
            { label: t('cooperative.farms.statFair'),     value: stats.fair,      color: 'text-blue-500'         },
            { label: t('cooperative.farms.statLow'),      value: stats.low,       color: 'text-amber-500'        },
            { label: t('cooperative.farms.statInactive'), value: stats.inactive,  color: 'text-zinc-500'         },
            { label: t('cooperative.farms.statPending'),  value: stats.pending,   color: 'text-orange-500'       },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
              <span className={cn("text-base font-bold", s.color)}>{s.value}</span>
              <span className="text-[12px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Search + filter ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('cooperative.farms.searchPlaceholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground mr-1 flex-shrink-0" />
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                  filter === tab.key
                    ? "bg-green-500 text-black border-green-500"
                    : "bg-card text-muted-foreground border-border hover:border-green-500/50 hover:text-foreground"
                )}
              >
                {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Farm grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <FarmCardSkeleton key={i} />)}
          </div>
        ) : visible.length === 0 ? (
          <Card className="border border-border bg-card shadow-none">
            <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
              <Sprout className="w-10 h-10 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">{t('cooperative.farms.noResults')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {visible.map(farm => {
              const style = STATUS_STYLE[farm.status]
              return (
                <Card key={farm.id} className="border border-border bg-card shadow-none hover:border-green-500/30 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {getInitials(farm.farmerName)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-foreground truncate">{farm.name}</p>
                          <p className="text-[12px] text-muted-foreground truncate">{farm.farmerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {farm.pendingReview && (
                          <Badge className="bg-orange-500/15 text-orange-500 border-orange-500/30 text-[11px]">
                            {t('cooperative.farms.pendingBadge')}
                          </Badge>
                        )}
                        <Badge className={cn("text-[11px] capitalize border", style.badge)}>
                          {t(`cooperative.farms.status.${farm.status}`)}
                        </Badge>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{farm.location}</span>
                      <span className="text-border">·</span>
                      <span>{farm.sizeHa} ha</span>
                    </div>

                    {/* Crops */}
                    <div className="flex flex-wrap gap-1.5">
                      {farm.crops.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-full bg-background border border-border text-[11px] text-muted-foreground">{c}</span>
                      ))}
                    </div>

                    {/* Yield */}
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-muted-foreground">{t('cooperative.farms.lastYield')}: <span className="text-foreground font-semibold">{farm.lastYieldTons}t</span></span>
                      <div className={cn("flex items-center gap-1 font-semibold", farm.yieldChange >= 0 ? 'text-green-500' : 'text-red-500')}>
                        {farm.yieldChange > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : farm.yieldChange < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                        {farm.yieldChange > 0 ? '+' : ''}{farm.yieldChange}%
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">{t('cooperative.farms.lastActive')}: {farm.lastActivity}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                          <DropdownMenuItem
                            className="gap-2 hover:bg-muted cursor-pointer"
                            onClick={() => toast.info(`${t('cooperative.farms.viewDetails')}: ${farm.name}`)}
                          >
                            <Eye className="w-4 h-4 text-blue-500" />
                            {t('cooperative.farms.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 hover:bg-muted cursor-pointer"
                            onClick={() => { setReviewFarm(farm); setReviewStatus(farm.status) }}
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {t('cooperative.farms.reviewStatus')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border" />
                          <DropdownMenuItem
                            className="gap-2 hover:bg-muted cursor-pointer"
                            onClick={() => setContactFarm(farm)}
                          >
                            <PhoneCall className="w-4 h-4 text-amber-500" />
                            {t('cooperative.farms.contactFarmer')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Review Status Dialog ──────────────────────────────────────────────── */}
      <Dialog open={!!reviewFarm} onOpenChange={open => !open && setReviewFarm(null)}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('cooperative.farms.reviewDialog.title')}</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-muted-foreground">{reviewFarm?.name} — {reviewFarm?.farmerName}</p>
          <div className="space-y-2 py-2">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wider">{t('cooperative.farms.reviewDialog.selectStatus')}</p>
            {REVIEW_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setReviewStatus(s)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                  reviewStatus === s
                    ? "border-green-500 bg-green-500/10"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <span className={cn("w-3 h-3 rounded-full", STATUS_STYLE[s].dot)} />
                <span className="text-[14px] capitalize text-foreground">{t(`cooperative.farms.status.${s}`)}</span>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setReviewFarm(null)}>
              {t('common.actions.cancel')}
            </Button>
            <Button
              disabled={savingReview}
              onClick={handleReviewSave}
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              {savingReview ? t('common.actions.saving') : t('common.actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Contact Farmer Dialog ─────────────────────────────────────────────── */}
      <AlertDialog open={!!contactFarm} onOpenChange={open => !open && setContactFarm(null)}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">{t('cooperative.farms.contactDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2 pt-2">
              <span className="block text-foreground font-semibold text-[15px]">{contactFarm?.farmerName}</span>
              <span className="block">{contactFarm?.location}</span>
              <span className="block text-lg font-semibold text-green-500">{contactFarm?.phone}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border text-foreground hover:bg-muted/80">
              {t('common.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              onClick={() => { window.open(`tel:${contactFarm?.phone}`); setContactFarm(null) }}
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              {t('cooperative.farms.contactDialog.call')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
