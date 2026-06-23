import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChartCardProps {
  title: string
  description?: string
  icon?: React.ElementType
  iconColor?: string
  loading?: boolean
  height?: number
  action?: React.ReactNode
  legend?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-muted-foreground",
  loading = false,
  height = 220,
  action,
  legend,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn("border-0 shadow-md", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              {Icon && <Icon className={cn("w-4 h-4", iconColor)} />}
              {title}
            </CardTitle>
            {description && <CardDescription className="mt-0.5">{description}</CardDescription>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full rounded-xl" style={{ height }} />
        ) : (
          <div style={{ height }}>{children}</div>
        )}
        {legend && !loading && <div className="mt-3">{legend}</div>}
      </CardContent>
    </Card>
  )
}
