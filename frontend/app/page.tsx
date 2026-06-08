"use client"

import Navbar from "@/components/navbar"
import { AuthGuard } from "@/features/auth/components/auth-guard"

export default function Page() {
  return (
    <AuthGuard>
      <Navbar />
      home
    </AuthGuard>
  )
}
