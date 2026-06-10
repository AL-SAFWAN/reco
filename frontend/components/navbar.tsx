"use client"
import { NavMenu } from "@/components/nav-menu"
import { NavigationSheet } from "@/components/navigation-sheet"
import { UserNav } from "@/features/job/post/components/user-nav"
import { TokenBalance } from "@/components/token-balance"

const Navbar = () => {
  return (
    <nav className="h-16 border-b border-border/60 bg-background">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col leading-none">
          <p className="text-base font-black tracking-tight text-foreground sm:text-xl">
            RECo
          </p>
          <p className="text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Recovery Platform
          </p>
        </div>
        {/* Desktop Menu */}
        <div className="hidden items-center gap-4 md:flex">
          <NavMenu />
          <TokenBalance />
          <UserNav />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <TokenBalance compact />
          <NavigationSheet />
          <UserNav />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
