import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { cooperativeApi } from "@/services/cooperative.service"

/**
 * Keeps unapproved cooperative leaders out of the dashboard shell.
 *
 * Without this the leader would reach the Overview and see every card fail
 * with 403 COOPERATIVE_NOT_APPROVED — technically correct, unreadable in
 * practice. GET /cooperative/status is the one endpoint that answers before
 * approval, so it is safe to call here.
 *
 * Fails OPEN: if the status check itself errors (network, unexpected shape)
 * the dashboard renders and its own endpoints report whatever is wrong. A
 * transient blip should not lock a legitimately approved leader out.
 */
export function CooperativeApprovalGuard() {
  const [state, setState] = useState<"checking" | "allowed" | "blocked">("checking")

  useEffect(() => {
    let cancelled = false
    cooperativeApi
      .getApprovalStatus()
      .then(status => {
        if (!cancelled) setState(status.canAccessDashboard ? "allowed" : "blocked")
      })
      .catch(() => {
        if (!cancelled) setState("allowed")
      })
    return () => { cancelled = true }
  }, [])

  if (state === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (state === "blocked") return <Navigate to="/cooperative/pending" replace />

  return <Outlet />
}
