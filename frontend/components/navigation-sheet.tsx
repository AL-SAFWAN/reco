import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { NavMenu } from "@/components/nav-menu"

export const NavigationSheet = () => {
  return (
    <Sheet>
      <VisuallyHidden>
        <SheetTitle>Navigation Menu</SheetTitle>
      </VisuallyHidden>

      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full px-6 py-3">
        <div className="hidden flex-col leading-none sm:flex">
          <p className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
            RECo
          </p>
          <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Recovery Platform
          </p>
        </div>
        <NavMenu
          className="mt-6 w-full [&>div]:h-full [&>div]:w-full"
          orientation="vertical"
        />
      </SheetContent>
    </Sheet>
  )
}
