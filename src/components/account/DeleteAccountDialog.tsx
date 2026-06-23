import { useState } from "react"
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
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your account and all associated data will be permanently removed.
            Enter your password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2 space-y-2">
          <Label htmlFor="dpa-pw">Password</Label>
          <Input
            id="dpa-pw"
            type="password"
            value={deletePw}
            onChange={e => setDeletePw(e.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deletingAccount || !deletePw}
          >
            {deletingAccount ? 'Deleting…' : 'Delete Account'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
