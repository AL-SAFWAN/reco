"use client"

import { useUser } from "@/features/auth/hooks/auth"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ApiError } from "@/fetcher/baseFetcher"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, error } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      const isUnauthorized = error instanceof ApiError && error.status === 401
      if (isUnauthorized || error) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
      }
      return
    }

    if (!user.email_verified) {
      router.replace("/otp")
    }
  }, [isLoading, user, error, router, pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!user) return null
  if (!user.email_verified) return null

  return <>{children}</>
}
