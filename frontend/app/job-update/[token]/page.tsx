"use client"

import { use } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderPinwheel, CheckCircle2, LinkIcon } from "lucide-react"
import {
  jobCustomerUpdateSchema,
  type JobCustomerUpdate,
} from "@/features/job/schema/jobSchema"
import {
  useJobForCustomerQuery,
  useJobChangelogForCustomerQuery,
  useUpdateJobAsCustomerMutation,
} from "@/features/job/hooks/job"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { JobChangelog } from "@/features/job/components/job-changelog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// ── Field labels ──────────────────────────────────────────────────

const FIELD_LABELS: Record<keyof JobCustomerUpdate, string> = {
  pickup_location: "Current location",
  dropoff_location: "Drop-off location",
  description: "Description & notes",
  customer_name: "Your name",
  customer_phone: "Your phone number",
}

// ── Page ──────────────────────────────────────────────────────────

export default function CustomerJobUpdatePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const { data: job, isLoading, isError, error } = useJobForCustomerQuery(token)
  const { data: changelog, isLoading: changelogLoading } =
    useJobChangelogForCustomerQuery(token)
  const { mutate, isPending, isSuccess, reset } =
    useUpdateJobAsCustomerMutation(token)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobCustomerUpdate>({
    resolver: zodResolver(jobCustomerUpdateSchema),
    values: job
      ? {
          pickup_location: job.pickup_location,
          dropoff_location: job.dropoff_location ?? "",
          description: job.description ?? "",
          customer_name: job.customer_name ?? "",
          customer_phone: job.customer_phone ?? "",
        }
      : undefined,
  })

  function onSubmit(data: JobCustomerUpdate) {
    // Only send fields that differ from current job
    const patch: JobCustomerUpdate = {}
    if (job) {
      for (const key of Object.keys(data) as (keyof JobCustomerUpdate)[]) {
        const incoming = data[key] ?? ""
        const current = (job[key as keyof typeof job] as string | null) ?? ""
        if (incoming !== current)
          (patch as Record<string, unknown>)[key] = incoming
      }
    }
    mutate(Object.keys(patch).length ? patch : data)
  }

  // ── Loading / error states ────────────────────────────────────

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <LoaderPinwheel className="size-8 animate-spin" />
          <p className="text-sm">Loading your job details…</p>
        </div>
      </PageShell>
    )
  }

  if (isError) {
    const msg =
      (error as { message?: string })?.message ?? "Something went wrong"
    const isExpired =
      msg.toLowerCase().includes("expired") ||
      msg.toLowerCase().includes("invalid")
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <LinkIcon className="size-8 text-destructive" />
          <h2 className="text-lg font-semibold">
            {isExpired ? "Link expired or invalid" : "Could not load job"}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {isExpired
              ? "This edit link has expired or is no longer valid. Please contact your recovery provider for a new link."
              : msg}
          </p>
        </div>
      </PageShell>
    )
  }

  // ── Success state ──────────────────────────────────────────────

  if (isSuccess) {
    return (
      <PageShell>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <CheckCircle2 className="size-10 text-green-500" />
          <h2 className="text-lg font-semibold">Details updated!</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Your changes have been saved and your recovery provider has been
            notified. You can close this page.
          </p>
          <Button
            variant={"outline"}
            onClick={() => {
              reset()
            }}
          >
            Update Again
          </Button>
        </div>

        {/* Show the log even on success */}
        {changelog && changelog.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Update log
              </h3>
              <div className="h-px flex-1 bg-foreground/10" />
            </div>
            <JobChangelog logs={changelog} isLoading={changelogLoading} />
          </div>
        )}
      </PageShell>
    )
  }

  // ── Form ───────────────────────────────────────────────────────

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Update job details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your current location, description, or contact details below.
          Your provider will be notified of any changes automatically.
        </p>
      </div>

      {/* Read-only context strip */}
      {job && (
        <div className="mb-6 space-y-1 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
          <p>
            <span className="font-medium">Service: </span>
            {job.service_type}
          </p>
          <p>
            <span className="font-medium">Vehicle: </span>
            {job.vehicle_make_model} ({job.vehicle_reg})
          </p>
          <p>
            <span className="font-medium">Status: </span>
            <span className="capitalize">{job.lead_status}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field data-invalid={!!errors.pickup_location}>
          <FieldLabel htmlFor="pickup_location">
            {FIELD_LABELS.pickup_location}
          </FieldLabel>
          <Input
            id="pickup_location"
            placeholder="e.g. A406, Brent Cross"
            {...register("pickup_location")}
            aria-invalid={!!errors.pickup_location}
          />
          {errors.pickup_location && (
            <FieldError errors={[errors.pickup_location]} />
          )}
        </Field>

        <Field data-invalid={!!errors.dropoff_location}>
          <FieldLabel htmlFor="dropoff_location">
            {FIELD_LABELS.dropoff_location}
          </FieldLabel>
          <Input
            id="dropoff_location"
            placeholder="e.g. Garage name & postcode, or 'On-site fix'"
            {...register("dropoff_location")}
          />
        </Field>

        <Field data-invalid={!!errors.description}>
          <FieldLabel htmlFor="description">
            {FIELD_LABELS.description}
          </FieldLabel>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe the breakdown, hazards, and anything the provider should know."
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.customer_name}>
            <FieldLabel htmlFor="customer_name">
              {FIELD_LABELS.customer_name}
            </FieldLabel>
            <Input
              id="customer_name"
              placeholder="John Doe"
              {...register("customer_name")}
            />
            {errors.customer_name && (
              <FieldError errors={[errors.customer_name]} />
            )}
          </Field>

          <Field data-invalid={!!errors.customer_phone}>
            <FieldLabel htmlFor="customer_phone">
              {FIELD_LABELS.customer_phone}
            </FieldLabel>
            <Input
              id="customer_phone"
              type="tel"
              placeholder="(123) 456-7890"
              {...register("customer_phone")}
            />
            {errors.customer_phone && (
              <FieldError errors={[errors.customer_phone]} />
            )}
          </Field>
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <LoaderPinwheel className="mr-2 size-4 animate-spin" />}
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>

      {/* Update log */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Update log</h3>
          <div className="h-px flex-1 bg-foreground/10" />
        </div>
        <ScrollArea className="h-64">
          <JobChangelog logs={changelog} isLoading={changelogLoading} />
          <ScrollBar />
        </ScrollArea>
      </div>
    </PageShell>
  )
}

// ── Layout wrapper ────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <div className="flex flex-col leading-none">
            <p className="text-xl font-black tracking-tight text-foreground">
              RECo
            </p>
            <p className="text-[9px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Recovery Platform
            </p>
          </div>
        </div>
      </header>
      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-8">{children}</main>
    </div>
  )
}
