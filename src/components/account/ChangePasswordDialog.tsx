import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { useChangePassword } from "@/hooks/useUser"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type PasswordStrength = "weak" | "medium" | "strong"

// Simple client-side heuristic: length + character-class variety. Not a
// substitute for backend validation — just an at-a-glance signal for the user.
function computePasswordStrength(pw: string): PasswordStrength {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return "weak"
  if (score <= 3) return "medium"
  return "strong"
}

const STRENGTH_STYLES: Record<PasswordStrength, { bar: string; text: string; segments: number }> = {
  weak: { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", segments: 1 },
  medium: { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", segments: 2 },
  strong: { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", segments: 3 },
}

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { mutate: doChangePassword, loading: changingPw } = useChangePassword()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const strength = useMemo(() => computePasswordStrength(newPw), [newPw])

  const reset = () => {
    setCurrentPw(''); setNewPw(''); setConfirmPw('')
    setShowCurrentPw(false); setShowNewPw(false)
    setValidationError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleSubmit = () => {
    setValidationError(null)
    if (newPw !== confirmPw) { setValidationError(t("dashboard.account.changePassword.mismatchError")); return }
    if (newPw.length < 8) { setValidationError(t("dashboard.account.changePassword.lengthError")); return }
    doChangePassword({ currentPassword: currentPw, newPassword: newPw }, () => {
      reset()
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.account.changePassword.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cpd-current">{t("dashboard.account.changePassword.currentLabel")}</Label>
            <div className="relative">
              <Input
                id="cpd-current"
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPw(v => !v)}
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpd-new">{t("dashboard.account.changePassword.newLabel")}</Label>
            <div className="relative">
              <Input
                id="cpd-new"
                type={showNewPw ? 'text' : 'password'}
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPw(v => !v)}
              >
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPw && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("dashboard.account.changePassword.strengthLabel")}</span>
                  <span className={`font-medium ${STRENGTH_STYLES[strength].text}`}>
                    {t(`dashboard.account.changePassword.strength${strength.charAt(0).toUpperCase()}${strength.slice(1)}`)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${i < STRENGTH_STYLES[strength].segments ? STRENGTH_STYLES[strength].bar : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpd-confirm">{t("dashboard.account.changePassword.confirmLabel")}</Label>
            <Input
              id="cpd-confirm"
              type="password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
            />
          </div>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.actions.cancel")}</Button>
          <Button
            onClick={handleSubmit}
            disabled={changingPw || !currentPw || !newPw || !confirmPw}
          >
            {changingPw ? t("dashboard.account.changePassword.changing") : t("dashboard.account.changePassword.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
