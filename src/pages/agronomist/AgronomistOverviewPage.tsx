import { Link } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Map, BrainCircuit, MessageSquare, FlaskConical,
  BarChart3, Users2, CheckCircle2, HelpCircle, BookOpen, Send,
  Clock, TrendingUp, Activity, ArrowRight, AlertCircle,
} from "lucide-react"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts"
import { useAgronomistDashboardSummary } from "@/hooks/useAgronomistDashboard"
import type { DashboardRecentActivityItem } from "@/services/agronomistDashboard.service"

const ACTIVITY_ICON: Record<string, typeof Activity> = {
  farm_visit: Map,
  ai_recommendation: BrainCircuit,
  support_ticket: MessageSquare,
  bulk_message: Send,
  prescription: FlaskConical,
}

const ACTIVITY_LABEL: Record<string, string> = {
  farm_visit: "Farm visit update",
  ai_recommendation: "AI recommendation update",
  support_ticket: "Support ticket update",
  bulk_message: "Bulk message update",
  prescription: "Prescription update",
}

function activityText(item: DashboardRecentActivityItem) {
  if (item.text && item.text.includes("undefined")) {
    return ACTIVITY_LABEL[item.type] ?? "Activity update"
  }
  return item.text
}

export default function AgronomistOverviewPage() {
  const { data, loading, error, refetch } = useAgronomistDashboardSummary()

  const modules = [
    {
      name: "Farmers",
      href: "/agronomist/farmers",
      icon: Users2,
      description: "Your assigned farmer directory and farm records",
      gradient: "green",
    },
    {
      name: "Farm Visits",
      href: "/agronomist/farm-visits",
      icon: Map,
      description: "Log, schedule, and review field visits",
      stat: data ? `${data.fieldVisits} visits this week` : undefined,
      gradient: "sky",
    },
    {
      name: "Advice",
      href: "/agronomist/advice",
      icon: MessageSquare,
      description: "Track advice given to farmers on active issues",
      gradient: "earth",
    },
    {
      name: "Questions",
      href: "/agronomist/questions",
      icon: HelpCircle,
      description: "Answer questions submitted by farmers",
      gradient: "gold",
    },
    {
      name: "Training Materials",
      href: "/agronomist/training-materials",
      icon: BookOpen,
      description: "Publish and manage farmer training content",
      gradient: "violet",
    },
    {
      name: "AI Validation Engine",
      href: "/agronomist/ai-validation",
      icon: BrainCircuit,
      description: "Review low-confidence crop recommendations before dispatch",
      stat: data ? `${data.avgConfidence}% avg confidence` : undefined,
      gradient: "gold",
    },
    {
      name: "Pathology Lab",
      href: "/agronomist/pathology",
      icon: FlaskConical,
      description: "Diagnose crop diseases and build treatment prescriptions",
      gradient: "violet",
    },
    {
      name: "Comms Studio",
      href: "/agronomist/comms",
      icon: MessageSquare,
      description: "Bulk messaging and farmer support tickets",
      stat: data ? `${data.messagesSent} messages sent this week` : undefined,
      gradient: "sky",
    },
    {
      name: "GIS & Field Scouting",
      href: "/agronomist/gis",
      icon: Map,
      description: "Monitor district field zones and coverage",
      gradient: "green",
    },
    {
      name: "Analytics",
      href: "/agronomist/analytics",
      icon: BarChart3,
      description: "Ticket resolution and yield-impact trends",
      stat: data ? `${data.ticketsResolved} tickets resolved this week` : undefined,
      gradient: "earth",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Agronomist Command Centre"
        subtitle="Rwanda Agricultural System · Overview & Regional Operations"
      />

      <div className="p-3 sm:p-6 space-y-6">
        {error ? (
          <Card className="border-0 shadow-md">
            <CardContent className="py-10 flex flex-col items-center gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {loading || !data ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-md">
                    <CardContent className="p-4 h-32 flex flex-col justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                [
                  { label: "Tickets Resolved", val: String(data.ticketsResolved), icon: CheckCircle2, gradient: "green" },
                  { label: "Field Visits", val: String(data.fieldVisits), icon: Map, gradient: "sky" },
                  { label: "Messages Sent", val: String(data.messagesSent), icon: MessageSquare, gradient: "sky" },
                  { label: "Avg Confidence", val: `${data.avgConfidence}%`, icon: BrainCircuit, gradient: "gold" },
                  { label: "Yield Improvement", val: `${data.yieldImprovementPct}%`, icon: TrendingUp, gradient: "green" },
                ].map((k) => (
                  <Card key={k.label} className="border-0 shadow-md">
                    <CardContent className="p-4 flex flex-col justify-between h-32">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
                        <Icon3D gradient={k.gradient as any} size="sm">
                          <k.icon className="w-4 h-4 text-white" />
                        </Icon3D>
                      </div>
                      <div className="mt-2">
                        <p className="text-2xl font-bold text-foreground">{k.val}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Modules Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Core Modules</h2>
                <span className="text-xs text-muted-foreground">Select a module to manage</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {modules.map((mod) => (
                  <Card key={mod.name} className="card-hover border-0 shadow-md overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="h-24 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center border-b border-border">
                        <Icon3D gradient={mod.gradient as any} size="lg">
                          <mod.icon className="w-6 h-6 text-white" />
                        </Icon3D>
                      </div>
                      <CardContent className="p-5 space-y-2">
                        <h3 className="font-semibold text-foreground text-base">{mod.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{mod.description}</p>
                      </CardContent>
                    </div>
                    <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border/50">
                      <span className="text-xs font-semibold text-primary">{mod.stat ?? ""}</span>
                      <Button variant="ghost" size="sm" className="gap-1.5 p-0 hover:bg-transparent text-muted-foreground hover:text-foreground ml-auto" asChild>
                        <Link to={mod.href}>
                          Open Desk <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Weekly Activity + Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Weekly activity chart */}
              <Card className="lg:col-span-3 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <span>Weekly Activity</span>
                  </CardTitle>
                  <CardDescription>Field operations and support ticket diagnostics</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading || !data ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.weeklyActivity} barGap={4}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                          <XAxis dataKey="day" className="fill-muted-foreground" fontSize={11} tickLine={false} />
                          <YAxis className="fill-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--background)" }} />
                          <Bar dataKey="visits" fill="#10b981" radius={[4, 4, 0, 0]} name="Field Visits" />
                          <Bar dataKey="tickets" fill="#f59e0b" radius={[4, 4, 0, 0]} name="New Tickets" />
                          <Bar dataKey="resolved" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Resolved" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity feed */}
              <Card className="lg:col-span-2 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span>Operations Feed</span>
                  </CardTitle>
                  <CardDescription>Real-time field logs & telemetry events</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading || !data ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))
                  ) : data.recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Activity className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                      <p className="text-sm text-muted-foreground">No recent activity yet</p>
                    </div>
                  ) : (
                    data.recentActivity.map((activity, i) => {
                      const Icon = ACTIVITY_ICON[activity.type] ?? Activity
                      return (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground font-medium leading-normal">{activityText(activity)}</p>
                            {activity.timestamp && (
                              <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
