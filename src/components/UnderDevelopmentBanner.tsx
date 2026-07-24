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
    <main className="flex min-h-[calc(100vh-69px)] items-center justify-center p-4 pb-24 sm:p-6 lg:p-10">
      <section className="relative w-full max-w-5xl overflow-hidden border border-[#d7e5da] bg-white text-[#17231b] shadow-[0_12px_40px_rgba(35,72,50,.06)] dark:border-[#2b4235] dark:bg-[#17271e] dark:text-[#edf5ef]">
        <div className="absolute inset-y-0 left-0 w-1 bg-[#9bf52e]" />
        <div className="absolute right-0 top-0 h-48 w-48 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(#315900 1px, transparent 1px), linear-gradient(90deg, #315900 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative grid min-h-[420px] items-center gap-8 px-7 py-10 sm:px-12 lg:grid-cols-[1.25fr_0.75fr] lg:px-16 lg:py-14">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 border border-[#d2e1d5] bg-[#f2f8f4] px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#477326] dark:border-[#355141] dark:bg-[#203329] dark:text-[#b5f66f]">
              <Construction className="h-4 w-4" />
              Under Development
            </div>

            <h2 className="text-balance text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              {headline}
              <span className="block text-[#477326] dark:text-[#b5f66f]">
                {accent}
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#647b6b] sm:text-base lg:mx-0 dark:text-[#a4b4aa]">
              {description}
            </p>

            <div className="mt-7 flex items-center justify-center gap-3 text-xs font-bold text-[#315900] lg:justify-start dark:text-[#b5f66f]">
              <span className="grid h-7 w-7 place-items-center bg-[#eaf7de] dark:bg-[#29402f]"><Sparkles className="h-3.5 w-3.5" /></span>
              {statusText}
            </div>
          </div>

          <div className="relative mx-auto flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
            <div className="absolute inset-0 rounded-full border border-dashed border-[#86a88e]" />
            <div className="absolute inset-6 rounded-full border border-[#d2e1d5] dark:border-[#355141]" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#153923] text-[#b5ff62] shadow-[0_15px_40px_rgba(21,57,35,.2)] sm:h-36 sm:w-36">
              <Icon className="h-14 w-14" strokeWidth={1.5} />
              <span className="absolute -right-1 top-1 grid h-9 w-9 place-items-center rounded-full border-4 border-white bg-[#9bf52e] dark:border-[#17271e]">
                <Sparkles className="h-4 w-4 text-[#173b24]" />
              </span>
            </div>
          </div>
        </div>

      </section>
    </main>
  )
}
