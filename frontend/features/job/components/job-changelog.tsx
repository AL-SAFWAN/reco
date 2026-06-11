"use client"

import { History } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import type { JobUpdateLog } from "../schema/jobSchema"

const FIELD_LABELS: Record<string, string> = {
  pickup_location: "Pickup location",
  dropoff_location: "Drop-off location",
  description: "Description",
  customer_name: "Customer name",
  customer_phone: "Customer phone",
}

interface JobChangelogProps {
  logs: JobUpdateLog[] | undefined | null
  isLoading?: boolean
}

export function JobChangelog({ logs, isLoading }: JobChangelogProps) {
  if (isLoading) return null

  if (!logs || logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No updates yet.</p>
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const changedFields = Object.entries(log.changes)
        return (
          <div key={log.id} className="flex gap-3">
            <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground capitalize">
                  {log.changed_by === "customer" ? "Customer" : "Provider"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(log.changed_at)}
                </span>
              </div>
              <div className="space-y-1">
                {changedFields.map(([field, diff]) => (
                  <div key={field} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {FIELD_LABELS[field] ?? field}
                    </span>{" "}
                    changed
                    {diff.old != null && (
                      <span>
                        {" from "}
                        <span className="font-mono line-through opacity-60">
                          {String(diff.old)}
                        </span>
                      </span>
                    )}
                    {diff.new != null && (
                      <span>
                        {" to "}
                        <span className="font-mono font-medium text-foreground">
                          {String(diff.new)}
                        </span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
