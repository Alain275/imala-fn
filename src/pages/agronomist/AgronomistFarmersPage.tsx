import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronLeft, ChevronRight, Users2, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { agronomistFarmersService, type FarmerListEntry } from "@/services/agronomistFarmers.service"

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-2 py-3">
          <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  )
}

export default function AgronomistFarmersPage() {
  const navigate = useNavigate()
  const [farmers, setFarmers] = useState<FarmerListEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const load = useCallback(() => {
    setLoading(true)
    agronomistFarmersService.getFarmers({ page, limit, search: search || undefined })
      .then(({ farmers, pagination }) => {
        setFarmers(farmers)
        setTotal(pagination.total)
      })
      .catch(() => toast.error("Failed to load farmers"))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="min-h-screen bg-background">
      <Header title="Farmers" subtitle="Your assigned farmer directory and farm records" />

      <div className="p-3 sm:p-6 space-y-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search farmers by name, email, or phone..."
                className="pl-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users2 className="w-4 h-4" />
              Assigned Farmers
              {!loading && <span className="text-sm font-normal text-muted-foreground">({total})</span>}
            </CardTitle>
          </CardHeader>

          {loading ? (
            <TableSkeleton />
          ) : farmers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users2 className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-foreground">No farmers found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? "Try a different search term." : "No farmers are assigned to you yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farmer</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Farm size</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Last login</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {farmers.map(farmer => (
                    <tr
                      key={farmer.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/agronomist/farmers/${farmer.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(farmer.name)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{farmer.name}</p>
                            <p className="text-xs text-muted-foreground">{farmer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{farmer.location || "—"}</td>
                      <td className="px-4 py-4 text-muted-foreground">{farmer.farmSize != null ? `${farmer.farmSize} ha` : "—"}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${
                          farmer.isEmailVerified
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40"
                        }`}>
                          {farmer.isEmailVerified ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {farmer.isEmailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        {farmer.lastLogin ? new Date(farmer.lastLogin).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-foreground font-medium">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
