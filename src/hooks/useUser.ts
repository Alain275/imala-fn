import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  userService,
  UserProfile,
  UpdateProfileInput,
  ChangePasswordInput,
  DeleteAccountInput,
} from '@/services/users'

interface UserState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

function useUserFetch<T>(
  fetcher: () => Promise<T>,
  errorLabel: string
): UserState<T> & { refetch: () => void } {
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<UserState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const refetch = useCallback(() => setVersion(v => v + 1), [])

  useEffect(() => {
    let cancelled = false
    setState(prev => ({ ...prev, loading: true, error: null }))

    fetcher()
      .then(data => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : `Failed to load ${errorLabel}`
        setState({ data: null, loading: false, error: message })
        toast.error(message)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version])

  return { ...state, refetch }
}

// api.ts throws { response: { data: { message }, status } } on !response.ok
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  const structured = err as { response?: { data?: { message?: string } } }
  return structured?.response?.data?.message ?? fallback
}

export function useProfile() {
  return useUserFetch<UserProfile>(() => userService.getProfile(), 'profile')
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (body: UpdateProfileInput, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await userService.updateProfile(body)
      toast.success('Profile updated successfully')
      onSuccess?.()
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to update profile')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useChangePassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (body: ChangePasswordInput, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await userService.changePassword(body)
      toast.success('Password changed successfully')
      onSuccess?.()
    } catch (err: unknown) {
      // extractErrorMessage surfaces backend rule violations (uppercase/number/symbol etc.)
      const message = extractErrorMessage(err, 'Failed to change password')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

export function useDeleteAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = async (body: DeleteAccountInput, onSuccess?: () => void) => {
    setLoading(true)
    setError(null)
    try {
      await userService.deleteAccount(body)
      onSuccess?.()
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to delete account')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}
