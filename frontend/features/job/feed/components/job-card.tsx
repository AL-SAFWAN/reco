"use client"

import { Car, Clock, MapPin, Navigation, Zap } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/job-data"
import { Job } from "../../schema/jobSchema"

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    closed: "bg-secondary text-secondary-foreground",
    // completed: "bg-muted text-muted-foreground",
  }
  const labels: Record<Status, string> = {
    open: "Open",
    closed: "Closed",
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border-transparent text-[10px] font-semibold",
        styles[status]
      )}
    >
      {labels[status]}
    </Badge>
  )
}

export function JobCard({
  job,
  selected,
  onSelect,
}: {
  job: Job
  selected: boolean
  onSelect: () => void
}) {
  const taken = job.lead_status !== "open"

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-2xl border bg-card p-4 text-left transition-all",
        selected
          ? "border-foreground ring-1 ring-foreground"
          : "border-border hover:border-foreground/30 hover:bg-accent/40",
        taken && "opacity-60"
      )}
    >
      {/* Top row: urgency + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {job.urgency === "Immediate" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                <Zap className="size-2.5" />
                Urgent
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Scheduled
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={job.lead_status} />
      </div>

      {/* Service type */}
      <h3 className="mt-2.5 text-base leading-tight font-bold text-foreground">
        {job.service_type}
      </h3>

      {/* Meta row */}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatRelativeTime(job.created_at)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Car className="size-3.5" />
          {job.vehicle_make_model}
        </span>
        <span className="inline-flex items-center gap-1">
          <Navigation className="size-3.5" />
          {job.distance_miles} mi
        </span>
      </div>

      <div className="mt-1.5 flex items-start gap-1 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" />
        <span className="line-clamp-1">{job.pickup_location}</span>
      </div>

      {/* Price row */}
      <div className="mt-3 flex items-end justify-between border-t border-border/60 pt-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Lead price
          </p>
          <p className="text-lg font-black text-foreground">
            £{job.lead_price}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Est. payout
          </p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            £{job.estimated_payout}
          </p>
        </div>
      </div>
    </button>
  )
}
