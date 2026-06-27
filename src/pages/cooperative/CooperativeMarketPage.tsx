import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  TrendingUp, TrendingDown, Minus, ShoppingCart, Star,
  PhoneCall, Package, BarChart3, CheckCircle2, Clock,
} from "lucide-react"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts"
import { toast } from "sonner"
import {
  cooperativeService,
  type MarketCrop, type MarketBuyer, type MarketPriceHistory, type BulkSaleOrder,
} from "@/services/cooperativeMock"

// ─── Constants ───────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  backgroundColor: 'oklch(var(--card))',
  border: '1px solid oklch(var(--border))',
  borderRadius: '8px',
  color: 'oklch(var(--foreground))',
  fontSize: 12,
}

const DEMAND_STYLE: Record<string, { badge: string; dot: string }> = {
  high:   { badge: 'bg-green-500/15 text-green-500 border-green-500/30',   dot: 'bg-green-500'  },
  medium: { badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30',   dot: 'bg-amber-500'  },
  low:    { badge: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30',      dot: 'bg-zinc-500'   },
}

const ORDER_STATUS_STYLE: Record<string, { badge: string; icon: React.ElementType }> = {
  pending:   { badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30', icon: Clock         },
  confirmed: { badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30',   icon: CheckCircle2  },
  completed: { badge: 'bg-green-500/15 text-green-500 border-green-500/30', icon: CheckCircle2  },
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function CooperativeMarketPage() {
  const { t } = useTranslation()
  const [crops, setCrops]           = useState<MarketCrop[]>([])
  const [buyers, setBuyers]         = useState<MarketBuyer[]>([])
  const [history, setHistory]       = useState<MarketPriceHistory[]>([])
  const [orders, setOrders]         = useState<BulkSaleOrder[]>([])
  const [loading, setLoading]       = useState(true)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [bulkCrop, setBulkCrop]     = useState('')
  const [bulkQty, setBulkQty]       = useState('')
  const [bulkPrice, setBulkPrice]   = useState('')
  const [bulkBuyer, setBulkBuyer]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([
      cooperativeService.getMarketCrops(),
      cooperativeService.getMarketBuyers(),
      cooperativeService.getMarketPriceHistory(),
      cooperativeService.getBulkOrders(),
    ]).then(([c, b, h, o]) => {
      setCrops(c); setBuyers(b); setHistory(h); setOrders(o)
    }).finally(() => setLoading(false))
  }, [])

  const totalStock = crops.reduce((s, c) => s + c.ourStockTons, 0)
  const avgPriceChange = crops.length ? (crops.reduce((s, c) => s + c.change, 0) / crops.length).toFixed(1) : '0'
  const confirmedRevenue = orders
    .filter(o => o.status === 'confirmed' || o.status === 'completed')
    .reduce((s, o) => s + o.quantityTons * 1000 * o.targetPricePerKg, 0)

  function openBulkSale(crop?: MarketCrop) {
    if (crop) { setBulkCrop(crop.id); setBulkPrice(String(crop.pricePerKg)) }
    setBulkOpen(true)
  }

  async function handleBulkSubmit() {
    if (!bulkCrop || !bulkQty || !bulkBuyer) {
      toast.error(t('cooperative.market.bulkDialog.validation'))
      return
    }
    setSubmitting(true)
    try {
      // TODO: POST /api/cooperative/bulk-orders
      const cropName = crops.find(c => c.id === bulkCrop)?.name ?? bulkCrop
      const buyerName = buyers.find(b => b.id === bulkBuyer)?.companyName ?? bulkBuyer
      const order = await cooperativeService.createBulkOrder({
        crop: cropName,
        quantityTons: Number(bulkQty),
        targetPricePerKg: Number(bulkPrice),
        buyer: buyerName,
      })
      setOrders(prev => [order, ...prev])
      setBulkOpen(false); setBulkCrop(''); setBulkQty(''); setBulkPrice(''); setBulkBuyer('')
      toast.success(t('cooperative.market.bulkSubmitted'))
    } catch {
      toast.error(t('cooperative.market.bulkError'))
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCropData = crops.find(c => c.id === bulkCrop)
  const filteredBuyers = bulkCrop
    ? buyers.filter(b => b.cropsWanted.map(w => w.toLowerCase()).includes(selectedCropData?.name.toLowerCase() ?? ''))
    : buyers

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header title={t('cooperative.market.title')} subtitle={t('cooperative.market.subtitle')} />

      <div className="p-6 space-y-6">

        {/* ── KPI row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? Array.from({length:4}).map((_,i) => (
            <Card key={i} className="border border-border bg-card shadow-none">
              <CardContent className="p-5"><Skeleton className="h-8 w-16 mb-1" /><Skeleton className="h-3 w-24" /></CardContent>
            </Card>
          )) : [
            { label: t('cooperative.market.kpiStock'),     value: `${totalStock}t`,                                                          className: 'text-sky-500'    },
            { label: t('cooperative.market.kpiBuyers'),    value: buyers.filter(b=>b.verified).length,                                       className: 'text-green-500'  },
            { label: t('cooperative.market.kpiAvgChange'), value: `${avgPriceChange}%`,                                                      className: Number(avgPriceChange) >= 0 ? 'text-green-500' : 'text-red-500' },
            { label: t('cooperative.market.kpiRevenue'),   value: `${(confirmedRevenue/1000000).toFixed(1)}M RWF`,                           className: 'text-violet-500' },
          ].map(s => (
            <Card key={s.label} className="border border-border bg-card shadow-none">
              <CardContent className="p-5">
                <p className={cn("text-[26px] font-bold", s.className)}>{s.value}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Price chart + Bulk orders ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Price trend chart */}
          <Card className="lg:col-span-2 border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
                <BarChart3 className="w-5 h-5 text-green-500" />
                {t('cooperative.market.chartTitle')}
              </CardTitle>
              <CardDescription className="text-[13px] text-muted-foreground">{t('cooperative.market.chartSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-52 w-full rounded-xl" /> : (
                <>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" />
                        <XAxis dataKey="week" tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'oklch(var(--muted-foreground))', fontSize: 11 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Line type="monotone" dataKey="maize"  stroke="#22c55e" strokeWidth={2} dot={false} name="Maize (RWF/kg)"  />
                        <Line type="monotone" dataKey="beans"  stroke="#38bdf8" strokeWidth={2} dot={false} name="Beans (RWF/kg)"  />
                        <Line type="monotone" dataKey="potato" stroke="#f59e0b" strokeWidth={2} dot={false} name="Potato (RWF/kg)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-5 mt-3 flex-wrap">
                    {[['#22c55e','Maize'],['#38bdf8','Beans'],['#f59e0b','Potato']].map(([c,n]) => (
                      <div key={n} className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                        <span className="text-xs text-muted-foreground">{n}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Bulk orders */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-[16px] text-foreground">
                <span className="flex items-center gap-2"><Package className="w-5 h-5 text-violet-500" />{t('cooperative.market.ordersTitle')}</span>
                <Button size="sm" onClick={() => openBulkSale()} className="bg-green-500 hover:bg-green-600 text-black text-[12px] font-semibold h-7 px-3">
                  + {t('cooperative.market.newOrder')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-14 rounded-xl" />) :
                orders.map(order => {
                  const st = ORDER_STATUS_STYLE[order.status]
                  const StatusIcon = st.icon
                  return (
                    <div key={order.id} className="p-3 rounded-xl border border-border space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-foreground">{order.crop} — {order.quantityTons}t</span>
                        <Badge className={cn("text-[11px] border gap-1", st.badge)}>
                          <StatusIcon className="w-3 h-3" />
                          {t(`cooperative.market.orderStatus.${order.status}`)}
                        </Badge>
                      </div>
                      <p className="text-[12px] text-muted-foreground">{order.buyer}</p>
                      <p className="text-[12px] text-green-500 font-semibold">{order.targetPricePerKg} RWF/kg · {order.createdDate}</p>
                    </div>
                  )
                })
              }
            </CardContent>
          </Card>
        </div>

        {/* ── Crop prices table ──────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {t('cooperative.market.pricesTitle')}
            </CardTitle>
            <CardDescription className="text-[13px] text-muted-foreground">{t('cooperative.market.pricesSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {[t('cooperative.market.colCrop'), t('cooperative.market.colPrice'), t('cooperative.market.colChange'), t('cooperative.market.colStock'), t('cooperative.market.colDemand'), ''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({length:6}).map((_,i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({length:6}).map((_,j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}
                    </tr>
                  )) : crops.map(crop => {
                    const ds = DEMAND_STYLE[crop.demandLevel]
                    return (
                      <tr key={crop.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-foreground">{crop.name}</td>
                        <td className="px-5 py-3.5 font-semibold text-foreground">{crop.pricePerKg} <span className="text-muted-foreground font-normal">RWF/kg</span></td>
                        <td className="px-5 py-3.5">
                          <div className={cn("flex items-center gap-1 font-semibold", crop.change > 0 ? 'text-green-500' : crop.change < 0 ? 'text-red-500' : 'text-muted-foreground')}>
                            {crop.change > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : crop.change < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                            {crop.change > 0 ? '+' : ''}{crop.change}%
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-foreground">{crop.ourStockTons}t</td>
                        <td className="px-5 py-3.5">
                          <Badge className={cn("text-[11px] border", ds.badge)}>{t(`cooperative.market.demand.${crop.demandLevel}`)}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <Button size="sm" variant="outline" onClick={() => openBulkSale(crop)}
                            className="h-7 px-3 text-[12px] border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-600">
                            {t('cooperative.market.sellBtn')}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Verified Buyers ────────────────────────────────────────────── */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[16px] text-foreground">
              <ShoppingCart className="w-5 h-5 text-amber-500" />
              {t('cooperative.market.buyersTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? Array.from({length:4}).map((_,i) => <Skeleton key={i} className="h-28 rounded-xl" />) :
                buyers.map(buyer => (
                  <div key={buyer.id} className="p-4 rounded-xl border border-border space-y-2 hover:border-green-500/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-semibold text-foreground">{buyer.companyName}</p>
                          {buyer.verified && (
                            <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[11px]">{t('cooperative.market.verified')}</Badge>
                          )}
                        </div>
                        <p className="text-[12px] text-muted-foreground">{buyer.contactPerson} · {buyer.location}</p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-[12px]">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        {buyer.rating}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {buyer.cropsWanted.map(c => (
                        <span key={c} className="px-2 py-0.5 rounded-full bg-background border border-border text-[11px] text-muted-foreground">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-muted-foreground">{t('cooperative.market.minQty')}: <span className="text-foreground">{buyer.minQuantityTons}t</span> · {buyer.pricePerKg} RWF/kg</span>
                      <button
                        onClick={() => { window.open(`tel:${buyer.phone}`) }}
                        className="flex items-center gap-1 text-[12px] text-green-500 hover:text-green-600 transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> {buyer.phone}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bulk Sale Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={bulkOpen} onOpenChange={open => !open && setBulkOpen(false)}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>{t('cooperative.market.bulkDialog.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.market.bulkDialog.crop')} *</label>
              <div className="grid grid-cols-3 gap-2">
                {crops.map(c => (
                  <button key={c.id} onClick={() => { setBulkCrop(c.id); setBulkPrice(String(c.pricePerKg)); setBulkBuyer('') }}
                    className={cn("px-3 py-2 rounded-xl border text-[13px] transition-all",
                      bulkCrop === c.id ? "border-green-500 bg-green-500/10 text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/40"
                    )}>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.market.bulkDialog.quantity')} (tons) *</label>
              <Input type="number" placeholder="10" value={bulkQty} onChange={e => setBulkQty(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.market.bulkDialog.price')} (RWF/kg)</label>
              <Input type="number" value={bulkPrice} onChange={e => setBulkPrice(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-green-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] text-muted-foreground">{t('cooperative.market.bulkDialog.buyer')} *</label>
              <div className="space-y-2">
                {(bulkCrop ? filteredBuyers : buyers).map(b => (
                  <button key={b.id} onClick={() => setBulkBuyer(b.id)}
                    className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all",
                      bulkBuyer === b.id ? "border-green-500 bg-green-500/10" : "border-border hover:border-muted-foreground/40"
                    )}>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{b.companyName}</p>
                      <p className="text-[12px] text-muted-foreground">{b.pricePerKg} RWF/kg · min {b.minQuantityTons}t</p>
                    </div>
                    {b.verified && <Badge className="bg-green-500/15 text-green-500 border-green-500/30 text-[11px]">✓</Badge>}
                  </button>
                ))}
                {bulkCrop && filteredBuyers.length === 0 && (
                  <p className="text-[13px] text-muted-foreground text-center py-2">{t('cooperative.market.bulkDialog.noBuyers')}</p>
                )}
              </div>
            </div>
            {bulkCrop && bulkQty && bulkPrice && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-[13px]">
                <p className="text-muted-foreground">{t('cooperative.market.bulkDialog.summary')}</p>
                <p className="text-green-500 font-semibold mt-1">
                  {(Number(bulkQty) * 1000 * Number(bulkPrice)).toLocaleString()} RWF
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-muted-foreground" onClick={() => setBulkOpen(false)}>
              {t('common.actions.cancel')}
            </Button>
            <Button disabled={submitting} onClick={handleBulkSubmit} className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              {submitting ? t('common.actions.saving') : t('cooperative.market.bulkDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
