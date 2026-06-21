import { useTranslation } from "react-i18next"
import { Check, ChevronDown, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { SUPPORTED_LANGUAGES } from "@/i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface LanguageSwitcherProps {
  /** Classes for the trigger button, used to adapt the switcher to the surrounding theme. */
  triggerClassName?: string
  /** Classes for the dropdown content panel. */
  contentClassName?: string
  align?: "start" | "end" | "center"
}

export function LanguageSwitcher({
  triggerClassName,
  contentClassName,
  align = "end",
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()

  const activeLanguage =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ??
    SUPPORTED_LANGUAGES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("common.language")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "border-input bg-background/80 text-foreground hover:bg-accent hover:text-accent-foreground",
            triggerClassName,
          )}
        >
          <Globe className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">{activeLanguage.nativeLabel}</span>
          <span className="sm:hidden">{activeLanguage.code.toUpperCase()}</span>
          <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={cn("min-w-[10rem]", contentClassName)}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => i18n.changeLanguage(lang.code)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span>{lang.nativeLabel}</span>
            {lang.code === activeLanguage.code && (
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
