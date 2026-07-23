import { Link } from "react-router-dom"
import { Bug, CloudSun, Grid2X2, Sprout } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { key: "dashboard", href: "/dashboard", label: "Home", icon: Grid2X2 },
  { key: "cropAdvisory", href: "/dashboard/crops", label: "Advisory", icon: Sprout },
  { key: "diseaseDetection", href: "/dashboard/disease", label: "Scan", icon: Bug },
  { key: "weatherIntelligence", href: "/dashboard/weather", label: "Weather", icon: CloudSun },
] as const

type ActiveItem = (typeof items)[number]["key"]

export function CommandCenterMobileNav({ active }: { active: ActiveItem }) {
  return (
    <nav aria-label="Mobile command navigation" className="fixed inset-x-3 bottom-3 z-40 rounded-xl border border-[#d5e2d8] bg-[#183c2a]/95 p-1 shadow-xl backdrop-blur md:hidden">
      <div className="grid h-14 grid-cols-4" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {items.map((item) => {
          const selected = item.key === active
          return (
            <Link
              key={item.key}
              to={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[9px] font-semibold transition-colors",
                selected ? "bg-[#9df22d] text-[#193126]" : "text-white/55 hover:text-white"
              )}
            >
              <item.icon className={cn("h-4 w-4", selected && item.key === "dashboard" && "fill-current")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
