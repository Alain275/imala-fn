import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Clock, RefreshCw, XCircle } from "lucide-react"
import { toast } from "sonner"
import { cooperativeApi, type CooperativeApprovalStatus } from "@/services/cooperative.service"
import { authService } from "@/services/auth"

/**
 * Shown to a cooperative leader whose account is not approved yet.
 *
 * Reached two ways: CooperativeGuard redirects here when
 * GET /cooperative/status reports canAccessDashboard=false, and the leader can
 * navigate here directly. Signing in is never blocked — only the dashboard
 * data endpoints are, with 403 COOPERATIVE_NOT_APPROVED.
 */
export default function CooperativePendingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [status, setStatus] = useState<CooperativeApprovalStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (announce: boolean) => {
    try {
      const next = await cooperativeApi.getApprovalStatus()
      setStatus(next)
      if (next.canAccessDashboard) {
        toast.success(t("auth.pending.approved"))
        navigate("/cooperative", { replace: true })
      } else if (announce) {
        toast.info(t("auth.pending.stillPending"))
      }
    } catch {
      // A leader with no membership at all lands here; there is nothing to
      // show them but the generic pending copy.
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [navigate, t])

  useEffect(() => { void load(false) }, [load])

  const rejected = status?.cooperative.status === "rejected"

  return (
    <main className="grid min-h-screen place-items-center bg-[#edf8f1] px-5 py-10">
      <section className="w-full max-w-md border border-[#d2e1d5] bg-white p-7 text-center shadow-[0_18px_50px_rgba(35,72,50,.08)] sm:p-10">
        <div
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full ring-8 ${
            rejected ? "bg-[#fdeaea] ring-[#fdf5f5]" : "bg-[#fdf3d9] ring-[#fdfaf1]"
          }`}
        >
          {rejected ? (
            <XCircle className="h-7 w-7 text-[#a12b2b]" aria-hidden="true" />
          ) : (
            <Clock className="h-7 w-7 text-[#8a6d1e]" aria-hidden="true" />
          )}
        </div>

        <h1 className="mt-6 text-2xl font-black tracking-[-0.025em] text-[#17231b]">
          {rejected ? t("auth.pending.rejectedTitle") : t("auth.pending.title")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#647b6b]">
          {rejected ? t("auth.pending.rejectedText") : t("auth.pending.text")}
        </p>

        {status && (
          <dl className="mt-6 space-y-2 rounded-[6px] border border-[#dde8e0] bg-[#f7fbf8] p-4 text-left text-xs">
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-[#557160]">{t("cooperative.profile.name")}</dt>
              <dd className="text-right text-[#294535]">{status.cooperative.name}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-[#557160]">{t("auth.pending.statusLabel")}</dt>
              <dd className="text-right font-bold text-[#294535]">{status.cooperative.status}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-[#557160]">{t("auth.pending.registeredLabel")}</dt>
              <dd className="text-right text-[#294535]">
                {new Date(status.cooperative.registeredAt).toLocaleDateString()}
              </dd>
            </div>
            {status.cooperative.rejectionReason && (
              <div className="border-t border-[#dde8e0] pt-2">
                <dt className="font-bold text-[#a12b2b]">{t("auth.pending.reasonLabel")}</dt>
                <dd className="mt-1 leading-5 text-[#6b3131]">
                  {status.cooperative.rejectionReason}
                </dd>
              </div>
            )}
          </dl>
        )}

        <button
          type="button"
          onClick={() => { setRefreshing(true); void load(true) }}
          disabled={loading || refreshing}
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#315900] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#b5ff62] hover:bg-[#254500] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? t("auth.pending.refreshing") : t("auth.pending.refresh")}
        </button>
        <button
          type="button"
          onClick={() => { authService.logout?.(); navigate("/sign-in", { replace: true }) }}
          className="mt-3 h-12 w-full rounded-[6px] border border-[#bdd0c1] text-xs font-bold text-[#31553f] hover:bg-[#f2f8f4]"
        >
          {t("auth.pending.signOut")}
        </button>
      </section>
    </main>
  )
}
