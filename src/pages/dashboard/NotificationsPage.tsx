import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Bell, CloudSun, TrendingUp, Bug, Mountain, BookOpen,
  Trash2, CheckCheck, CheckCircle,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '@/context/NotificationsContext'
import { notificationsService } from '@/services/notifications'
import { NotificationDetailDialog } from '@/components/NotificationDetailDialog'
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  Pagination,
} from '@/services/notifications'

const TYPE_ICONS: Record<NotificationType, React.ElementType> = {
  weather: CloudSun,
  market: TrendingUp,
  disease: Bug,
  soil: Mountain,
  training: BookOpen,
  system: Bell,
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

const TYPE_LABELS: Record<NotificationType, string> = {
  weather: 'Weather',
  market: 'Market',
  disease: 'Disease',
  soil: 'Soil',
  training: 'Training',
  system: 'System',
}

function relativeTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

type ReadFilter = 'all' | 'unread' | 'read'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { markAsRead, markAllRead, remove } = useNotifications()

  const [items, setItems] = useState<Notification[]>([])
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: PAGE_SIZE, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [page, setPage] = useState(1)
  const [pageVersion, setPageVersion] = useState(0)

  const [selected, setSelected] = useState<Notification | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const refresh = () => setPageVersion(v => v + 1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params: Parameters<typeof notificationsService.getNotifications>[0] = {
      page,
      limit: PAGE_SIZE,
    }
    if (typeFilter) params.type = typeFilter as NotificationType
    if (readFilter === 'unread') params.isRead = false
    if (readFilter === 'read') params.isRead = true

    notificationsService.getNotifications(params)
      .then(data => {
        if (!cancelled) {
          setItems(data.notifications)
          setPagination(data.pagination)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, typeFilter, readFilter, pageVersion])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [typeFilter, readFilter])

  const handleOpenDetail = (n: Notification) => {
    setSelected(n)
    setDetailOpen(true)
    if (!n.isRead) {
      markAsRead(n.id)
      setItems(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item))
    }
  }

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await markAsRead(id)
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    await markAllRead()
    refresh()
  }

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await remove(id)
    setItems(prev => prev.filter(n => n.id !== id))
    setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }))
  }

  const hasUnread = items.some(n => !n.isRead)

  return (
    <div className="min-h-screen">
      <Header title="Notifications" subtitle="Your activity feed" />

      <div className="p-6 space-y-4 max-w-4xl">

        {/* Filters + actions bar */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <select
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as NotificationType | '')}
            >
              <option value="">All types</option>
              {(Object.keys(TYPE_LABELS) as NotificationType[]).map(t => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <select
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
              value={readFilter}
              onChange={e => setReadFilter(e.target.value as ReadFilter)}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 mb-0.5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* List */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                {pagination.total > 0
                  ? `${pagination.total} notification${pagination.total !== 1 ? 's' : ''}`
                  : 'Notifications'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="divide-y divide-border/50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3 px-6 py-4">
                    <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3.5 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Bell className="w-10 h-10 mb-3 opacity-25" />
                <p className="text-sm font-medium">No notifications</p>
                <p className="text-xs mt-1">
                  {readFilter !== 'all' || typeFilter ? 'Try adjusting your filters' : "You're all caught up"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {items.map(n => {
                  const Icon = TYPE_ICONS[n.type] ?? Bell
                  return (
                    <div
                      key={n.id}
                      className={`flex items-start gap-4 px-6 py-4 group cursor-pointer hover:bg-muted/40 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => handleOpenDetail(n)}
                    >
                      {/* Type icon with priority ring */}
                      <div className={`mt-0.5 flex-shrink-0 w-9 h-9 rounded-full ring-1 flex items-center justify-center ${PRIORITY_RING[n.priority]}`}>
                        <Icon className={`w-4 h-4 ${PRIORITY_ICON_COLOR[n.priority]}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className={`text-sm ${!n.isRead ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                            {n.title}
                          </span>
                          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 capitalize ${PRIORITY_BADGE[n.priority]}`}>
                            {n.priority}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 capitalize">
                            {TYPE_LABELS[n.type]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(n.createdAt)}</p>
                      </div>

                      {/* Actions — stop propagation so they don't also open the detail dialog */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={e => handleMarkAsRead(e, n.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={e => handleRemove(e, n.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {pagination.page} of {pagination.pages}
              {' '}·{' '}
              {pagination.total} total
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </div>

      <NotificationDetailDialog
        notification={selected}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  )
}
