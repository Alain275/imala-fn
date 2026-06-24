import { format, formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { Notification } from '@/services/notifications'
import { TYPE_ICONS, PRIORITY_RING, PRIORITY_ICON_COLOR, PRIORITY_BADGE, useNotificationLabels } from '@/lib/notificationLabels'
import { getDateFnsLocale } from '@/lib/dateLocale'

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
  const { i18n } = useTranslation()
  const { typeLabel, priorityWithLabel } = useNotificationLabels()
  if (!n) return null

  const Icon = TYPE_ICONS[n.type] ?? Bell

  const relativeTs = (() => {
    try {
      return formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: getDateFnsLocale(i18n.language) })
    } catch { return '' }
  })()

  const absoluteTs = (() => {
    try {
      return format(new Date(n.createdAt), 'MMM d, yyyy HH:mm', { locale: getDateFnsLocale(i18n.language) })
    } catch { return '' }
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
              <Badge variant="outline">
                {typeLabel(n.type)}
              </Badge>
              <Badge variant="outline" className={PRIORITY_BADGE[n.priority]}>
                {priorityWithLabel(n.priority)}
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
