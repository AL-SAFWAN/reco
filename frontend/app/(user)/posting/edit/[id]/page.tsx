"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Coins,
  History,
  Info,
  Link2,
  Loader2,
  LoaderPinwheel,
} from "lucide-react"
import {
  SERVICE_TYPES,
  VEHICLE_CLASSES,
  URGENCY_OPTIONS,
  AREAS,
} from "@/lib/job-data"
import {
  jobCreateSchema,
  statusLabels,
  statusSchema,
  type JobCreate,
} from "@/features/job/schema/jobSchema"
import {
  useJobChangelogQuery,
  useJobQuery,
  useSendEditLinkMutation,
  useUpdateJobMutation,
} from "@/features/job/hooks/job"
import { JobChangelog } from "@/features/job/components/job-changelog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Form card ─────────────────────────────────────────────────────

function FormCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      <div className="border-b px-5 py-3.5">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          {title}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: job, isLoading } = useJobQuery(id)
  const { mutate, isPending } = useUpdateJobMutation()
  const { mutate: sendEditLink, isPending: isSendingLink } =
    useSendEditLinkMutation()
  const { data: changelogData, isLoading: changelogLoading } =
    useJobChangelogQuery(id)
  const changelog = changelogData ?? []

  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const pendingCloseRef = { onChange: (_v: string) => {} }

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    values: job,
  })

  const isAlreadyClosed = job?.lead_status === "closed"

  function onSubmit(data: JobCreate) {
    mutate({ id, body: data }, { onSuccess: () => router.push("/posting") })
  }

  return (
    <>
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-10 border-b bg-foreground">
        <div className="mx-auto flex max-w-(--breakpoint-xl) items-center gap-4 px-4 py-3 sm:px-8">
          <Button
            variant="link"
            size="sm"
            className="gap-1.5 px-0 text-background"
            onClick={() => router.push("/posting")}
          >
            <ArrowLeft className="size-4" />
            Jobs
          </Button>
          <div className="h-4 w-px bg-background" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-background">
              Edit Job Posting
            </p>
            <p className="truncate font-mono text-[10px] text-background/70">
              {id}
            </p>
          </div>
          {job && (
            <div className="flex items-center gap-2">
              {job.customer_email && (
                <Button
                  type="button"
                  variant="default"
                  className="bg-muted-foreground/30 text-background hover:bg-muted-foreground/50"
                  size="sm"
                  disabled={isSendingLink || isPending}
                  onClick={() => sendEditLink(job.id)}
                >
                  {isSendingLink ? (
                    <LoaderPinwheel className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <Link2 className="mr-1.5 size-3.5" />
                  )}
                  {isSendingLink ? "Sending…" : "Resend edit link"}
                </Button>
              )}
              <Button
                type="submit"
                className="bg-muted-foreground/30 text-background hover:bg-muted-foreground/50"
                form="edit-job-form"
                size="sm"
                disabled={isPending}
              >
                {isPending && (
                  <LoaderPinwheel className="mr-1.5 size-3.5 animate-spin" />
                )}
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {isLoading || !job ? (
          <div className="flex min-h-60 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground/40" />
          </div>
        ) : (
          <form
            id="edit-job-form"
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-6 lg:grid-cols-[1fr_300px]"
          >
            {/* ── Left: form cards ── */}
            <div className="space-y-4">
              {/* Customer */}
              <FormCard title="Customer">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field data-invalid={!!errors.customer_name}>
                    <FieldLabel htmlFor="customer_name">Name</FieldLabel>
                    <Input
                      id="customer_name"
                      placeholder="John Doe"
                      autoComplete="name"
                      {...register("customer_name")}
                      aria-invalid={!!errors.customer_name}
                    />
                    {errors.customer_name && (
                      <FieldError errors={[errors.customer_name]} />
                    )}
                  </Field>
                  <Field data-invalid={!!errors.customer_phone}>
                    <FieldLabel htmlFor="customer_phone">Phone</FieldLabel>
                    <Input
                      id="customer_phone"
                      placeholder="(123) 456-7890"
                      type="tel"
                      autoComplete="tel"
                      {...register("customer_phone")}
                      aria-invalid={!!errors.customer_phone}
                    />
                    {errors.customer_phone && (
                      <FieldError errors={[errors.customer_phone]} />
                    )}
                  </Field>
                  <Field data-invalid={!!errors.customer_email}>
                    <FieldLabel htmlFor="customer_email">Email</FieldLabel>
                    <Input
                      id="customer_email"
                      placeholder="customer@example.com"
                      type="email"
                      autoComplete="email"
                      {...register("customer_email")}
                      aria-invalid={!!errors.customer_email}
                    />
                    {errors.customer_email && (
                      <FieldError errors={[errors.customer_email]} />
                    )}
                  </Field>
                </div>
                <div className="mt-4">
                  <Controller
                    name="send_email_notification"
                    control={control}
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id="send_email_notification"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel
                          htmlFor="send_email_notification"
                          className="cursor-pointer"
                        >
                          Notify customer by email
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="size-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Sends the customer a link to update the job
                              details themselves.
                            </TooltipContent>
                          </Tooltip>
                        </FieldLabel>
                      </Field>
                    )}
                  />
                </div>
              </FormCard>

              {/* Service & Vehicle */}
              <FormCard title="Service & Vehicle">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="service_type"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="service_type">
                          Service type
                        </FieldLabel>
                        <Select
                          key={field.value ?? "empty"}
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="service_type"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SERVICE_TYPES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="urgency"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="urgency">Urgency</FieldLabel>
                        <Select
                          key={field.value ?? "empty"}
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="urgency"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {URGENCY_OPTIONS.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Controller
                    name="vehicle_class"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="vehicle_class">Class</FieldLabel>
                        <Select
                          key={field.value ?? "empty"}
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="vehicle_class"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_CLASSES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Field data-invalid={!!errors.vehicle_make_model}>
                    <FieldLabel htmlFor="vehicle_make_model">
                      Make &amp; model
                    </FieldLabel>
                    <Input
                      id="vehicle_make_model"
                      placeholder="e.g. Ford Transit (2020)"
                      aria-invalid={!!errors.vehicle_make_model}
                      {...register("vehicle_make_model")}
                    />
                    {errors.vehicle_make_model && (
                      <FieldError errors={[errors.vehicle_make_model]} />
                    )}
                  </Field>
                  <Field data-invalid={!!errors.vehicle_reg}>
                    <FieldLabel htmlFor="vehicle_reg">Registration</FieldLabel>
                    <Input
                      id="vehicle_reg"
                      placeholder="e.g. AB12 CDE"
                      aria-invalid={!!errors.vehicle_reg}
                      {...register("vehicle_reg", {
                        setValueAs: (v: string) => v.toUpperCase(),
                      })}
                    />
                    {errors.vehicle_reg && (
                      <FieldError errors={[errors.vehicle_reg]} />
                    )}
                  </Field>
                </div>
                <div className="mt-4">
                  <Controller
                    name="is_drivable"
                    control={control}
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id="is_drivable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <FieldLabel
                          htmlFor="is_drivable"
                          className="cursor-pointer"
                        >
                          Vehicle is drivable
                        </FieldLabel>
                      </Field>
                    )}
                  />
                </div>
              </FormCard>

              {/* Locations */}
              <FormCard title="Locations">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!errors.pickup_location}>
                    <FieldLabel htmlFor="pickup_location">
                      Pickup location
                    </FieldLabel>
                    <Input
                      id="pickup_location"
                      placeholder="e.g. A406, Brent Cross"
                      aria-invalid={!!errors.pickup_location}
                      {...register("pickup_location")}
                    />
                    {errors.pickup_location && (
                      <FieldError errors={[errors.pickup_location]} />
                    )}
                  </Field>
                  <Controller
                    name="pickup_area"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="pickup_area">Area</FieldLabel>
                        <Select
                          key={field.value ?? "empty"}
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="pickup_area"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AREAS.map((a) => (
                              <SelectItem key={a} value={a}>
                                {a}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Field data-invalid={!!errors.dropoff_location}>
                    <FieldLabel htmlFor="dropoff_location">
                      Drop-off location
                    </FieldLabel>
                    <Input
                      id="dropoff_location"
                      placeholder="e.g. Garage name & postcode, or 'On-site fix'"
                      aria-invalid={!!errors.dropoff_location}
                      {...register("dropoff_location")}
                    />
                    {errors.dropoff_location && (
                      <FieldError errors={[errors.dropoff_location]} />
                    )}
                  </Field>
                </div>
              </FormCard>

              {/* Pricing */}
              <FormCard title="Pricing">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field data-invalid={!!errors.lead_price}>
                    <FieldLabel htmlFor="lead_price">
                      <span className="inline-flex items-center gap-1">
                        Lead price <Coins className="size-3" />
                      </span>
                    </FieldLabel>
                    <Input
                      id="lead_price"
                      type="number"
                      min={0}
                      aria-invalid={!!errors.lead_price}
                      {...register("lead_price", { valueAsNumber: true })}
                    />
                    {errors.lead_price && (
                      <FieldError errors={[errors.lead_price]} />
                    )}
                  </Field>
                  <Field data-invalid={!!errors.estimated_payout}>
                    <FieldLabel htmlFor="estimated_payout">
                      Payout (£)
                    </FieldLabel>
                    <Input
                      id="estimated_payout"
                      type="number"
                      min={0}
                      aria-invalid={!!errors.estimated_payout}
                      {...register("estimated_payout", { valueAsNumber: true })}
                    />
                    {errors.estimated_payout && (
                      <FieldError errors={[errors.estimated_payout]} />
                    )}
                  </Field>
                  <Field data-invalid={!!errors.distance_miles}>
                    <FieldLabel htmlFor="distance_miles">
                      Distance (mi)
                    </FieldLabel>
                    <Input
                      id="distance_miles"
                      type="number"
                      min={0}
                      step={0.1}
                      aria-invalid={!!errors.distance_miles}
                      {...register("distance_miles", { valueAsNumber: true })}
                    />
                    {errors.distance_miles && (
                      <FieldError errors={[errors.distance_miles]} />
                    )}
                  </Field>
                </div>
              </FormCard>

              {/* Description */}
              <FormCard title="Description">
                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="description">
                    Notes &amp; details
                  </FieldLabel>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Describe the breakdown, hazards, and anything the provider should know."
                    aria-invalid={!!errors.description}
                    {...register("description")}
                  />
                  {errors.description && (
                    <FieldError errors={[errors.description]} />
                  )}
                </Field>
              </FormCard>
            </div>

            {/* ── Right: status + changelog ── */}
            <div className="space-y-4 lg:sticky lg:top-14 lg:self-start">
              {/* Status card */}
              <FormCard title="Status">
                <Controller
                  name="lead_status"
                  control={control}
                  render={({ field, fieldState }) => {
                    pendingCloseRef.onChange = field.onChange
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead_status">
                          Job status
                        </FieldLabel>
                        <Select
                          key={field.value ?? "empty"}
                          name={field.name}
                          value={field.value}
                          disabled={isAlreadyClosed}
                          onValueChange={(v) => {
                            if (v === "closed" && !isAlreadyClosed) {
                              setCloseConfirmOpen(true)
                            } else {
                              field.onChange(v)
                            }
                          }}
                        >
                          <SelectTrigger
                            id="lead_status"
                            aria-invalid={fieldState.invalid}
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusSchema.options.map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                                disabled={isAlreadyClosed && s !== "closed"}
                              >
                                {statusLabels[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAlreadyClosed && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            This job is closed and cannot be re-opened.
                          </p>
                        )}
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )
                  }}
                />
              </FormCard>

              {/* Changelog card */}
              <div className="rounded-xl border bg-card">
                <div className="flex items-center gap-2 border-b px-5 py-3.5">
                  <History className="size-3.5 text-muted-foreground" />
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Update log
                  </p>
                  {changelog.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {changelog.length}
                    </Badge>
                  )}
                </div>
                <div className="max-h-120 overflow-y-auto p-5">
                  <JobChangelog logs={changelog} isLoading={changelogLoading} />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ── Close-job confirmation ── */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this job?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Closing a job is{" "}
                  <strong className="text-foreground">permanent</strong> — it
                  cannot be re-opened.
                </p>
                <p>
                  Once closed, any users who have already purchased this lead
                  will be able to see the full job details. No new purchases
                  will be accepted.
                </p>
                <p>Are you sure you want to close this job?</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCloseConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                pendingCloseRef.onChange("closed")
                setCloseConfirmOpen(false)
              }}
            >
              Yes, close job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
