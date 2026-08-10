import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Icon3D } from "@/components/icon-3d"
import { authService } from "@/services/auth"
import agroDealerOrdersService, { type Order, type OrderStatus } from "../../../services/Agrodealerorders.service"
import agroDealerCatalogService, { type Product } from "../../../services/Agrodealercatalog.service"
import {
  ShoppingBag,
  Clock,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Store,
  MessageSquare,
  BadgeCheck,
  PlusCircle,
} from "lucide-react"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const statusColors: Record<OrderStatus, string> = {
  pending: "#eab308",
  confirmed: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
}

const quickActions = [
  { key: "addProduct", icon: PlusCircle, gradient: "green" as const, href: "/dashboard/dealer-products" },
  { key: "viewOrders", icon: ShoppingBag, gradient: "gold" as const, href: "/dashboard/dealer-orders" },
  { key: "lowStock", icon: AlertTriangle, gradient: "earth" as const, href: "/dashboard/dealer-products" },
  { key: "messages", icon: MessageSquare, gradient: "sky" as const, href: "/dashboard/dealer-messages" },
  { key: "editProfile", icon: BadgeCheck, gradient: "leaf" as const, href: "/dashboard/dealer-profile" },
  { key: "marketplace", icon: Store, gradient: "green" as const, href: "/dashboard/dealer-marketplace" },
]

export default function DealerOverviewPage() {
  const { t } = useTranslation()
  const user = authService.getCurrentUser()

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [lowStock, setLowStock] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      agroDealerOrdersService.list({ limit: 100 }),
      agroDealerCatalogService.listMyProducts(),
      agroDealerCatalogService.listLowStock(10),
    ])
      .then(([ordersRes, productsRes, lowStockRes]) => {
        if (cancelled) return
        setOrders(ordersRes.data)
        setProducts(productsRes.data)
        setLowStock(lowStockRes.data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load dashboard overview")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const pendingCount = orders.filter((o) => o.status === "pending").length
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const statCards = [
    { key: "totalOrders", icon: ShoppingBag, gradient: "gold" as const, value: orders.length },
    { key: "pendingOrders", icon: Clock, gradient: "earth" as const, value: pendingCount },
    { key: "myProducts", icon: Package, gradient: "green" as const, value: products.length },
    { key: "lowStockAlerts", icon: AlertTriangle, gradient: "leaf" as const, value: lowStock.length },
  ]

  const statusBreakdown = (["pending", "confirmed", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(
    (status) => ({
      status,
      name: t(`dashboard.dealerOverview.orderStatus.${status}`, { defaultValue: status }),
      count: orders.filter((o) => o.status === status).length,
      color: statusColors[status],
    })
  )

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen">
      <Header
        title={t("dashboard.dealerOverview.title", { defaultValue: "Dealer Dashboard" })}
        subtitle={t("dashboard.dealerOverview.subtitle", {
          defaultValue: "Welcome back, {{name}}! Here's your business overview.",
          name: user?.name || "Dealer",
        })}
      />

      <div className="p-3 sm:p-6 space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.key} className="card-hover border-0 shadow-md bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {t(`dashboard.dealerOverview.stats.${stat.key}`, { defaultValue: stat.key })}
                    </p>
                    {loading ? (
                      <Skeleton className="h-9 w-20" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                    )}
                  </div>
                  <Icon3D gradient={stat.gradient} size="md">
                    <stat.icon className="w-6 h-6" />
                  </Icon3D>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Orders by Status & Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="gold" size="sm">
                  <ShoppingBag className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.dealerOverview.ordersByStatus.title", { defaultValue: "Orders by Status" })}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="name" className="fill-muted-foreground" fontSize={12} tickLine={false} />
                    <YAxis className="fill-muted-foreground" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '8px',
                        color: 'oklch(var(--foreground))',
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Icon3D gradient="earth" size="sm">
                    <AlertTriangle className="w-4 h-4" />
                  </Icon3D>
                  <span>{t("dashboard.dealerOverview.lowStock.title", { defaultValue: "Low Stock Products" })}</span>
                </CardTitle>
                <Link to="/dashboard/dealer-products" className="text-sm text-primary hover:underline font-medium">
                  {t("dashboard.dealerOverview.lowStock.viewAll", { defaultValue: "View all" })}
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{product.category}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-600 flex-shrink-0 ml-3">
                      {product.quantity} {product.unit || ""}
                    </span>
                  </div>
                ))}
                {loading && [0, 1, 2].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
                {!loading && lowStock.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t("dashboard.dealerOverview.lowStock.empty", { defaultValue: "No low-stock products right now" })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Icon3D gradient="green" size="sm">
                  <ShoppingBag className="w-4 h-4" />
                </Icon3D>
                <span>{t("dashboard.dealerOverview.recentOrders.title", { defaultValue: "Recent Orders" })}</span>
              </CardTitle>
              <Link to="/dashboard/dealer-orders" className="text-sm text-primary hover:underline font-medium">
                {t("dashboard.dealerOverview.recentOrders.viewAll", { defaultValue: "View all" })}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/dashboard/dealer-orders"
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: statusColors[order.status] }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {order.items?.map((i) => i.productName).join(", ") || order.id}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {order.status} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-foreground flex-shrink-0">
                    {order.totalAmount.toLocaleString()} {order.currency}
                  </span>
                </Link>
              ))}
              {loading && [0, 1, 2].map((item) => (
                <div key={item} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                  <Skeleton className="mt-1 h-3 w-3 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
              {!loading && recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {t("dashboard.dealerOverview.recentOrders.empty", { defaultValue: "No orders yet" })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>{t("dashboard.dealerOverview.quickActions.title", { defaultValue: "Quick Actions" })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.key}
                  to={action.href}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all hover:scale-105"
                >
                  <Icon3D gradient={action.gradient} size="md">
                    <action.icon className="w-5 h-5" />
                  </Icon3D>
                  <span className="text-sm font-medium text-foreground text-center">
                    {t(`dashboard.dealerOverview.quickActions.${action.key}`, { defaultValue: action.key })}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}