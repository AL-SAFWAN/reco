"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { HomeIcon, RssIcon, BriefcaseIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/feed", label: "Feed", icon: RssIcon },
  { href: "/posting", label: "Jobs", icon: BriefcaseIcon },
]

export const NavMenu = ({
  orientation,
  ...props
}: ComponentProps<typeof NavigationMenu>) => {
  const pathname = usePathname()
  const isVertical = orientation === "vertical"

  return (
    <NavigationMenu orientation={orientation} {...props}>
      <NavigationMenuList className="w-full data-[orientation=vertical]:-ms-2 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <NavigationMenuItem key={href} className="w-full">
              <NavigationMenuLink asChild data-active={isActive}>
                {isVertical ? (
                  <Link
                    href={href}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                ) : (
                  <Link
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-0.5 border-b-2 px-3 pt-2 pb-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                )}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
