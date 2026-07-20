import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  CloudSun,
  Leaf,
  LogIn,
  Sprout,
  UserPlus,
} from "lucide-react"

import { Header } from "@/components/header"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const tools = [
  {
    key: "cropAdvisory",
    href: "/dashboard/crops",
    icon: Sprout,
    iconClass: "bg-lime-100 text-lime-700 dark:bg-lime-950 dark:text-lime-300",
  },
  {
    key: "diseaseDetection",
    href: "/dashboard/disease",
    icon: Camera,
    iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  },
  {
    key: "weatherIntelligence",
    href: "/dashboard/weather",
    icon: CloudSun,
    iconClass: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  },
] as const

const steps = ["choose", "provide", "guidance"] as const

export default function PublicOverviewPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      <Header
        title={t("home.overview.pageTitle")}
        subtitle={t("home.overview.pageSubtitle")}
        actions={<LanguageSwitcher />}
      />

      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600 px-6 py-10 text-white shadow-xl sm:px-10 lg:py-14">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 right-32 h-56 w-56 rounded-full bg-lime-300/10" />
          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium">
              <Leaf className="h-4 w-4" />
              {t("home.overview.eyebrow")}
            </div>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t("home.hero.title")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              {t("home.hero.subtitle")}
            </p>
          </div>
        </section>

        <section aria-labelledby="public-tools-title">
          <div className="mb-5">
            <h2 id="public-tools-title" className="text-2xl font-bold text-foreground">
              {t("home.overview.toolsTitle")}
            </h2>
            <p className="mt-1 text-muted-foreground">{t("home.overview.toolsDescription")}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {tools.map((tool) => (
              <Card key={tool.key} className="group border-border/70 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="flex h-full flex-col p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tool.iconClass}`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-foreground">
                    {t(`home.fieldActions.${tool.key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {t(`home.fieldActions.${tool.key}.description`)}
                  </p>
                  <Button className="mt-6 w-full justify-between" asChild>
                    <Link to={tool.href}>
                      {t("home.overview.openTool")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-foreground">{t("home.overview.howTitle")}</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <div key={step} className="flex gap-3 sm:block">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground sm:mt-3">
                        {t(`home.overview.steps.${step}.title`)}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {t(`home.overview.steps.${step}.description`)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/30">
            <CardContent className="p-6 sm:p-8">
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
              <h2 className="mt-4 text-2xl font-bold text-foreground">{t("home.overview.accountTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t("home.overview.accountDescription")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button asChild>
                  <Link to="/sign-in"><LogIn className="mr-2 h-4 w-4" />{t("common.signIn")}</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />{t("auth.register.title")}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
