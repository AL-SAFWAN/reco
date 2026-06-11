"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  BookmarkIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  CircleDollarSignIcon,
  Clock,
  Coins,
  MapPinIcon,
  RssIcon,
  ZapIcon,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { AuthGuard } from "@/features/auth/components/auth-guard"
import { useUser } from "@/features/auth/hooks/auth"
import {
  useMarketplaceJobsQuery,
  useUserLeadsQuery,
  useSavedJobsQuery,
} from "@/features/job/hooks/job"
import { Button } from "@/components/ui/button"
import { cn, formatRelativeTime } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// ── Helpers ────────────────────────────────────────────────────────

function MetricTile({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 border-r border-background/15 pr-6 last:border-0 last:pr-0">
      <span className="text-[11px] font-semibold tracking-widest text-background/50 uppercase">
        {label}
      </span>
      <span className="text-3xl font-black text-background tabular-nums">
        {value}
      </span>
      {sub && <span className="text-xs text-background/40">{sub}</span>}
    </div>
  )
}

function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  dark,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  dark?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-1 flex-col justify-between gap-2 rounded-2xl p-4 transition-all sm:gap-8 sm:p-6",
        dark
          ? "bg-foreground text-background hover:bg-foreground/90"
          : "border border-border bg-card hover:border-foreground/30 hover:bg-accent/40"
      )}
    >
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-full",
          dark ? "bg-background/10" : "bg-foreground/8"
        )}
      >
        <Icon
          className={cn("size-5", dark ? "text-background" : "text-foreground")}
        />
      </div>
      <div>
        <p
          className={cn(
            "text-base font-bold",
            dark ? "text-background" : "text-foreground"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm",
            dark ? "text-background/60" : "text-muted-foreground"
          )}
        >
          {description}
        </p>
      </div>
      <ArrowRightIcon
        className={cn(
          "size-4 transition-transform group-hover:translate-x-1",
          dark ? "text-background/60" : "text-muted-foreground"
        )}
      />
    </Link>
  )
}

function ActivityRow({
  title,
  meta,
  right,
  dot,
}: {
  title: string
  meta: string
  right: React.ReactNode
  dot?: "green" | "gray"
}) {
  return (
    <li className="flex items-center gap-4 py-3.5">
      <span
        className={cn(
          "mt-0.5 size-2 shrink-0 rounded-full",
          dot === "green" ? "bg-emerald-500" : "bg-muted-foreground/30"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      {right}
    </li>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────

function Dashboard() {
  const { data: user } = useUser()
  const { data: marketplaceJobs = [] } = useMarketplaceJobsQuery()
  const { data: leads = [] } = useUserLeadsQuery()
  const { data: savedJobs = [] } = useSavedJobsQuery()

  const openJobs = marketplaceJobs.filter((j) => j.lead_status === "open")

  const savedJobDetails = savedJobs
    .slice(0, 6)
    .map((s) => marketplaceJobs.find((j) => j.id === s.job_id))
    .filter(Boolean)

  const purchasedJobDetails = leads
    .slice(0, 6)
    .map((l) => marketplaceJobs.find((j) => j.id === l.job_id))
    .filter(Boolean)

  const totalEstimatedValue = purchasedJobDetails.reduce(
    (sum, job) => sum + (job?.estimated_payout ?? 0),
    0
  )

  const firstName = user?.first_name ?? "there"
  const lastName = user?.last_name ?? ""
  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="bg-foreground px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="mb-1 text-sm font-medium text-background/50">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
                ? "afternoon"
                : "evening"}
            ,
          </p>
          <h1 className="mb-8 text-4xl font-black tracking-tight text-background sm:text-5xl">
            {firstName} {lastName}
          </h1>

          <div className="flex flex-wrap gap-x-6 gap-y-4">
            <MetricTile
              label="Open Jobs"
              value={openJobs.length}
              sub="available now"
            />
            <MetricTile
              label="Leads Purchased"
              value={leads.length}
              sub="all time"
            />
            <MetricTile
              label="Saved"
              value={savedJobs.length}
              sub="bookmarked"
            />
            <MetricTile
              label="Est. Value"
              value={`£${totalEstimatedValue.toFixed(0)}`}
              sub="from purchases"
            />
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6">
        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Quick Actions
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-3">
            <ActionCard
              href="/feed"
              icon={RssIcon}
              title="Browse Jobs"
              description="View open recovery leads near you"
              dark
            />
            <ActionCard
              href="/posting"
              icon={BriefcaseIcon}
              title="Post a Job"
              description="Create a new recovery lead listing"
            />
            <ActionCard
              href="/feed"
              icon={BookmarkIcon}
              title="Saved Jobs"
              description={`${savedJobs.length} job${savedJobs.length === 1 ? "" : "s"} bookmarked`}
            />
          </div>
        </div>

        {/* Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Saved Jobs */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Saved Jobs
              </h2>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                See all <ChevronRightIcon className="size-3" />
              </Link>
            </div>
            <div className="rounded-2xl border bg-card">
              {savedJobDetails.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <BookmarkIcon className="size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No saved jobs yet
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/feed">Browse feed</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border px-5">
                  {savedJobDetails.map((job) =>
                    job ? (
                      <ActivityRow
                        key={job.id}
                        title={job.service_type}
                        meta={`${job.pickup_area} · ${job.vehicle_make_model}`}
                        dot={job.lead_status === "open" ? "green" : "gray"}
                        right={
                          <span className="inline-flex shrink-0 items-center text-xs font-semibold text-foreground tabular-nums">
                            <Coins className="size-3" /> {job.lead_price}
                          </span>
                        }
                      />
                    ) : null
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Purchased Leads */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Purchased Leads
              </h2>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                See all <ChevronRightIcon className="size-3" />
              </Link>
            </div>
            <div className="rounded-2xl border bg-card">
              {purchasedJobDetails.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
                  <CircleDollarSignIcon className="size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No purchased leads yet
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/feed">Find jobs</Link>
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border px-5">
                  {purchasedJobDetails.map((job) =>
                    job ? (
                      <ActivityRow
                        key={job.id}
                        title={job.service_type}
                        meta={`${job.pickup_area} · ${job.vehicle_make_model}`}
                        dot="green"
                        right={
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-xs font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                              £{job.estimated_payout}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              est. payout
                            </span>
                          </div>
                        }
                      />
                    ) : null
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Latest Open Jobs strip */}
        {openJobs.length > 0 && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Latest Open Jobs
              </h2>
              <Link
                href="/feed"
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:underline"
              >
                View all <ChevronRightIcon className="size-3" />
              </Link>
            </div>
            <ScrollArea className="w-full pb-2">
              <div className="flex gap-3 pb-2">
                {openJobs.slice(0, 6).map((job) => (
                  <Link
                    key={job.id}
                    href="/feed"
                    className="group flex w-48 shrink-0 flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/40"
                  >
                    <div className="flex items-center justify-between">
                      {job.urgency === "Immediate" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-bold text-background">
                          <ZapIcon className="size-2.5" />
                          Urgent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          Scheduled
                        </span>
                      )}
                      <span className="inline-flex items-center text-xs font-bold text-foreground">
                        <Coins className="size-3" /> {job.lead_price}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm leading-tight font-semibold text-foreground">
                        {job.service_type}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3 shrink-0" />

                        {formatRelativeTime(job.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <Navbar />
      <Dashboard />
    </AuthGuard>
  )
}
