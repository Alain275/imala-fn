import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDeleteAccount } from "@/hooks/useUser"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted: () => void
}

export function DeleteAccountDialog({ open, onOpenChange, onDeleted }: Props) {
  const { t } = useTranslation()
  const { mutate: doDeleteAccount, loading: deletingAccount } = useDeleteAccount()
  const [deletePw, setDeletePw] = useState('')

  const handleOpenChange = (next: boolean) => {
    if (!next) setDeletePw('')
    onOpenChange(next)
  }

  const handleDelete = () => {
    doDeleteAccount({ password: deletePw }, () => {
      onDeleted()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("dashboard.account.deleteAccount.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("dashboard.account.deleteAccount.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2 space-y-2">
          <Label htmlFor="dpa-pw">{t("dashboard.account.deleteAccount.passwordLabel")}</Label>
          <Input
            id="dpa-pw"
            type="password"
            value={deletePw}
            onChange={e => setDeletePw(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.actions.cancel")}</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletingAccount || !deletePw}
          >
            {deletingAccount ? t("dashboard.account.deleteAccount.deleting") : t("dashboard.account.deleteAccount.submit")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
