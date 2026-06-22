import { format, formatDistanceToNow } from 'date-fns'
import { Bell, CloudSun, TrendingUp, Bug, Mountain, BookOpen } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Notification, NotificationType, NotificationPriority } from '@/services/notifications'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  weather: CloudSun,
  market: TrendingUp,
  disease: Bug,
  soil: Mountain,
  training: BookOpen,
  system: Bell,
}

const TYPE_LABELS: Record<NotificationType, string> = {
  weather: 'Weather',
  market: 'Market',
  disease: 'Disease',
  soil: 'Soil',
  training: 'Training',
  system: 'System',
}

const PRIORITY_RING: Record<NotificationPriority, string> = {
  high: 'ring-red-400 bg-red-50 dark:bg-red-950/40',
  medium: 'ring-amber-400 bg-amber-50 dark:bg-amber-950/40',
  low: 'ring-border bg-muted',
}

const PRIORITY_ICON_COLOR: Record<NotificationPriority, string> = {
  high: 'text-red-500',
  medium: 'text-amber-500',
  low: 'text-muted-foreground',
}

const PRIORITY_BADGE: Record<NotificationPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  low: 'bg-muted text-muted-foreground',
}

interface NotificationDetailDialogProps {
  notification: Notification | null
  open: boolean
  onClose: () => void
}

export function NotificationDetailDialog({
  notification: n,
  open,
  onClose,
}: NotificationDetailDialogProps) {
  if (!n) return null

  const Icon = TYPE_ICONS[n.type] ?? Bell

  const relativeTs = (() => {
    try { return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) } catch { return '' }
  })()

  const absoluteTs = (() => {
    try { return format(new Date(n.createdAt), "MMM d, yyyy 'at' HH:mm") } catch { return '' }
  })()

  return (
    <Dialog open={open} onOpenChange={open => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Icon + badges */}
          <div className="flex items-center gap-4 mb-1">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ring-2 flex items-center justify-center ${PRIORITY_RING[n.priority]}`}>
              <Icon className={`w-6 h-6 ${PRIORITY_ICON_COLOR[n.priority]}`} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {TYPE_LABELS[n.type]}
              </Badge>
              <Badge variant="outline" className={`capitalize ${PRIORITY_BADGE[n.priority]}`}>
                {n.priority} priority
              </Badge>
            </div>
          </div>

          <DialogTitle className="text-left text-base leading-snug mt-2">
            {n.title}
          </DialogTitle>
        </DialogHeader>

        {/* Full message — DialogDescription for a11y */}
        <DialogDescription asChild>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {n.message}
          </p>
        </DialogDescription>

        {/* Timestamp */}
        <div className="pt-2 border-t mt-2 space-y-0.5">
          <p className="text-xs text-muted-foreground">{relativeTs}</p>
          <p className="text-xs text-muted-foreground/60">{absoluteTs}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
