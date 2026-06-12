"use client"

import { NotificationMenu } from "@/components/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser, useLogout } from "@/features/auth/hooks/auth"
import {
  useNotificationsQuery,
  useNotificationStream,
} from "@/features/notifications/hooks/notifications"
import { LogOutIcon } from "lucide-react"

export function UserNav() {
  const { data: user } = useUser()

  const { data: notifications = [] } = useNotificationsQuery()
  useNotificationStream()
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : "?"

  const unreadCount = notifications.filter((n) => !n.read).length
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="relative h-9 w-9 hover:cursor-pointer">
          <AvatarImage src="/avatars/03.png" alt={user?.first_name} />
          <AvatarFallback>{initials}</AvatarFallback>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="truncate text-sm leading-none font-medium">
              {user ? `${user.first_name} ${user.last_name}` : "—"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <NotificationMenu />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => useLogout()}
        >
          <LogOutIcon className="mr-2 size-4 stroke-destructive" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
