"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLogout, useUser } from "@/features/auth/hooks/auth"

function AuthButton() {
  const { data: user } = useUser()
  const logout = useLogout()

  return (
    user &&
    !user.email_verified && (
      <Button variant="outline" onClick={logout} className="-mt-2 w-full">
        Logout
      </Button>
    )
  )
}

export default AuthButton
