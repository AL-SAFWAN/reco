"use client"

import { Car, Clock, MapPin, Navigation, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Status } from "@/lib/job-data"
import { Job } from "../../schema/jobSchema"

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    purchased: "bg-secondary text-secondary-foreground",
    en_route: "bg-primary/10 text-primary",
    completed: "bg-muted text-muted-foreground",
  }
  const labels: Record<Status, string> = {
    open: "Open",
    purchased: "Purchased",
    en_route: "En route",
    completed: "Completed",
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
  const taken = job.status !== "open"

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-colors",
        selected
          ? "border-primary ring-1 ring-primary"
          : "border-border hover:border-foreground/30 hover:bg-accent/40",
        taken && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {job.urgency === "Immediate" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Zap className="size-3" />
              Immediate
            </span>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {job.id}
          </span>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <h3
        className={cn(
          "mt-2 text-base leading-tight font-semibold text-foreground",
          selected && "text-primary"
        )}
      >
        {job.service_type}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Car className="size-3.5" />
          {job.vehicle_make_model}
        </span>
        <span className="inline-flex items-center gap-1">
          <Navigation className="size-3.5" />
          {job.distance_miles} mi
        </span>
      </div>

      <div className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
        <MapPin className="mt-0.5 size-3.5 shrink-0" />
        <span className="line-clamp-1">{job.pickup_location}</span>
      </div>

      <div className="mt-3 flex items-end justify-between border-t pt-3">
        <div>
          <p className="text-xs text-muted-foreground">Lead price</p>
          <p className="text-base font-bold text-foreground">
            £{job.lead_price}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Est. payout</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            £{job.estimated_payout}
          </p>
        </div>
      </div>

      <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {job.created_at}
      </p>
    </button>
  )
}
