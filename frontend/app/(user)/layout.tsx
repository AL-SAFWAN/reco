import Navbar from "@/components/navbar"
import { AuthGuard } from "@/features/auth/components/auth-guard"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <Navbar />
      {children}
    </AuthGuard>
  )
}
