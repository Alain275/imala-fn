import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from 'react-i18next'
import {
  Bell,
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
  Pagination,
} from '@/services/notifications'
import { TYPE_ICONS, PRIORITY_RING, PRIORITY_ICON_COLOR, PRIORITY_BADGE, useNotificationLabels } from '@/lib/notificationLabels'
import { getDateFnsLocale } from '@/lib/dateLocale'

function relativeTime(iso: string, lng: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: getDateFnsLocale(lng) })
  } catch {
    return ''
  }
}

type ReadFilter = 'all' | 'unread' | 'read'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { typeLabel, priorityLabel } = useNotificationLabels()
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
      <Header title={t('dashboard.notifications.pageTitle')} subtitle={t('dashboard.notifications.pageSubtitle')} />

      <div className="p-6 space-y-4 max-w-4xl">

        {/* Filters + actions bar */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label>{t('dashboard.notifications.filterType')}</Label>
            <select
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as NotificationType | '')}
            >
              <option value="">{t('dashboard.notifications.allTypes')}</option>
              {(Object.keys(TYPE_ICONS) as NotificationType[]).map(type => (
                <option key={type} value={type}>{typeLabel(type)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>{t('dashboard.notifications.filterStatus')}</Label>
            <select
              className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
              value={readFilter}
              onChange={e => setReadFilter(e.target.value as ReadFilter)}
            >
              <option value="all">{t('dashboard.notifications.allStatus')}</option>
              <option value="unread">{t('dashboard.notifications.unread')}</option>
              <option value="read">{t('dashboard.notifications.read')}</option>
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
              {t('dashboard.notifications.markAllRead')}
            </Button>
          )}
        </div>

        {/* List */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                {pagination.total > 0
                  ? t('dashboard.notifications.countLabel', { count: pagination.total })
                  : t('dashboard.notifications.pageTitle')}
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
                <p className="text-sm font-medium">{t('dashboard.notifications.emptyTitle')}</p>
                <p className="text-xs mt-1">
                  {readFilter !== 'all' || typeFilter
                    ? t('dashboard.notifications.emptyFiltered')
                    : t('dashboard.notifications.emptyAllCaughtUp')}
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
                          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${PRIORITY_BADGE[n.priority]}`}>
                            {priorityLabel(n.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {typeLabel(n.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">{relativeTime(n.createdAt, i18n.language)}</p>
                      </div>

                      {/* Actions — stop propagation so they don't also open the detail dialog */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={e => handleMarkAsRead(e, n.id)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title={t('dashboard.notifications.markAsRead')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={e => handleRemove(e, n.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title={t('common.actions.delete')}
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
              {t('dashboard.notifications.pageOf', { page: pagination.page, pages: pagination.pages })}
              {' '}·{' '}
              {t('dashboard.notifications.totalCount', { count: pagination.total })}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                {t('common.actions.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                {t('common.actions.next')}
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
