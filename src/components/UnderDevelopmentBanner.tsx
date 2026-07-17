import type { ElementType } from "react"
import { Construction, Sparkles } from "lucide-react"

interface UnderDevelopmentBannerProps {
  icon: ElementType
  headline: string
  accent: string
  description: string
  statusText?: string
}

export function UnderDevelopmentBanner({
  icon: Icon,
  headline,
  accent,
  description,
  statusText = "New tools are on the way",
}: UnderDevelopmentBannerProps) {
  return (
    <main className="flex min-h-[calc(100vh-89px)] items-center justify-center bg-background p-4 sm:p-6 lg:p-10">
      <section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border-2 border-border bg-card text-card-foreground shadow-[0_30px_90px_-35px_rgba(5,150,105,0.45)] dark:border-emerald-500/50 dark:shadow-[0_30px_90px_-35px_rgba(52,211,153,0.35)]">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-500/20" />
        <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl dark:bg-amber-400/15" />

        <div className="relative grid min-h-[520px] items-center gap-10 px-6 py-12 sm:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:px-16 lg:py-16">
          <div className="text-center lg:text-left">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm dark:border-amber-400/70 dark:bg-amber-400/15 dark:text-amber-200">
              <Construction className="h-4 w-4" />
              Under Development
            </div>

            <h2 className="text-balance text-4xl font-bold tracking-tight text-card-foreground sm:text-5xl lg:text-6xl">
              {headline}
              <span className="block text-emerald-700 dark:text-emerald-300">
                {accent}
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-card-foreground/80 sm:text-lg lg:mx-0">
              {description}
            </p>

            <div className="mt-8 flex items-center justify-center gap-3 text-sm font-bold text-emerald-700 lg:justify-start dark:text-emerald-300">
              <Sparkles className="h-5 w-5" />
              {statusText}
            </div>
          </div>

          <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
            <div className="absolute inset-0 animate-[spin_24s_linear_infinite] rounded-full border border-dashed border-emerald-400/60 dark:border-emerald-300/70" />
            <div className="absolute inset-7 rounded-full bg-gradient-to-br from-emerald-400 to-green-700 opacity-20 blur-2xl dark:opacity-40" />
            <div className="relative flex h-40 w-40 rotate-3 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800 text-white shadow-2xl shadow-emerald-700/30 sm:h-44 sm:w-44 dark:from-emerald-400 dark:via-emerald-600 dark:to-green-800 dark:shadow-emerald-400/25">
              <Icon className="h-20 w-20" strokeWidth={1.5} />
              <span className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-amber-400 shadow-lg dark:border-card dark:bg-amber-300">
                <Sparkles className="h-6 w-6 text-amber-950" />
              </span>
            </div>
          </div>
        </div>

        <div className="relative h-2 w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-green-600" />
      </section>
    </main>
  )
}
