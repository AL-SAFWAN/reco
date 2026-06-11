"use client"

import React from "react"

import {
  Bookmark,
  BookmarkCheck,
  Car,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Navigation,
  Zap,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Job } from "../../schema/jobSchema"
import { usePurchaseLeadMutation, useJobChangelogQuery } from "../../hooks/job"
import { StatusBadge } from "./job-card"
import { JobChangelog } from "../../components/job-changelog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const Redacted = ({
  size = "large",
  className,
}: {
  size?: string
  className?: string
}) => {
  if (size === "small") {
    return (
      <div className={cn("flex space-x-0.5", className)}>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
        <div className="h-4 w-2 bg-black"></div>
      </div>
    )
  }

  return (
    <div className={cn("flex space-x-0.5", className)}>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
      <div className="h-6 w-2 bg-black"></div>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-nowrap text-foreground">
          {title}
        </h3>
        <div className="h-px w-full bg-foreground/5" />
      </div>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      {value ? (
        <p className="text-sm font-medium text-foreground">{value} </p>
      ) : (
        <Redacted />
      )}
    </div>
  )
}

export function JobDetail({
  job,
  saved,
  purchased,
  onToggleSave,
}: {
  job: Job
  saved: boolean
  purchased: boolean
  onToggleSave: () => void
}) {
  const isOpen = job.lead_status === "open" && !purchased
  const purchaseLeadMutation = usePurchaseLeadMutation()
  return (
    <div className="flex h-fit flex-col overflow-hidden rounded-2xl border bg-card">
      {/* ── Header ── */}
      <div className="bg-foreground px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {job.urgency === "Immediate" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/15 px-2 py-0.5 text-[10px] font-bold text-background">
                  <Zap className="size-3" />
                  Urgent
                </span>
              ) : (
                <span className="rounded-full bg-background/10 px-2 py-0.5 text-[10px] font-semibold text-background/60">
                  Scheduled
                </span>
              )}
              <span className="font-mono text-[10px] text-background/30">
                {job.id.slice(0, 8)}
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-balance text-background">
              {job.service_type}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-background/50">
              {job.distance_miles !== undefined ? (
                <span className="inline-flex items-center gap-1">
                  <Navigation className="size-3.5" />
                  {job.distance_miles} mi away
                </span>
              ) : (
                <div className="flex space-x-0.5 pl-1">
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                  <div className="h-4 w-2 bg-white dark:bg-black"></div>
                </div>
              )}
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatRelativeTime(job.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-background/10 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider text-background/50 uppercase">
              Buyers
            </p>
            <p className="mt-0.5 text-2xl font-black text-background">
              {job.purchase_count}/{job.max_buyers}
            </p>
          </div>
          <div className="rounded-xl bg-background/10 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider text-background/50 uppercase">
              Lead
            </p>
            <p className="mt-0.5 text-2xl font-black text-background">
              <span className="inline-flex items-center gap-0.5">
                <Coins className="size-4" /> {job.lead_price}
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-background/10 px-3 py-2.5">
            <p className="text-[10px] font-semibold tracking-wider text-background/50 uppercase">
              Payout
            </p>
            <p className="mt-0.5 text-2xl font-black text-emerald-400">
              £{job.estimated_payout}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {purchased ? (
            <Button
              disabled
              className="min-w-40 bg-background/10 text-background disabled:opacity-70"
            >
              <CheckCircle2 className="size-4" />
              Job purchased
            </Button>
          ) : (
            <Button
              className="min-w-40 bg-background text-foreground hover:bg-background/90"
              disabled={!isOpen || purchaseLeadMutation.isPending}
              onClick={() =>
                purchaseLeadMutation.mutate(job.id, {
                  onError: () => {},
                })
              }
            >
              {isOpen ? (
                <span className="inline-flex items-center gap-0.5">
                  Buy this job ·{" "}
                  <span className="inline-flex items-center">
                    <Coins className="size-3" /> {job.lead_price}{" "}
                  </span>
                </span>
              ) : (
                "No longer available"
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onToggleSave}
            className={cn(
              "border-background/10! bg-background/5! text-background! hover:bg-background/20! hover:text-background!",
              saved && "border-background/40"
            )}
          >
            {saved ? (
              <BookmarkCheck className="size-4" />
            ) : (
              <Bookmark className="size-4" />
            )}
            {saved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {job.description && (
          <Section title="Overview">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {job.description}
            </p>
          </Section>
        )}

        <Section title="Customer">
          <div className="grid grid-cols-2 gap-3 rounded-2xl">
            <Detail label="Name" value={job.customer_name} />
            <Detail label="Email" value={job.customer_email} />
            <Detail label="Phone" value={job.customer_phone} />
          </div>
        </Section>
        <Section title="Vehicle">
          <div className="grid grid-cols-2 gap-3 rounded-2xl">
            <Detail label="Make & model" value={job.vehicle_make_model} />
            <Detail label="Registration" value={job.vehicle_reg} />
            <Detail label="Class" value={job.vehicle_class} />
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Condition</p>
              {job.is_drivable !== undefined ? (
                <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  <Car className="size-4" />
                  {job.is_drivable ? "Drivable" : "Not drivable"}
                </p>
              ) : (
                <Redacted />
              )}
            </div>
          </div>
        </Section>

        <Section title="Route">
          <div className="grid grid-cols-2 space-y-3 rounded-2xl">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="flex items-center text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  Pickup ·{" "}
                  {job.pickup_area ? (
                    <p>{job.pickup_area}</p>
                  ) : (
                    <Redacted size="small" className="pl-1" />
                  )}
                </span>
                {job.pickup_location ? (
                  <p className="text-sm font-medium text-foreground">
                    {job.pickup_location}
                  </p>
                ) : (
                  <Redacted className="pt-1" />
                )}
              </div>
            </div>
            {(typeof job.dropoff_location === "undefined" ||
              (job.dropoff_location && job.dropoff_location?.length > 0)) && (
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-foreground" />
                <div>
                  <p className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                    Drop-off
                  </p>
                  {job.dropoff_location ? (
                    <p className="text-sm font-medium text-foreground">
                      {job.dropoff_location}
                    </p>
                  ) : (
                    <Redacted className="pt-1" />
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>

        {purchased && <ChangelogSection jobId={job.id} />}
      </div>
    </div>
  )
}

// ── Changelog section (purchasers only) ───────────────────────────

function ChangelogSection({ jobId }: { jobId: string }) {
  const { data: logs = null, isLoading } = useJobChangelogQuery(jobId)
  return (
    <Section title="Update log">
      <ScrollArea className={"h-28"}>
        <JobChangelog logs={logs} isLoading={isLoading} />
        <ScrollBar />
      </ScrollArea>
    </Section>
  )
}
