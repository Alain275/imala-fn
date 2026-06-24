import { Bell, CloudSun, TrendingUp, Bug, Mountain, BookOpen } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { NotificationType, NotificationPriority } from "@/services/notifications"

export const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  weather: CloudSun,
  market: TrendingUp,
  disease: Bug,
  soil: Mountain,
  training: BookOpen,
  system: Bell,
}

export const PRIORITY_RING: Record<NotificationPriority, string> = {
  high: "ring-red-400 bg-red-50 dark:bg-red-950/40",
  medium: "ring-amber-400 bg-amber-50 dark:bg-amber-950/40",
  low: "ring-border bg-muted",
}

export const PRIORITY_ICON_COLOR: Record<NotificationPriority, string> = {
  high: "text-red-500",
  medium: "text-amber-500",
  low: "text-muted-foreground",
}

export const PRIORITY_BADGE: Record<NotificationPriority, string> = {
  high: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400",
  medium: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
  low: "bg-muted text-muted-foreground",
}

export function useNotificationLabels() {
  const { t } = useTranslation()
  const typeLabel = (type: NotificationType) => t(`common.notificationType.${type}`)
  const priorityLabel = (priority: NotificationPriority) => t(`common.priority.${priority}`)
  const priorityWithLabel = (priority: NotificationPriority) =>
    t("common.priority.withLabel", { priority: priorityLabel(priority) })
  return { typeLabel, priorityLabel, priorityWithLabel }
}
