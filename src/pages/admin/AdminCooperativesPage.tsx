import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building2, Check, X } from "lucide-react"
import { toast } from "sonner"
import {
  adminCooperativesApi,
  type AdminCooperative,
  type AdminCooperativeDetail,
  type CooperativeStatus,
} from "@/services/adminCooperatives.service"

/**
 * Cooperative approvals + directory, backed by /api/admin/cooperatives.
 *
 * Replaces the previous version of this screen, which read a hardcoded
 * `_cooperatives` array in adminMock.ts: a cooperative created there vanished
 * on refresh, and a real one registered through signup could never appear.
 * The create/edit/delete controls went with it — they only ever mutated that
 * in-memory array, and there are no backend endpoints behind them. Cooperatives
 * now enter the system by signing up and being approved here.
 */

const TABS: Array<{ key: CooperativeStatus | "all"; labelKey: string }> = [
  { key: "pending", labelKey: "admin.cooperatives.approvals.tabPending" },
  { key: "active", labelKey: "admin.cooperatives.approvals.tabActive" },
  { key: "rejected", labelKey: "admin.cooperatives.approvals.tabRejected" },
  { key: "all", labelKey: "admin.cooperatives.approvals.tabAll" },
]

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  active: "bg-green-500/15 text-green-600 border-green-500/30",
  rejected: "bg-red-500/15 text-red-600 border-red-500/30",
  suspended: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
}

export default function AdminCooperativesPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<CooperativeStatus | "all">("pending")
  const [rows, setRows] = useState<AdminCooperative[]>([])
  const [summary, setSummary] = useState({ pending: 0, active: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)

  const [detail, setDetail] = useState<AdminCooperativeDetail | null>(null)
  const [approveTarget, setApproveTarget] = useState<AdminCooperative | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminCooperative | null>(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminCooperativesApi.list(tab)
      setRows(data.cooperatives)
      setSummary(data.summary)
    } catch {
      toast.error(t("admin.cooperatives.approvals.loadError"))
    } finally {
      setLoading(false)
    }
  }, [tab, t])

  useEffect(() => { void load() }, [load])

  const approve = async () => {
    if (!approveTarget) return
    setBusy(true)
    try {
      await adminCooperativesApi.approve(approveTarget.id)
      toast.success(t("admin.cooperatives.approvals.approved"))
      setApproveTarget(null)
      setDetail(null)
      await load()
    } catch (error: any) {
      toast.error(error?.message || t("admin.cooperatives.approvals.actionError"))
    } finally {
      setBusy(false)
    }
  }

  const reject = async () => {
    if (!rejectTarget) return
    if (!reason.trim()) {
      toast.error(t("admin.cooperatives.approvals.rejectReasonRequired"))
      return
    }
    setBusy(true)
    try {
      await adminCooperativesApi.reject(rejectTarget.id, reason.trim())
      toast.success(t("admin.cooperatives.approvals.rejected"))
      setRejectTarget(null)
      setReason("")
      setDetail(null)
      await load()
    } catch (error: any) {
      toast.error(error?.message || t("admin.cooperatives.approvals.actionError"))
    } finally {
      setBusy(false)
    }
  }

  const openDetail = async (id: string) => {
    try {
      setDetail(await adminCooperativesApi.get(id))
    } catch {
      toast.error(t("admin.cooperatives.approvals.loadError"))
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Header
        title={t("admin.cooperatives.approvals.title")}
        subtitle={t("admin.cooperatives.approvals.subtitle")}
      />

      <div className="space-y-5 p-3 sm:p-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: t("admin.cooperatives.approvals.tabPending"), value: summary.pending, cls: "text-amber-500" },
            { label: t("admin.cooperatives.approvals.tabActive"), value: summary.active, cls: "text-green-500" },
            { label: t("admin.cooperatives.approvals.tabRejected"), value: summary.rejected, cls: "text-red-500" },
          ].map(card => (
            <Card key={card.label} className="border border-border bg-card shadow-none">
              <CardContent className="p-4 text-center">
                <p className={`text-[28px] font-bold ${card.cls}`}>{card.value}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map(item => (
            <Button
              key={item.key}
              size="sm"
              variant={tab === item.key ? "default" : "outline"}
              onClick={() => setTab(item.key)}
            >
              {t(item.labelKey)}
            </Button>
          ))}
        </div>

        <Card className="border border-border bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-[16px] font-semibold">
              {t("admin.cooperatives.approvals.title")}
              <span className="ml-1 font-normal text-muted-foreground">({rows.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {loading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">{t("admin.cooperatives.approvals.empty")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.cooperatives.approvals.emptyHint")}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colName")}</th>
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colLeader")}</th>
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colDistrict")}</th>
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colMembers")}</th>
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colRegistered")}</th>
                    <th className="px-4 py-2 font-medium">{t("admin.cooperatives.approvals.colStatus")}</th>
                    <th className="px-4 py-2 text-right font-medium">{t("admin.cooperatives.approvals.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">
                        {row.leader ? (
                          <span className="block">
                            {row.leader.name}
                            <span className="block text-xs text-muted-foreground">{row.leader.email}</span>
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">{row.district ?? "—"}</td>
                      <td className="px-4 py-3">{row.memberCount}</td>
                      <td className="px-4 py-3">{new Date(row.registeredAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status] ?? ""}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openDetail(row.id)}>
                            {t("admin.cooperatives.approvals.review")}
                          </Button>
                          {row.status === "pending" && (
                            <>
                              <Button size="sm" onClick={() => setApproveTarget(row)}>
                                <Check className="mr-1 h-3.5 w-3.5" />
                                {t("admin.cooperatives.approvals.approve")}
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setRejectTarget(row)}>
                                <X className="mr-1 h-3.5 w-3.5" />
                                {t("admin.cooperatives.approvals.reject")}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Detail ─────────────────────────────────────────────────────────── */}
      <Dialog open={!!detail} onOpenChange={open => !open && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("admin.cooperatives.approvals.detailTitle")}</DialogTitle>
            <DialogDescription>{detail?.name}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [t("admin.cooperatives.approvals.colDistrict"), detail.district ?? "—"],
                [t("admin.cooperatives.approvals.registrationNumber"), detail.registrationNumber ?? "—"],
                [t("admin.cooperatives.approvals.contactEmail"), detail.contactEmail ?? "—"],
                [t("admin.cooperatives.approvals.contactPhone"), detail.contactPhone ?? "—"],
                [t("admin.cooperatives.approvals.colLeader"), detail.leader ? `${detail.leader.name} · ${detail.leader.email}` : "—"],
                [t("admin.cooperatives.approvals.colMembers"), String(detail.memberCount)],
                [t("admin.cooperatives.approvals.farmsOwned"), String(detail.farmsOwnedByMembers)],
                [t("admin.cooperatives.approvals.farmsLinked"), String(detail.farmsLinkedToCooperative)],
                [t("admin.cooperatives.approvals.colStatus"), detail.status],
                [t("admin.cooperatives.approvals.colRegistered"), new Date(detail.registeredAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-xs font-medium text-muted-foreground">{label}</p>
                  <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
                </div>
              ))}
              {detail.description && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("cooperative.profile.description")}
                  </p>
                  <p className="mt-0.5 text-sm leading-6">{detail.description}</p>
                </div>
              )}
              {detail.rejectionReason && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-red-600">
                    {t("auth.pending.reasonLabel")}
                  </p>
                  <p className="mt-0.5 text-sm leading-6">{detail.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detail?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={() => { setRejectTarget(detail); }}>
                  {t("admin.cooperatives.approvals.reject")}
                </Button>
                <Button onClick={() => setApproveTarget(detail)}>
                  {t("admin.cooperatives.approvals.approve")}
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setDetail(null)}>
              {t("admin.cooperatives.approvals.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Approve confirm ────────────────────────────────────────────────── */}
      <AlertDialog open={!!approveTarget} onOpenChange={open => !open && setApproveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{approveTarget?.name}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.cooperatives.approvals.approveConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>
              {t("admin.cooperatives.approvals.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={approve} disabled={busy}>
              {t("admin.cooperatives.approvals.approve")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject, with a mandatory reason ────────────────────────────────── */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={open => { if (!open) { setRejectTarget(null); setReason("") } }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.cooperatives.approvals.rejectTitle")}</DialogTitle>
            <DialogDescription>{rejectTarget?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">
              {t("admin.cooperatives.approvals.rejectReasonLabel")}
            </Label>
            <textarea
              id="reject-reason"
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t("admin.cooperatives.approvals.rejectReasonPlaceholder")}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => { setRejectTarget(null); setReason("") }}
              disabled={busy}
            >
              {t("admin.cooperatives.approvals.cancel")}
            </Button>
            <Button variant="destructive" onClick={reject} disabled={busy || !reason.trim()}>
              {t("admin.cooperatives.approvals.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
