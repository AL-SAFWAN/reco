"use client"
import clientFetcher from "@/fetcher/client.fetcher"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

const NOTIFICATIONS_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/notifications`

export type NotificationType =
  | "lead_purchased"
  | "lead_closed"
  | "customer_updated"

export interface Notification {
  id: string
  type: NotificationType
  job_id: string
  payload: Record<string, unknown>
  read: boolean
  created_at: string
  is_owner: boolean
}

// ── REST queries ──────────────────────────────────────────────────

const fetchNotifications = (): Promise<Notification[]> =>
  clientFetcher(NOTIFICATIONS_URL, { method: "GET" })

const markAllRead = (): Promise<void> =>
  clientFetcher(`${NOTIFICATIONS_URL}/read`, { method: "PATCH" })

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 0,
  })

export const useMarkNotificationsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
        old ? old.map((n) => ({ ...n, read: true })) : []
      )
    },
  })
}

// ── SSE hook — real-time push ─────────────────────────────────────

export const useNotificationStream = () => {
  const queryClient = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const url = `${NOTIFICATIONS_URL}/stream`
    const es = new EventSource(url, { withCredentials: true })
    esRef.current = es

    es.onmessage = (event) => {
      try {
        const incoming: Notification[] = JSON.parse(event.data)
        incoming.forEach((n) => {
          if (n.type === "customer_updated") {
            queryClient.invalidateQueries({
              queryKey: ["job", n.job_id, "changelog"],
            })
          }
          if (n.type === "lead_closed") {
            queryClient.invalidateQueries({ queryKey: ["marketplace"] })
          }
        })
        queryClient.setQueryData<Notification[]>(["notifications"], (old) => {
          const existing = old ?? []
          const existingIds = new Set(existing.map((n) => n.id))
          const newOnes = incoming.filter((n) => !existingIds.has(n.id))
          return newOnes.length > 0 ? [...newOnes, ...existing] : existing
        })
      } catch {
        // ignore parse errors / keepalive comments
      }
    }

    es.onerror = () => {
      // EventSource reconnects automatically; close and let it retry
      es.close()
    }

    return () => {
      es.close()
    }
  }, [queryClient])
}
