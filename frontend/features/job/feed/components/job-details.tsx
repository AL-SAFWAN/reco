"use client"

import type React from "react"

import {
  Bookmark,
  BookmarkCheck,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./job-card"
import { Job } from "../../schema/jobSchema"

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
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
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

export function JobDetail({
  job,
  saved,
  purchased,
  onToggleSave,
  onBuy,
}: {
  job: Job
  saved: boolean
  purchased: boolean
  onToggleSave: () => void
  onBuy: () => void
}) {
  const isOpen = job.status === "open" && !purchased

  return (
    <div className="flex h-fit flex-col overflow-hidden rounded-lg border bg-card">
      <div className="border-b p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {job.urgency === "Immediate" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  <Zap className="size-3.5" />
                  Immediate
                </span>
              )}
              <span className="font-mono text-xs text-muted-foreground">
                {job.id}
              </span>
            </div>
            <h2 className="text-2xl leading-tight font-bold text-balance text-foreground">
              {job.service_type}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Navigation className="size-4" />
                {job.distance_miles} mi away
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-4" />
                {/* TODO are we doing a count down here?  */}
                {/* {job.scheduled_time ?? job.created_at} */}
              </span>
            </div>
          </div>
          <StatusBadge status={purchased ? "purchased" : job.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Lead price</p>
            <p className="text-2xl font-bold text-foreground">
              £{job.lead_price}
            </p>
          </div>
          <div className="rounded-lg border bg-background p-3">
            <p className="text-xs text-muted-foreground">Estimated payout</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              £{job.estimated_payout}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {purchased ? (
            <Button disabled className="min-w-40">
              <CheckCircle2 className="size-4" />
              Job purchased
            </Button>
          ) : (
            <Button className="min-w-40" disabled={!isOpen} onClick={onBuy}>
              {isOpen
                ? `Buy this job · £${job.lead_price}`
                : "No longer available"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onToggleSave}
            className={cn(saved && "text-primary")}
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

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <Section title="Job overview">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </Section>

        <Section title="Vehicle">
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-background p-4">
            <Detail label="Make & model" value={job.vehicle_make_model} />
            <Detail label="Registration" value={job.vehicle_reg} />
            <Detail label="Class" value={job.vehicle_class} />
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">Condition</p>
              <p className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                <Car className="size-4" />
                {job.is_drivable ? "Drivable" : "Not drivable"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Route">
          <div className="space-y-3 rounded-lg border bg-background p-4">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Pickup ({job.pickup_area})
                </p>
                <p className="text-sm font-medium text-foreground">
                  {job.pickup_location}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Drop-off</p>
                <p className="text-sm font-medium text-foreground">
                  {job.dropoff_location}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* <Section title="Notes from poster">
          <BulletList items={job.notes} />
        </Section>

        <Section title="Requirements">
          <BulletList items={job.requirements} />
        </Section> */}
        {/* 
        <Section title="Posted by">
          <div className="flex items-center justify-between rounded-lg border bg-background p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {job.poster_name}
              </p>
              <p className="text-xs text-muted-foreground">{job.poster_type}</p>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {job.poster_rating.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {job.poster_jobs_posted} jobs posted
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Payment held securely until the job is marked complete.
          </p>
        </Section> */}
      </div>
    </div>
  )
}
