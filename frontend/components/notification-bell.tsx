"use client"
import { Bell } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type Notification,
  useMarkNotificationsReadMutation,
  useNotificationStream,
  useNotificationsQuery,
} from "@/features/notifications/hooks/notifications"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu"

// ── Label helpers ─────────────────────────────────────────────────

function notificationLabel(n: Notification): string {
  const service = (n.payload.service_type as string) ?? "a job"
  switch (n.type) {
    case "lead_purchased":
      return `Service Provider has purchased your lead for ${service}`
    case "lead_closed":
      return n.is_owner
        ? `Your Job for ${service} is now closed - full info unlocked`
        : `A Job for ${service} you purchased is now closed - full info unlocked`
    case "customer_updated":
      return `Customer updated details for ${service}`
    default:
      return "New notification"
  }
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

// ── Component ─────────────────────────────────────────────────────

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotificationsQuery()
  const { mutate: markRead } = useMarkNotificationsReadMutation()

  // Start SSE stream
  useNotificationStream()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleOpen = (next: boolean) => {
    setOpen(next)
    if (next && unreadCount > 0) {
      markRead()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 p-0 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </div>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/feed/${n.job_id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex flex-col gap-0.5 px-4 py-3 text-sm transition-colors hover:bg-muted/70",
                      !n.read && "bg-muted/50"
                    )}
                  >
                    <span className="leading-snug font-medium">
                      {notificationLabel(n)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(n.created_at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
export function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const { data: notifications = [] } = useNotificationsQuery()
  const { mutate: markRead } = useMarkNotificationsReadMutation()

  // Start SSE stream

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleOpen = (next: boolean) => {
    setOpen(next)
    if (next && unreadCount > 0) {
      markRead()
    }
  }

  //
  // check if i onw the job

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub open={open} onOpenChange={handleOpen}>
        <DropdownMenuSubTrigger className="relative">
          Notifications
          {unreadCount > 0 && (
            <span>({unreadCount > 9 ? "9+" : unreadCount})</span>
          )}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent className="w-80 p-0">
            <div className="border-b px-4 py-3">
              <p className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                Notifications
              </p>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <ScrollArea className="h-80">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    asChild
                    className="rounded-none pt-3"
                  >
                    <Link
                      href={
                        n.is_owner
                          ? `/posting/edit/${n.job_id}`
                          : `/feed/${n.job_id}`
                      }
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-start border-b first:pt-3 last:border-0 hover:bg-muted/70",

                        !n.read && "bg-muted/50"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-1.5 ml-2 h-2 w-2 rounded-full",
                          n.read ? "bg-muted-foreground/50" : "bg-foreground"
                        )}
                      />
                      <div className="flex flex-col gap-0.5 px-2 pb-1 text-sm">
                        <span className="text-sm leading-snug font-medium">
                          {notificationLabel(n)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(n.created_at)}
                        </span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
}
