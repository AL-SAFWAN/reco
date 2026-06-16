"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  Controller,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Coins, Info, Link2, LoaderPinwheel, Plus } from "lucide-react"
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
  type Job,
  type JobCreate,
} from "../../schema/jobSchema"
import {
  useCreateJobMutation,
  useJobChangelogQuery,
  useSendEditLinkMutation,
  useUpdateJobMutation,
} from "../../hooks/job"
import { JobChangelog } from "../../components/job-changelog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Accordion,
} from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// ── Shared form fields ────────────────────────────────────────────

function JobFormFields({
  register,
  control,
  errors,
}: {
  register: UseFormRegister<JobCreate>
  control: Control<JobCreate>
  errors: FieldErrors<JobCreate>
}) {
  return (
    <div className="grid gap-5 overflow-y-auto px-6 pt-5 pb-5">
      {/* customer */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={!!errors.customer_name}>
          <FieldLabel htmlFor="customer_name">Name</FieldLabel>
          <Input
            id="customer_name"
            placeholder="John Doe"
            type="text"
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect="off"
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
            autoCapitalize="none"
            autoComplete="tel"
            autoCorrect="off"
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
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            {...register("customer_email")}
            aria-invalid={!!errors.customer_email}
          />
          {errors.customer_email && (
            <FieldError errors={[errors.customer_email]} />
          )}
        </Field>
        <Controller
          name="send_email_notification"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal" className="col-span-full">
              <Checkbox
                id="send_email_notification"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FieldLabel
                htmlFor="send_email_notification"
                className="cursor-pointer font-medium"
              >
                Send email notification to customer to update Job details
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    If checked, the customer will receive an email with a link
                    to update the job details themselves. This can help reduce
                    back-and-forth communication between the provider and
                    customer, and ensure the job information is accurate and
                    up-to-date.
                  </TooltipContent>
                </Tooltip>
              </FieldLabel>
            </Field>
          )}
        />
      </div>
      {/* Service + Urgency */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="service_type"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="service_type">Service type</FieldLabel>
              <Select
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      {/* Vehicle */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Controller
          name="vehicle_class"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="vehicle_class">Vehicle class</FieldLabel>
              <Select
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field data-invalid={!!errors.vehicle_make_model}>
          <FieldLabel htmlFor="vehicle_make_model">Make &amp; model</FieldLabel>
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
          {errors.vehicle_reg && <FieldError errors={[errors.vehicle_reg]} />}
        </Field>
      </div>

      {/* Locations */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.pickup_location}>
          <FieldLabel htmlFor="pickup_location">Pickup location</FieldLabel>
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <Field data-invalid={!!errors.dropoff_location}>
        <FieldLabel htmlFor="dropoff_location">Drop-off location</FieldLabel>
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

      {/* Pricing + Distance */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={!!errors.lead_price}>
          <FieldLabel htmlFor="lead_price">
            <span className="inline-flex items-center gap-0.5">
              Lead price (<Coins className="size-4" />)
            </span>
          </FieldLabel>
          <Input
            id="lead_price"
            type="number"
            min={0}
            aria-invalid={!!errors.lead_price}
            {...register("lead_price", { valueAsNumber: true })}
          />
          {errors.lead_price && <FieldError errors={[errors.lead_price]} />}
        </Field>
        <Field data-invalid={!!errors.estimated_payout}>
          <FieldLabel htmlFor="estimated_payout">
            Estimated payout (£)
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
          <FieldLabel htmlFor="distance_miles">Distance (miles)</FieldLabel>
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

      {/* Drivable */}
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
              className="cursor-pointer font-medium"
            >
              Vehicle is drivable
            </FieldLabel>
          </Field>
        )}
      />

      {/* Description */}
      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Description &amp; notes</FieldLabel>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the breakdown, hazards, and anything the provider should know."
          aria-invalid={!!errors.description}
          {...register("description")}
        />
        {errors.description && <FieldError errors={[errors.description]} />}
      </Field>
    </div>
  )
}

// ── Create Form (no dialog wrapper — used by the routing-modal pattern) ──────

export function CreateJobForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void
  onCancel: () => void
}) {
  const { mutate, isPending } = useCreateJobMutation()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      service_type: "Towing & Transport",
      urgency: "Immediate",
      vehicle_class: "Car",
      is_drivable: true,
      pickup_area: AREAS[0],
      lead_price: 10,
      estimated_payout: 120,
      distance_miles: 0,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      send_email_notification: true,
    },
  })

  function onSubmit(data: JobCreate) {
    mutate(data, {
      onSuccess: () => {
        reset()
        onSuccess()
      },
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <JobFormFields register={register} control={control} errors={errors} />
      <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && (
            <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isPending ? "Posting..." : "Post job"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ── Create Dialog ─────────────────────────────────────────────────

export function CreateJobDialog() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [open, setOpen] = useState(searchParams.get("create") === "true")
  const { mutate, isPending } = useCreateJobMutation()

  function handleOpenChange(value: boolean) {
    setOpen(value)
    if (!value && searchParams.get("create") === "true") {
      router.replace("/posting", { scroll: false })
    }
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: {
      service_type: "Towing & Transport",
      urgency: "Immediate",
      vehicle_class: "Car",
      is_drivable: true,
      pickup_area: AREAS[0],
      lead_price: 10,
      estimated_payout: 120,
      distance_miles: 0,
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      send_email_notification: true,
    },
  })

  function onSubmit(data: JobCreate) {
    mutate(data, {
      onSuccess: () => {
        reset()
        setOpen(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Add Job Posting
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Post a recovery job</DialogTitle>
          <DialogDescription>
            Provide the breakdown details. Service providers will be able to buy
            this job lead.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <JobFormFields
            register={register}
            control={control}
            errors={errors}
          />
          <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isPending ? "Posting..." : "Post job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Edit Form (no dialog wrapper — used by the routing-modal pattern) ────────

export function EditJobForm({
  job,
  onSuccess,
  onCancel,
}: {
  job: Job
  onSuccess: () => void
  onCancel: () => void
}) {
  const { mutate, isPending } = useUpdateJobMutation()
  const { mutate: sendEditLink, isPending: isSendingLink } =
    useSendEditLinkMutation()
  const { data: changelog = [], isLoading: changelogLoading } =
    useJobChangelogQuery(job.id)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const pendingCloseRef = { onChange: (_v: string) => {} }

  const isAlreadyClosed = job.lead_status === "closed"

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: job,
  })

  function onSubmit(data: JobCreate) {
    mutate({ id: job.id, body: data }, { onSuccess })
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={"relative flex min-h-0 flex-1 flex-col pt-4"}
      >
        <div className="border-b px-6 pb-3 sm:border-b-0 sm:pb-0">
          {/* Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              name="lead_status"
              control={control}
              render={({ field, fieldState }) => {
                pendingCloseRef.onChange = field.onChange
                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                    <Select
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
                      <p className="mt-1 text-xs text-muted-foreground">
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
          </div>
        </div>
        <JobFormFields register={register} control={control} errors={errors} />
        {/* Update log */}
        <Accordion type="single" collapsible className={"border-t"}>
          <AccordionItem value="item-1" className="px-6 py-2">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Update log
                </h3>
                <div className="h-px flex-1 bg-foreground/5" />
              </div>
            </AccordionTrigger>
            <AccordionContent className="">
              <ScrollArea
                className={
                  changelog && changelog.length > 0 ? "h-64" : "h-auto"
                }
              >
                <JobChangelog logs={changelog} isLoading={changelogLoading} />
                <ScrollBar />
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <DialogFooter className={"mx-0 mb-0 px-6 py-4"}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          {job.customer_email && (
            <Button
              type="button"
              variant="secondary"
              disabled={isSendingLink || isPending}
              onClick={() => sendEditLink(job.id)}
            >
              {isSendingLink ? (
                <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              {isSendingLink ? "Sending…" : "Resend edit link"}
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </form>

      {/* Close-job confirmation */}
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

// ── Edit Dialog ───────────────────────────────────────────────────

export function EditJobDialog({
  job,
  open,
  onOpenChange,
}: {
  job: Job
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutate, isPending } = useUpdateJobMutation()
  const { mutate: sendEditLink, isPending: isSendingLink } =
    useSendEditLinkMutation()
  const { data: changelog = [], isLoading: changelogLoading } =
    useJobChangelogQuery(open ? job.id : undefined)
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)
  const pendingCloseRef = { onChange: (_v: string) => {} }

  const isAlreadyClosed = job.lead_status === "closed"

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobCreate>({
    resolver: zodResolver(jobCreateSchema),
    defaultValues: job,
  })

  useEffect(() => {
    if (open) reset(job)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function onSubmit(data: JobCreate) {
    mutate({ id: job.id, body: data }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Edit job posting</DialogTitle>
            <DialogDescription>
              Updating
              <span className="font-mono text-xs text-muted-foreground italic">
                {" "}
                {job.id}{" "}
              </span>
              job
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="grid gap-5 overflow-y-auto px-6">
              {/* Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  name="lead_status"
                  control={control}
                  render={({ field, fieldState }) => {
                    pendingCloseRef.onChange = field.onChange
                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="lead_status">Status</FieldLabel>
                        <Select
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
                          <p className="mt-1 text-xs text-muted-foreground">
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
              </div>
            </div>
            <JobFormFields
              register={register}
              control={control}
              errors={errors}
            />
            {/* Update log */}
            <Accordion type="single" collapsible className="border-t px-6 py-2">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Update log
                    </h3>
                    <div className="h-px flex-1 bg-foreground/5" />
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea
                    className={
                      changelog && changelog.length > 0 ? "h-64" : "h-auto"
                    }
                  >
                    <JobChangelog
                      logs={changelog}
                      isLoading={changelogLoading}
                    />
                    <ScrollBar />
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <DialogFooter className="mx-0 mb-0 border-t px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {job.customer_email && (
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSendingLink || isPending}
                  onClick={() => sendEditLink(job.id)}
                >
                  {isSendingLink ? (
                    <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="mr-2 h-4 w-4" />
                  )}
                  {isSendingLink ? "Sending…" : "Resend edit link"}
                </Button>
              )}
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <LoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Close-job confirmation */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Close this job?</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Closing a job is{" "}
                  <strong className="text-foreground">permanent</strong> it
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
