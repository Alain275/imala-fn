import { useEffect, useState, useCallback } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Lightbulb, Sprout, Scissors, Package2,
  CheckCircle2, XCircle, Clock, TrendingUp, Leaf,
} from "lucide-react"
import { toast } from "sonner"
import { adminAiService, type OptimizationSuggestion, type OptimizationType, type OptimizationStatus } from "@/services/adminAiMock"

const TYPE_CONFIG: Record<OptimizationType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  planting: { label: 'Planting', icon: Sprout, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  harvesting: { label: 'Harvesting', icon: Scissors, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  resource: { label: 'Resource', icon: Package2, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
}

const STATUS_BADGE: Record<OptimizationStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
  applied: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
  dismissed: 'bg-muted text-muted-foreground border-border',
}

type FilterStatus = 'all' | OptimizationStatus
type FilterType = 'all' | OptimizationType

const STATUS_FILTERS: FilterStatus[] = ['all', 'pending', 'applied', 'dismissed']
const TYPE_FILTERS: FilterType[] = ['all', 'planting', 'harvesting', 'resource']

function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 85 ? '#10b981' : value >= 70 ? '#f59e0b' : '#0ea5e9'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{value}%</span>
    </div>
  )
}

function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
  busy,
}: {
  suggestion: OptimizationSuggestion
  onApply: (id: string) => void
  onDismiss: (id: string) => void
  busy: string | null
}) {
  const tc = TYPE_CONFIG[suggestion.type]
  const TypeIcon = tc.icon
  const isPending = suggestion.status === 'pending'
  const isApplied = suggestion.status === 'applied'
  const isBusy = busy === suggestion.id

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        {/* Type stripe */}
        <div className={`flex items-center gap-3 px-5 py-3 border-b border-border ${suggestion.status !== 'pending' ? 'opacity-60' : ''}`}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${tc.bg}`}>
            <TypeIcon className={`w-4 h-4 ${tc.color}`} />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wide ${tc.color}`}>{tc.label}</span>
            {suggestion.crop && (
              <>
                <span className="text-muted-foreground text-[10px]">·</span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Leaf className="w-3 h-3" />
                  {suggestion.crop}
                </span>
              </>
            )}
          </div>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${STATUS_BADGE[suggestion.status]}`}>
            {suggestion.status}
          </span>
        </div>

        <div className="p-5 space-y-3">
          <h3 className="font-semibold text-foreground text-sm leading-snug">{suggestion.title}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.rationale}</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-0.5">Confidence</p>
              <ConfidenceBar value={suggestion.confidence} />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Expected Impact</p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                {suggestion.expectedImpact}
              </p>
            </div>
            {suggestion.window && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Action Window</p>
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500" />
                  {suggestion.window.start} → {suggestion.window.end}
                </p>
              </div>
            )}
          </div>

          {isPending && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/40 dark:hover:bg-emerald-950/20"
                onClick={() => onApply(suggestion.id)}
                disabled={isBusy}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400">{isBusy ? 'Applying…' : 'Apply'}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20"
                onClick={() => onDismiss(suggestion.id)}
                disabled={isBusy}
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600 dark:text-rose-400" />
                <span className="text-rose-700 dark:text-rose-400">Dismiss</span>
              </Button>
            </div>
          )}

          {isApplied && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Applied — shared with relevant agronomists
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AiOptimizationPage() {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('pending')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    adminAiService.getOptimizationSuggestions()
      .then(setSuggestions)
      .catch(() => toast.error('Failed to load optimization suggestions'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleApply = async (id: string) => {
    setBusy(id)
    try {
      const updated = await adminAiService.applyOptimization(id)
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s))
      toast.success('Suggestion applied — shared with agronomists.')
    } catch {
      toast.error('Failed to apply suggestion.')
    } finally {
      setBusy(null)
    }
  }

  const handleDismiss = async (id: string) => {
    setBusy(id)
    try {
      const updated = await adminAiService.dismissOptimization(id)
      setSuggestions(prev => prev.map(s => s.id === id ? updated : s))
      toast.info('Suggestion dismissed.')
    } catch {
      toast.error('Failed to dismiss suggestion.')
    } finally {
      setBusy(null)
    }
  }

  const filtered = suggestions
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s => typeFilter === 'all' || s.type === typeFilter)

  const pendingCount = suggestions.filter(s => s.status === 'pending').length

  const kpis = [
    { label: "Total Suggestions", value: suggestions.length, gradient: "gold" as const, icon: Lightbulb },
    { label: "Pending Action", value: pendingCount, gradient: "leaf" as const, icon: Clock },
    { label: "Applied", value: suggestions.filter(s => s.status === 'applied').length, gradient: "green" as const, icon: CheckCircle2 },
    { label: "Avg Confidence", value: suggestions.length ? `${Math.round(suggestions.reduce((a, s) => a + s.confidence, 0) / suggestions.length)}%` : '—', gradient: "sky" as const, icon: TrendingUp },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header title="Optimization Suggestions" subtitle="AI-powered planting, harvesting, and resource recommendations" />

      <div className="p-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4"><Skeleton className="h-16 rounded-xl" /></CardContent>
              </Card>
            ))
            : kpis.map(k => (
              <Card key={k.label} className="border-0 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    k.gradient === 'gold' ? 'bg-amber-500/15' :
                    k.gradient === 'green' ? 'bg-emerald-500/15' :
                    k.gradient === 'sky' ? 'bg-sky-500/15' : 'bg-teal-500/15'
                  }`}>
                    <k.icon className={`w-5 h-5 ${
                      k.gradient === 'gold' ? 'text-amber-500' :
                      k.gradient === 'green' ? 'text-emerald-500' :
                      k.gradient === 'sky' ? 'text-sky-500' : 'text-teal-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{k.value}</p>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Suggestions
            </CardTitle>
            <CardDescription>{filtered.length} suggestions match current filters</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Status:</span>
                {STATUS_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors capitalize ${
                      statusFilter === f
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Type:</span>
                {TYPE_FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors capitalize ${
                      typeFilter === f
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
                <p className="font-semibold text-foreground">No suggestions match</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting the filters above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map(s => (
                  <SuggestionCard
                    key={s.id}
                    suggestion={s}
                    onApply={handleApply}
                    onDismiss={handleDismiss}
                    busy={busy}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
