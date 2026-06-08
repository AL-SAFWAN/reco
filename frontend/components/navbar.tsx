"use client"
import { Button } from "@/components/ui/button"
import { NavMenu } from "@/components/nav-menu"
import { NavigationSheet } from "@/components/navigation-sheet"
import { UserNav } from "@/features/job/post/components/user-nav"

const Navbar = () => {
  return (
    <nav className="h-16 border-b bg-background">
      <div className="mx-auto flex h-full max-w-(--breakpoint-xl) items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="hidden flex-col leading-none sm:flex">
          <p className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
            RECo
          </p>
          <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Recovery Platform
          </p>
        </div>
        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <NavMenu />
          <UserNav />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <NavigationSheet />
          <UserNav />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
