import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Sprout } from "lucide-react"
import { toast } from "sonner"
import { cooperativeApi, type CooperativePlan } from "@/services/cooperative.service"

/**
 * Cultivation plans across the cooperative's registered farms.
 *
 * "Plan" here is IMARA's existing FarmPlan concept (the same one the Farmer
 * Dashboard uses), scoped to farms registered under this cooperative — not a
 * subscription tier, which IMARA does not have.
 *
 * Empty until members create plans for linked farms; that is real state, not a
 * loading failure, so it gets its own explanatory copy.
 */
export default function CooperativePlanPage() {
  const { t } = useTranslation()
  const [plan, setPlan] = useState<CooperativePlan | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPlan(await cooperativeApi.getPlan())
    } catch {
      toast.error(t("cooperative.plan.loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => { void load() }, [load])

  const kg = (value: number) => `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`
  const ha = (sqm: number) => `${(sqm / 10_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} ha`

  return (
    <>
      <Header title={t("cooperative.plan.title")} subtitle={t("cooperative.plan.subtitle")} />
      <div className="space-y-6 p-4 sm:p-6">
        {loading ? (
          <Skeleton className="h-72 w-full" />
        ) : !plan ? null : plan.plans.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
              <Sprout className="h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{t("cooperative.plan.empty")}</p>
              <p className="max-w-md text-sm text-muted-foreground">{t("cooperative.plan.emptyHint")}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("cooperative.plan.plans"), value: plan.summary.plans },
                { label: t("cooperative.plan.farms"), value: plan.summary.farms },
                { label: t("cooperative.plan.activePlans"), value: plan.summary.activePlans },
                { label: t("cooperative.plan.tasksDue"), value: plan.summary.tasksDue },
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
                <CardTitle>{t("cooperative.plan.byCrop")}</CardTitle>
                {plan.season && <CardDescription>{plan.season}</CardDescription>}
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">{t("cooperative.plan.crop")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.plans")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.area")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.expectedYield")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.harvested")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.byCrop.map(row => (
                      <tr key={row.crop} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{row.crop}</td>
                        <td className="py-2.5">{row.plans}</td>
                        <td className="py-2.5">{ha(row.areaSqm)}</td>
                        <td className="py-2.5">{kg(row.expectedYieldKg)}</td>
                        <td className="py-2.5">{kg(row.harvestedKg)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("cooperative.plan.planList")}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">{t("cooperative.plan.farmName")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.member")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.crop")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.seasonLabel")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.progress")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.harvested")}</th>
                      <th className="pb-2 font-medium">{t("cooperative.plan.status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.plans.map(row => (
                      <tr key={row.id} className="border-b last:border-0">
                        <td className="py-2.5 font-medium">{row.farmName}</td>
                        <td className="py-2.5">{row.member}</td>
                        <td className="py-2.5">{row.crop}</td>
                        <td className="py-2.5">{row.season}</td>
                        <td className="py-2.5">{row.tasksDone}/{row.tasksTotal}</td>
                        <td className="py-2.5">{kg(row.harvestedKg)}</td>
                        <td className="py-2.5">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
