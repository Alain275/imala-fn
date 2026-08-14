import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Award, Clock, Map, AlertTriangle, TrendingUp, Info, BarChart2,
} from "lucide-react"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts"
import { toast } from "sonner"
import {
  agronomistAnalyticsService, type AnalyticsTicketsSummary, type AnalyticsYieldSummary,
} from "@/services/agronomistAnalytics.service"

const LINE_COLORS = ["#22c55e", "#38bdf8", "#a78bfa", "#f59e0b", "#ef4444", "#ec4899"]

export default function AgronomistAnalyticsPage() {
  const [tab, setTab] = useState<"tickets" | "yield">("tickets")

  const [tickets, setTickets] = useState<AnalyticsTicketsSummary | null>(null)
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [yieldData, setYieldData] = useState<AnalyticsYieldSummary | null>(null)
  const [yieldLoading, setYieldLoading] = useState(true)

  useEffect(() => {
    agronomistAnalyticsService.getTicketsAnalytics()
      .then(setTickets)
      .catch(() => toast.error("Failed to load ticket analytics"))
      .finally(() => setTicketsLoading(false))
    agronomistAnalyticsService.getYieldAnalytics()
      .then(setYieldData)
      .catch(() => toast.error("Failed to load yield analytics"))
      .finally(() => setYieldLoading(false))
  }, [])

  const weeklyCurveKeys = yieldData
    ? Array.from(new Set(yieldData.weeklyCurve.flatMap(p => Object.keys(p).filter(k => k !== "week"))))
    : []
  const hasWeeklyCurveData = weeklyCurveKeys.length > 0
  const byProvinceKeys = yieldData?.byProvince.length ? Object.keys(yieldData.byProvince[0]) : []

  return (
    <div className="min-h-screen bg-background">
      <Header title="Analytics" subtitle="Ticket resolution and platform-wide yield trends" />

      <div className="p-3 sm:p-6 space-y-6">
        <div className="flex gap-2">
          {([
            { key: "tickets" as const, label: "Ticket Resolution" },
            { key: "yield" as const, label: "Yield Trend" },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tickets" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ticketsLoading || !tickets ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
              ) : (
                [
                  { label: "Resolved This Week", val: String(tickets.resolvedThisWeek), icon: Award, gradient: "gold" as const },
                  { label: "Avg Resolution Time", val: `${tickets.avgResolutionHours}h`, icon: Clock, gradient: "sky" as const },
                  { label: "Field Visits", val: `${tickets.fieldVisitsCompleted}/${tickets.fieldVisitsPlanned}`, icon: Map, gradient: "green" as const },
                  { label: "High-Priority Rate", val: `${tickets.escalationRatePct}%`, icon: AlertTriangle, gradient: "earth" as const },
                ].map(k => (
                  <Card key={k.label} className="border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Icon3D gradient={k.gradient} size="md">
                        <k.icon className="w-5 h-5" />
                      </Icon3D>
                      <div>
                        <p className="text-2xl font-black text-foreground">{k.val}</p>
                        <p className="text-xs text-muted-foreground">{k.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {!ticketsLoading && tickets && (
              <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>"High-Priority Rate" is the share of this week's support tickets logged as high priority — not a true escalation metric.</span>
              </div>
            )}

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-base">
                  <BarChart2 className="w-4 h-4" /> Daily Ticket Resolution (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {ticketsLoading || !tickets ? (
                  <Skeleton className="h-56 w-full" />
                ) : tickets.dailyBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No ticket activity recorded this week.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tickets.dailyBreakdown} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                        <Legend />
                        <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
                        <Bar dataKey="escalated" fill="#ef4444" radius={[4, 4, 0, 0]} name="Escalated" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {tab === "yield" && (
          <div className="space-y-6">
            <div className="flex items-start gap-2 p-3 rounded-xl border border-border bg-muted/30 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>This is a platform-wide yield trend across all agronomists, not your personal impact.</span>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-base">
                  <TrendingUp className="w-4 h-4" /> Yield by Province
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {yieldLoading || !yieldData ? (
                  <Skeleton className="h-24 w-full" />
                ) : yieldData.byProvince.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No regional yield data recorded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {yieldData.byProvince.map((entry, i) => (
                      <div key={i} className="p-3 rounded-xl border border-border bg-muted/30 text-xs grid grid-cols-2 gap-2">
                        {byProvinceKeys.map(k => (
                          <div key={k}>
                            <p className="text-muted-foreground capitalize">{k}</p>
                            <p className="font-medium text-foreground">{String(entry[k] ?? "—")}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-border">
                <CardTitle className="flex items-center gap-3 text-base">
                  <TrendingUp className="w-4 h-4" /> Weekly Yield Curve
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {yieldLoading || !yieldData ? (
                  <Skeleton className="h-56 w-full" />
                ) : !hasWeeklyCurveData ? (
                  <p className="text-sm text-muted-foreground text-center py-10">No weekly yield trend data recorded yet.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={yieldData.weeklyCurve}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" fontSize={11} />
                        <YAxis fontSize={11} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                        <Legend />
                        {weeklyCurveKeys.map((key, i) => (
                          <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth={2} />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
