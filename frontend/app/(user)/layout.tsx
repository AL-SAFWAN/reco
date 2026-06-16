import { MobileBottomNav } from "@/components/mobile-nav"
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

      <div className="pb-13 sm:pb-0">{children}</div>
      <MobileBottomNav />
    </AuthGuard>
  )
}
