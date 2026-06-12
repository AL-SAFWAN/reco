"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLogoutMutation, useUser } from "@/features/auth/hooks/auth"

function AuthButton() {
  const { data: user } = useUser()
  const logout = useLogoutMutation()

  const handleLogout = () => {
    logout.mutate()
  }

  return (
    user &&
    !user.email_verified && (
      <Button variant="outline" onClick={handleLogout} className="-mt-2 w-full">
        Logout
      </Button>
    )
  )
}

export default AuthButton
