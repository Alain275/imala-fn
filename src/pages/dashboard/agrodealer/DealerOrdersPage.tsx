
import { useTranslation } from "react-i18next"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import agroDealerOrdersService, { type Order, type OrderStatus } from "../../../services/Agrodealerorders.service"
import { Download, FileText, ChevronDown } from "lucide-react"

const statusColors: Record<OrderStatus, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
}

const statusOptions: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"]

export default function DealerOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadOrders = () => {
    setLoading(true)
    setError(null)
    agroDealerOrdersService
      .list({ limit: 100, status: statusFilter === "all" ? undefined : statusFilter })
      .then((res) => setOrders(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load orders"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      await agroDealerOrdersService.updateStatus(orderId, newStatus)
      loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleInvoice = async (orderId: string) => {
    try {
      await agroDealerOrdersService.downloadInvoice(orderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download invoice")
    }
  }

  const handleExport = async () => {
    try {
      await agroDealerOrdersService.exportOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export orders")
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.dealerOrders.title", { defaultValue: "Orders" })}
        subtitle={t("dashboard.dealerOrders.subtitle", { defaultValue: "Manage orders placed by farmers" })}
      />

      <div className="p-3 sm:p-6 space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {t("dashboard.dealerOrders.filters.all", { defaultValue: "All" })}
            </button>
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  statusFilter === status ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            {t("dashboard.dealerOrders.export", { defaultValue: "Export CSV" })}
          </Button>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            {loading && (
              <div className="p-6 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            )}

            {!loading && orders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                {t("dashboard.dealerOrders.empty", { defaultValue: "No orders found" })}
              </p>
            )}

            {!loading && orders.length > 0 && (
              <div className="divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColors[order.status] }}
                        />
                        <p className="text-sm font-semibold text-foreground truncate">
                          {order.items?.map((i) => `${i.productName} x${i.quantity}`).join(", ") || order.id}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString()} · {order.paymentStatus}
                        {order.deliveryAddress ? ` · ${order.deliveryAddress}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-foreground">
                        {order.totalAmount.toLocaleString()} {order.currency}
                      </span>

                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={
                            updatingId === order.id || order.status === "delivered" || order.status === "cancelled"
                          }
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-background text-sm capitalize disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                      </div>

                      <Button variant="outline" size="sm" onClick={() => handleInvoice(order.id)} className="gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">
                          {t("dashboard.dealerOrders.invoice", { defaultValue: "Invoice" })}
                        </span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}