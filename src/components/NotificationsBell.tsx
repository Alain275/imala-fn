import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Bell, X, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/context/NotificationsContext'
import { NotificationDetailDialog } from '@/components/NotificationDetailDialog'
import { authService } from '@/services/auth'
import type { Notification } from '@/services/notifications'
import { TYPE_ICONS, PRIORITY_RING, PRIORITY_ICON_COLOR } from '@/lib/notificationLabels'
import { getDateFnsLocale } from '@/lib/dateLocale'

function relativeTime(iso: string, lng: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: getDateFnsLocale(lng) })
  } catch {
    return ''
  }
}

interface NotificationItemProps {
  n: Notification
  onOpen: (n: Notification) => void
}

function NotificationItem({ n, onOpen }: NotificationItemProps) {
  const { remove } = useNotifications()
  const { i18n, t } = useTranslation()
  const Icon = TYPE_ICONS[n.type] ?? Bell

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
      onClick={() => onOpen(n)}
    >
      {/* Unread dot */}
      {!n.isRead && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      {/* Type icon with priority ring */}
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full ring-1 flex items-center justify-center ${PRIORITY_RING[n.priority]}`}>
        <Icon className={`w-4 h-4 ${PRIORITY_ICON_COLOR[n.priority]}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
          {n.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-1">{relativeTime(n.createdAt, i18n.language)}</p>
      </div>

      {/* Delete — stop propagation so it doesn't also open the detail */}
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 text-muted-foreground hover:text-destructive"
        onClick={e => { e.stopPropagation(); remove(n.id) }}
        aria-label={t('dashboard.notifications.deleteAria')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function NotificationsBell() {
  const { t } = useTranslation()
  const { notifications, unreadCount, loading, markAsRead, markAllRead } = useNotifications()
  const hasUnread = unreadCount > 0

  const user = authService.getCurrentUser()
  const notificationsPath = user?.role === 'agronomist'
    ? '/agronomist/notifications'
    : '/dashboard/notifications'

  const [popoverOpen, setPopoverOpen] = useState(false)
  const [selected, setSelected] = useState<Notification | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleOpen = (n: Notification) => {
    setPopoverOpen(false)       // close the popover so dialog isn't obscured
    setSelected(n)
    setDetailOpen(true)
    if (!n.isRead) markAsRead(n.id)
  }

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
            aria-label={hasUnread ? t('dashboard.notifications.ariaLabelUnread', { count: unreadCount }) : t('dashboard.notifications.ariaLabel')}
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" sideOffset={8} className="w-96 p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">{t('dashboard.notifications.ariaLabel')}</span>
            {hasUnread && (
              <button
                onClick={() => markAllRead()}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t('dashboard.notifications.markAllRead')}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-2.5 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">{t('dashboard.notifications.emptyAllCaughtUp')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map(n => (
                  <NotificationItem key={n.id} n={n} onOpen={handleOpen} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5">
            <Link
              to={notificationsPath}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
              onClick={() => setPopoverOpen(false)}
            >
              {t('dashboard.notifications.viewAllLink')}
            </Link>
          </div>
        </PopoverContent>
      </Popover>

      {/* Detail dialog rendered outside the Popover so z-index is clean */}
      <NotificationDetailDialog
        notification={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </>
  )
}
