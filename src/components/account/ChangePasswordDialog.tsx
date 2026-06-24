import { useState } from "react"
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

export function ChangePasswordDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const { mutate: doChangePassword, loading: changingPw } = useChangePassword()

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

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
