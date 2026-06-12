"use client"

import { useUser } from "@/features/auth/hooks/auth"
import VerifyAccountForm from "../../../features/auth/components/otp/VerifyAccountForm"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import AuthButton from "@/features/auth/components/ui/AuthButton"

export default function Page() {
  const { data: user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (user.email_verified) {
      router.replace("/")
    }
  }, [isLoading, router, user?.id, user?.email_verified])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className={"space-y-6"}>
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Account setup
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code we sent to{" "}
          <span className="font-medium text-foreground">{user.email}</span>
        </p>
      </div>

      <VerifyAccountForm />

      <AuthButton />
    </div>
  )
}
